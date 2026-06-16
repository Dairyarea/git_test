import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember } from '../middleware/leagueAccess';

const prisma = new PrismaClient();

export const rosterRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/teams', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    return prisma.team.findMany({
      where: { leagueId },
      include: {
        owner: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: [{ wins: 'desc' }, { pointsFor: 'desc' }],
    });
  });

  server.get('/:leagueId/teams/mine', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const team = await prisma.team.findFirst({
      where: { leagueId, ownerId: request.userId },
      include: {
        roster: {
          include: {
            player: true,
          },
          orderBy: { slotType: 'asc' },
        },
      },
    });
    return team;
  });

  server.get('/:leagueId/teams/:teamId/roster', { preHandler: requireLeagueMember }, async (request: any) => {
    const { teamId } = request.params;
    return prisma.rosterSlot.findMany({
      where: { teamId },
      include: { player: true },
      orderBy: { slotType: 'asc' },
    });
  });

  server.put('/:leagueId/teams/mine/lineup', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { lineup } = request.body as { lineup: Array<{ playerId: string; slotType: string }> };

    const team = await prisma.team.findFirst({
      where: { leagueId, ownerId: request.userId },
    });
    if (!team) return request.server.httpErrors?.notFound('Team not found');

    await prisma.$transaction(
      lineup.map((slot) =>
        prisma.rosterSlot.updateMany({
          where: { teamId: team.id, playerId: slot.playerId },
          data: { slotType: slot.slotType },
        }),
      ),
    );

    return { success: true };
  });

  server.post('/:leagueId/teams/mine/drop', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { playerId } = request.body as { playerId: string };

    const team = await prisma.team.findFirst({ where: { leagueId, ownerId: request.userId } });
    if (!team) return { error: 'Team not found' };

    await prisma.rosterSlot.deleteMany({ where: { teamId: team.id, playerId } });
    return { success: true };
  });

  server.put('/:leagueId/teams/mine/name', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { name } = request.body as { name: string };

    const team = await prisma.team.findFirst({ where: { leagueId, ownerId: request.userId } });
    if (!team) return { error: 'Team not found' };

    return prisma.team.update({ where: { id: team.id }, data: { name } });
  });
};
