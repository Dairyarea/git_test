import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function processWaiverClaims(leagueId: string, week: number): Promise<void> {
  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { settings: true },
  });
  if (!league?.settings) return;

  const claims = await prisma.waiverClaim.findMany({
    where: { leagueId, week, status: 'PENDING' },
    orderBy: [
      { faabBid: 'desc' },
      { priority: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  const processedPlayers = new Set<string>();
  const processedTeamPlayers = new Map<string, Set<string>>();

  for (const claim of claims) {
    if (processedPlayers.has(claim.addPlayerId)) {
      await prisma.waiverClaim.update({
        where: { id: claim.id },
        data: { status: 'FAILED', failureReason: 'Player already claimed by another team' },
      });
      continue;
    }

    const isOwned = await prisma.rosterSlot.findFirst({
      where: { playerId: claim.addPlayerId },
    });
    if (isOwned) {
      await prisma.waiverClaim.update({
        where: { id: claim.id },
        data: { status: 'FAILED', failureReason: 'Player is already on a roster' },
      });
      continue;
    }

    const teamProcessed = processedTeamPlayers.get(claim.teamId) ?? new Set();
    if (claim.dropPlayerId && teamProcessed.has(claim.dropPlayerId)) {
      await prisma.waiverClaim.update({
        where: { id: claim.id },
        data: { status: 'FAILED', failureReason: 'Drop player already removed by prior claim' },
      });
      continue;
    }

    await prisma.$transaction(async (tx) => {
      if (claim.dropPlayerId) {
        await tx.rosterSlot.deleteMany({
          where: { teamId: claim.teamId, playerId: claim.dropPlayerId },
        });
      }

      await tx.rosterSlot.create({
        data: {
          teamId: claim.teamId,
          playerId: claim.addPlayerId,
          status: 'BENCH',
          slotType: 'BN',
          acquiredVia: 'WAIVER',
        },
      });

      if (claim.faabBid != null) {
        await tx.team.update({
          where: { id: claim.teamId },
          data: { faabRemaining: { decrement: claim.faabBid } },
        });
      }

      await tx.waiverClaim.update({
        where: { id: claim.id },
        data: { status: 'PROCESSED', claimedAt: new Date() },
      });
    });

    processedPlayers.add(claim.addPlayerId);
    const set = processedTeamPlayers.get(claim.teamId) ?? new Set();
    if (claim.dropPlayerId) set.add(claim.dropPlayerId);
    processedTeamPlayers.set(claim.teamId, set);
  }

  if (league.settings.waiverOrderReset === 'INVERSE_STANDINGS') {
    await resetWaiverPriorityByStandings(leagueId);
  }
}

async function resetWaiverPriorityByStandings(leagueId: string): Promise<void> {
  const teams = await prisma.team.findMany({
    where: { leagueId },
    orderBy: [{ wins: 'asc' }, { pointsFor: 'asc' }],
  });

  for (let i = 0; i < teams.length; i++) {
    await prisma.team.update({
      where: { id: teams[i].id },
      data: { waiverPriority: i + 1 },
    });
  }
}
