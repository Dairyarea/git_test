/**
 * Syncs weekly player stats from API-Sports into Player.weeklyStats (JSONB).
 *
 * Fetches all games for a given week, then for each completed game pulls
 * per-player box score stats and merges them into the player record.
 *
 * Free tier cost: 1 req (games list) + 1 req per game = ~9-17 req per week.
 * You can safely sync 5-10 weeks per day on a free plan.
 *
 * Usage:
 *   npx tsx packages/api/src/scripts/sync-stats.ts --week=1 [--season=2025]
 *   npx tsx packages/api/src/scripts/sync-stats.ts --week=1-17 [--season=2025]  (syncs a range)
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import {
  fetchGamesByWeek,
  fetchGamePlayerStats,
  mapGameStatsToScoringKeys,
} from '../services/apiSports.service';

const prisma = new PrismaClient();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const SEASON = parseInt(args.season ?? '2025');

function parseWeekArg(): number[] {
  const raw = args.week ?? '1';
  if (raw.includes('-')) {
    const [start, end] = raw.split('-').map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  return [parseInt(raw)];
}

async function syncWeek(week: number) {
  console.log(`\nWeek ${week}: fetching games...`);
  const games = await fetchGamesByWeek(SEASON, week);

  const completed = games.filter((g) => g.status.short === 'FT' || g.status.short === 'F');
  console.log(`  ${games.length} games found, ${completed.length} completed`);

  let playersUpdated = 0;

  for (const game of completed) {
    console.log(`  Game ${game.id}: ${game.teams.away.name} @ ${game.teams.home.name}`);

    let playerStats;
    try {
      playerStats = await fetchGamePlayerStats(game.id);
    } catch (err) {
      console.error(`    Failed to fetch stats for game ${game.id}: ${err}`);
      continue;
    }

    console.log(`    ${playerStats.length} players with stats`);

    for (const entry of playerStats) {
      const externalId = String(entry.player.id);
      const player = await prisma.player.findUnique({ where: { externalId } });
      if (!player) continue; // Player not in DB yet — run sync-players first

      const statBlock = entry.statistics[0];
      if (!statBlock) continue;

      const weekStats = mapGameStatsToScoringKeys(statBlock);
      if (Object.keys(weekStats).length === 0) continue;

      // Merge into existing weeklyStats JSON
      const current = (player.weeklyStats as Record<string, unknown>) ?? {};
      await prisma.player.update({
        where: { id: player.id },
        data: {
          weeklyStats: { ...current, [String(week)]: weekStats } as object,
        },
      });
      playersUpdated++;
    }
  }

  console.log(`  Week ${week} done — ${playersUpdated} player records updated`);
  return playersUpdated;
}

async function main() {
  const weeks = parseWeekArg();
  console.log(`\nSyncing stats for season ${SEASON}, week(s): ${weeks.join(', ')}`);

  let total = 0;
  for (const week of weeks) {
    total += await syncWeek(week);
  }

  console.log(`\n✓ Stats sync complete — ${total} player-week records updated`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
