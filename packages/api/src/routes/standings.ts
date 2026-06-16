import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember } from '../middleware/leagueAccess';

const prisma = new PrismaClient();

function maskOwner(
  owner: { id: string; displayName: string; avatarUrl?: string | null } | null,
  isCommissioner: boolean,
  anonymousManagers: boolean,
) {
  if (!owner) return owner;
  if (!anonymousManagers || isCommissioner) return owner;
  return { id: owner.id, displayName: 'Manager', avatarUrl: null };
}

async function isCommissioner(leagueId: string, userId: string): Promise<boolean> {
  const member = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
  });
  return member?.role === 'COMMISSIONER';
}

export const standingsRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/standings', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;

    const [settings, commissioner] = await Promise.all([
      prisma.leagueSettings.findUnique({ where: { leagueId } }),
      isCommissioner(leagueId, request.userId),
    ]);

    const anon = settings?.anonymousManagers ?? false;

    const teams = await prisma.team.findMany({
      where: { leagueId },
      include: {
        owner: { select: { id: true, displayName: true, avatarUrl: true } },
      },
      orderBy: [{ wins: 'desc' }, { pointsFor: 'desc' }],
    });

    return teams.map((t, i) => ({
      rank: i + 1,
      team: { ...t, owner: maskOwner(t.owner, commissioner, anon) },
      record: `${t.wins}-${t.losses}${t.ties > 0 ? `-${t.ties}` : ''}`,
      pct:
        t.wins + t.losses + t.ties > 0
          ? ((t.wins + t.ties * 0.5) / (t.wins + t.losses + t.ties)).toFixed(3)
          : '.000',
    }));
  });

  server.get('/:leagueId/matchups', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { week } = request.query as { week?: string };

    const [settings, commissioner] = await Promise.all([
      prisma.leagueSettings.findUnique({ where: { leagueId } }),
      isCommissioner(leagueId, request.userId),
    ]);

    const anon = settings?.anonymousManagers ?? false;

    const matchups = await prisma.matchup.findMany({
      where: { leagueId, ...(week ? { week: parseInt(week) } : {}) },
      include: {
        homeTeam: { include: { owner: { select: { id: true, displayName: true, avatarUrl: true } } } },
        awayTeam: { include: { owner: { select: { id: true, displayName: true, avatarUrl: true } } } },
      },
      orderBy: { week: 'desc' },
    });

    return matchups.map((m) => ({
      ...m,
      homeTeam: { ...m.homeTeam, owner: maskOwner(m.homeTeam.owner, commissioner, anon) },
      awayTeam: { ...m.awayTeam, owner: maskOwner(m.awayTeam.owner, commissioner, anon) },
    }));
  });

  server.get('/:leagueId/matchups/:matchupId', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId, matchupId } = request.params;

    const [settings, commissioner] = await Promise.all([
      prisma.leagueSettings.findUnique({ where: { leagueId } }),
      isCommissioner(leagueId, request.userId),
    ]);

    const anon = settings?.anonymousManagers ?? false;

    const matchup = await prisma.matchup.findUnique({
      where: { id: matchupId },
      include: {
        homeTeam: {
          include: {
            owner: { select: { id: true, displayName: true, avatarUrl: true } },
            roster: { include: { player: true } },
          },
        },
        awayTeam: {
          include: {
            owner: { select: { id: true, displayName: true, avatarUrl: true } },
            roster: { include: { player: true } },
          },
        },
      },
    });

    if (!matchup) return null;

    return {
      ...matchup,
      homeTeam: { ...matchup.homeTeam, owner: maskOwner(matchup.homeTeam.owner, commissioner, anon) },
      awayTeam: { ...matchup.awayTeam, owner: maskOwner(matchup.awayTeam.owner, commissioner, anon) },
    };
  });
};
