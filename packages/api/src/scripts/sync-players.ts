/**
 * Syncs NFL player rosters from API-Sports into the local database.
 *
 * Free tier: ~32 req for teams + 1-3 req per team for rosters = ~100-130 req total.
 * On free tier (100 req/day) this will take 2 days for a full initial sync.
 * Pass --teams=KC,DAL,... to sync specific teams and stay under the daily limit.
 *
 * Usage:
 *   npx tsx packages/api/src/scripts/sync-players.ts [--season=2025] [--teams=KC,DAL]
 */

import 'dotenv/config';
import { PrismaClient, Position } from '@prisma/client';
import {
  fetchNFLTeams,
  fetchPlayersByTeam,
  mapPosition,
  mapStatus,
  ApiPlayer,
} from '../services/apiSports.service';

const prisma = new PrismaClient();

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, '').split('=');
    return [k, v];
  })
);

const SEASON = parseInt(args.season ?? '2025');
const TEAM_FILTER = args.teams ? args.teams.split(',').map((t: string) => t.trim().toUpperCase()) : null;

async function upsertPlayer(player: ApiPlayer, nflTeam: string) {
  const position = mapPosition(player.position);
  if (!position) {
    // Skip non-fantasy positions (OL, punters, etc.)
    return null;
  }

  const status = mapStatus(player.injury?.status);
  const injuryNote = player.injury?.type ?? null;

  return prisma.player.upsert({
    where: { externalId: String(player.id) },
    create: {
      externalId: String(player.id),
      name: player.name,
      firstName: player.firstname,
      lastName: player.lastname,
      position,
      nflTeam,
      jerseyNumber: player.number ?? null,
      status,
      injuryNote,
      photoUrl: player.photo ?? null,
    },
    update: {
      name: player.name,
      firstName: player.firstname,
      lastName: player.lastname,
      position,
      nflTeam,
      jerseyNumber: player.number ?? null,
      status,
      injuryNote,
      photoUrl: player.photo ?? null,
    },
  });
}

async function main() {
  console.log(`\nSyncing NFL players for season ${SEASON}...`);

  const teams = await fetchNFLTeams(SEASON);
  console.log(`Found ${teams.length} NFL teams`);

  const filtered = TEAM_FILTER
    ? teams.filter((t) => TEAM_FILTER.includes(t.code.toUpperCase()))
    : teams;

  if (TEAM_FILTER) {
    console.log(`Filtering to: ${filtered.map((t) => t.code).join(', ')}`);
  }

  let totalUpserted = 0;
  let totalSkipped = 0;
  let requestsUsed = 1; // Already used 1 for fetchNFLTeams

  for (const team of filtered) {
    console.log(`\n[${team.code}] ${team.name} — fetching roster...`);
    let players: ApiPlayer[];
    try {
      players = await fetchPlayersByTeam(team.id, SEASON);
      requestsUsed++;
    } catch (err) {
      console.error(`  Failed to fetch ${team.name}: ${err}`);
      continue;
    }

    console.log(`  ${players.length} players returned`);

    for (const player of players) {
      const result = await upsertPlayer(player, team.code);
      if (result) {
        totalUpserted++;
      } else {
        totalSkipped++;
      }
    }

    console.log(`  Done. Running total: ${totalUpserted} upserted, ${totalSkipped} skipped (non-fantasy positions)`);
  }

  console.log(`\n✓ Sync complete`);
  console.log(`  Players upserted: ${totalUpserted}`);
  console.log(`  Skipped (non-fantasy): ${totalSkipped}`);
  console.log(`  API requests used: ~${requestsUsed}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
