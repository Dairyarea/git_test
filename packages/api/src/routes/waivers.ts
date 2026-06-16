import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember, requireCommissioner } from '../middleware/leagueAccess';
import { processWaiverClaims } from '../services/waiver.service';

const prisma = new PrismaClient();

export const waiverRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/waivers', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { week } = request.query as { week?: string };

    return prisma.waiverClaim.findMany({
      where: { leagueId, ...(week ? { week: parseInt(week) } : {}) },
      include: {
        team: { select: { id: true, name: true } },
      },
      orderBy: [{ week: 'desc' }, { priority: 'asc' }],
    });
  });

  server.post('/:leagueId/waivers', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { leagueId } = request.params;
    const { addPlayerId, dropPlayerId, faabBid, week } = request.body as {
      addPlayerId: string;
      dropPlayerId?: string;
      faabBid?: number;
      week: number;
    };

    const team = await prisma.team.findFirst({ where: { leagueId, ownerId: request.userId } });
    if (!team) return reply.code(404).send({ error: 'Team not found' });

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { settings: true },
    });

    if (league?.settings?.waiverType === 'FAAB') {
      if (faabBid == null) return reply.code(400).send({ error: 'FAAB bid required' });
      if (faabBid > team.faabRemaining) {
        return reply.code(400).send({ error: 'Insufficient FAAB budget' });
      }
    }

    const existingCount = await prisma.waiverClaim.count({
      where: { teamId: team.id, week, status: 'PENDING' },
    });

    const claim = await prisma.waiverClaim.create({
      data: {
        leagueId,
        teamId: team.id,
        addPlayerId,
        dropPlayerId,
        faabBid,
        priority: existingCount + 1,
        week,
      },
    });

    reply.code(201);
    return claim;
  });

  server.delete('/:leagueId/waivers/:claimId', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { claimId } = request.params;
    const claim = await prisma.waiverClaim.findUnique({
      where: { id: claimId },
      include: { team: true },
    });
    if (!claim) return reply.code(404).send({ error: 'Claim not found' });
    if (claim.team.ownerId !== request.userId) return reply.code(403).send({ error: 'Not your claim' });
    if (claim.status !== 'PENDING') return reply.code(400).send({ error: 'Claim already processed' });

    await prisma.waiverClaim.delete({ where: { id: claimId } });
    return { success: true };
  });

  server.post('/:leagueId/waivers/process', { preHandler: requireCommissioner }, async (request: any) => {
    const { leagueId } = request.params;
    const { week } = request.body as { week: number };
    await processWaiverClaims(leagueId, week);
    return { success: true };
  });
};
