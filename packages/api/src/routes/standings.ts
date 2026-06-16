import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember } from '../middleware/leagueAccess';

const prisma = new PrismaClient();

export const standingsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/standings', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;

    const teams = await prisma.team.findMany({
      where: { leagueId },
      include: {
        owner: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: [{ wins: 'desc' }, { pointsFor: 'desc' }],
    });

    return teams.map((t, i) => ({
      rank: i + 1,
      team: t,
      record: `${t.wins}-${t.losses}${t.ties > 0 ? `-${t.ties}` : ''}`,
      pct: t.wins + t.losses + t.ties > 0
        ? ((t.wins + t.ties * 0.5) / (t.wins + t.losses + t.ties)).toFixed(3)
        : '.000',
    }));
  });

  server.get('/:leagueId/matchups', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { week } = request.query as { week?: string };

    return prisma.matchup.findMany({
      where: { leagueId, ...(week ? { week: parseInt(week) } : {}) },
      include: {
        homeTeam: { include: { owner: { select: { displayName: true } } } },
        awayTeam: { include: { owner: { select: { displayName: true } } } },
      },
      orderBy: { week: 'desc' },
    });
  });

  server.get('/:leagueId/matchups/:matchupId', { preHandler: requireLeagueMember }, async (request: any) => {
    const { matchupId } = request.params;
    return prisma.matchup.findUnique({
      where: { id: matchupId },
      include: {
        homeTeam: {
          include: {
            owner: { select: { displayName: true } },
            roster: { include: { player: true } },
          },
        },
        awayTeam: {
          include: {
            owner: { select: { displayName: true } },
            roster: { include: { player: true } },
          },
        },
      },
    });
  });
};
