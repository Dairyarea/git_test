import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const playerRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', async (request) => {
    const { q, position, status, leagueId, page = '1', limit = '25' } = request.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { nflTeam: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (position) where.position = position;
    if (status) where.status = status;

    const [players, total] = await Promise.all([
      prisma.player.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { name: 'asc' },
      }),
      prisma.player.count({ where }),
    ]);

    let ownedPlayerIds = new Set<string>();
    let rosterMap = new Map<string, string>();
    if (leagueId) {
      const slots = await prisma.rosterSlot.findMany({
        where: { team: { leagueId } },
        include: { team: { select: { name: true } } },
      });
      for (const slot of slots) {
        ownedPlayerIds.add(slot.playerId);
        rosterMap.set(slot.playerId, slot.team.name);
      }
    }

    return {
      players: players.map((p) => ({
        ...p,
        isOwned: ownedPlayerIds.has(p.id),
        ownerTeamName: rosterMap.get(p.id),
      })),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    };
  });

  server.get('/:playerId', async (request: any) => {
    const { playerId } = request.params;
    return prisma.player.findUnique({ where: { id: playerId } });
  });

  server.get('/:playerId/stats/:week', async (request: any) => {
    const { playerId, week } = request.params;
    const player = await prisma.player.findUnique({ where: { id: playerId } });
    if (!player) return null;
    const stats = player.weeklyStats as Record<string, unknown>;
    return { week: parseInt(week), stats: stats[week] || {} };
  });
};
