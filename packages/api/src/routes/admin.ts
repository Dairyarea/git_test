import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
  fetchNFLTeams,
  fetchPlayersByTeam,
  fetchGamesByWeek,
  fetchGamePlayerStats,
  mapPosition,
  mapStatus,
  mapGameStatsToScoringKeys,
} from '../services/apiSports.service';

const prisma = new PrismaClient();

// Minimal guard: requires a logged-in user. Tighten to commissioner check before going public.
export const adminRoutes: FastifyPluginAsync = async (server) => {
  server.post('/sync/players', async (request: any, reply) => {
    const { season = 2025, teamCodes } = request.body as {
      season?: number;
      teamCodes?: string[];
    };

    reply.raw.setHeader('Content-Type', 'application/json');

    const teams = await fetchNFLTeams(season);
    const filtered = teamCodes?.length
      ? teams.filter((t) => teamCodes.map((c) => c.toUpperCase()).includes(t.code.toUpperCase()))
      : teams;

    let upserted = 0;
    let skipped = 0;

    for (const team of filtered) {
      const players = await fetchPlayersByTeam(team.id, season);

      for (const player of players) {
        const position = mapPosition(player.position);
        if (!position) { skipped++; continue; }

        await prisma.player.upsert({
          where: { externalId: String(player.id) },
          create: {
            externalId: String(player.id),
            name: player.name,
            firstName: player.firstname,
            lastName: player.lastname,
            position,
            nflTeam: team.code,
            jerseyNumber: player.number ?? null,
            status: mapStatus(player.injury?.status),
            injuryNote: player.injury?.type ?? null,
            photoUrl: player.photo ?? null,
          },
          update: {
            name: player.name,
            position,
            nflTeam: team.code,
            jerseyNumber: player.number ?? null,
            status: mapStatus(player.injury?.status),
            injuryNote: player.injury?.type ?? null,
            photoUrl: player.photo ?? null,
          },
        });
        upserted++;
      }
    }

    return { ok: true, upserted, skipped, teams: filtered.length };
  });

  server.post('/sync/stats', async (request: any, reply) => {
    const { season = 2025, week } = request.body as { season?: number; week: number };

    if (!week) return reply.code(400).send({ error: 'week is required' });

    const games = await fetchGamesByWeek(season, week);
    const completed = games.filter((g) => ['FT', 'F'].includes(g.status.short));

    let updated = 0;

    for (const game of completed) {
      const playerStats = await fetchGamePlayerStats(game.id);

      for (const entry of playerStats) {
        const player = await prisma.player.findUnique({
          where: { externalId: String(entry.player.id) },
        });
        if (!player) continue;

        const statBlock = entry.statistics[0];
        if (!statBlock) continue;
        const weekStats = mapGameStatsToScoringKeys(statBlock);
        if (Object.keys(weekStats).length === 0) continue;

        const current = (player.weeklyStats as Record<string, unknown>) ?? {};
        await prisma.player.update({
          where: { id: player.id },
          data: { weeklyStats: { ...current, [String(week)]: weekStats } as object },
        });
        updated++;
      }
    }

    return { ok: true, week, gamesProcessed: completed.length, playersUpdated: updated };
  });

  server.get('/players/count', async () => {
    const count = await prisma.player.count();
    const byPosition = await prisma.player.groupBy({
      by: ['position'],
      _count: true,
    });
    return {
      total: count,
      byPosition: Object.fromEntries(byPosition.map((r) => [r.position, r._count])),
    };
  });
};
