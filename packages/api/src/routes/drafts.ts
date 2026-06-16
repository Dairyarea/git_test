import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember, requireCommissioner } from '../middleware/leagueAccess';

const prisma = new PrismaClient();

export const draftRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/draft', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const [config, picks] = await Promise.all([
      prisma.draftConfig.findUnique({ where: { leagueId } }),
      prisma.draftPick.findMany({
        where: { leagueId },
        include: { player: true, team: true },
        orderBy: { pick: 'asc' },
      }),
    ]);
    return { config, picks };
  });

  server.put('/:leagueId/draft/config', { preHandler: requireCommissioner }, async (request: any) => {
    const { leagueId } = request.params;
    const body = request.body as any;
    return prisma.draftConfig.update({
      where: { leagueId },
      data: body,
    });
  });

  server.post('/:leagueId/draft/start', { preHandler: requireCommissioner }, async (request: any, reply) => {
    const { leagueId } = request.params;
    const config = await prisma.draftConfig.findUnique({ where: { leagueId } });
    if (!config) return reply.code(404).send({ error: 'Draft config not found' });
    if (config.status !== 'PENDING') return reply.code(400).send({ error: 'Draft already started' });

    const teams = await prisma.team.findMany({ where: { leagueId }, select: { id: true } });
    const draftOrder = shuffleArray(teams.map((t) => t.id));

    return prisma.draftConfig.update({
      where: { leagueId },
      data: { status: 'LIVE', draftOrder, currentPick: 0 },
    });
  });

  server.post('/:leagueId/draft/pick', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { leagueId } = request.params;
    const { playerId } = request.body as { playerId: string };

    const config = await prisma.draftConfig.findUnique({ where: { leagueId } });
    if (!config || config.status !== 'LIVE') {
      return reply.code(400).send({ error: 'Draft is not live' });
    }

    const draftOrder = config.draftOrder as string[];
    const currentTeamId = getPickTeam(draftOrder, config.currentPick, config.type, config.rounds);

    const myTeam = await prisma.team.findFirst({ where: { leagueId, ownerId: request.userId } });
    if (!myTeam || myTeam.id !== currentTeamId) {
      return reply.code(403).send({ error: 'Not your pick' });
    }

    const alreadyPicked = await prisma.draftPick.findFirst({ where: { leagueId, playerId } });
    if (alreadyPicked) return reply.code(409).send({ error: 'Player already drafted' });

    const round = Math.floor(config.currentPick / draftOrder.length) + 1;

    const [pick] = await prisma.$transaction([
      prisma.draftPick.create({
        data: {
          leagueId,
          teamId: currentTeamId,
          playerId,
          round,
          pick: config.currentPick + 1,
        },
        include: { player: true, team: true },
      }),
      prisma.rosterSlot.create({
        data: {
          teamId: currentTeamId,
          playerId,
          status: 'BENCH',
          slotType: 'BN',
          acquiredVia: 'DRAFT',
        },
      }),
      prisma.draftConfig.update({
        where: { leagueId },
        data: {
          currentPick: config.currentPick + 1,
          status:
            config.currentPick + 1 >= config.rounds * draftOrder.length ? 'COMPLETE' : 'LIVE',
        },
      }),
    ]);

    return pick;
  });
};

function getPickTeam(order: string[], pickIndex: number, type: string, rounds: number): string {
  const teamCount = order.length;
  const round = Math.floor(pickIndex / teamCount);
  const posInRound = pickIndex % teamCount;

  if (type === 'SNAKE' && round % 2 === 1) {
    return order[teamCount - 1 - posInRound];
  }
  return order[posInRound];
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
