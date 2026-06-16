import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function executeTrade(tradeId: string): Promise<void> {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: { league: { include: { settings: true } } },
  });
  if (!trade) throw new Error('Trade not found');

  const assets = trade.assets as { send: string[]; receive: string[] };

  await prisma.$transaction(async (tx) => {
    for (const playerId of assets.send) {
      await tx.rosterSlot.updateMany({
        where: { teamId: trade.proposingTeamId, playerId },
        data: { teamId: trade.receivingTeamId, acquiredVia: 'TRADE', acquiredAt: new Date() },
      });
    }

    for (const playerId of assets.receive) {
      await tx.rosterSlot.updateMany({
        where: { teamId: trade.receivingTeamId, playerId },
        data: { teamId: trade.proposingTeamId, acquiredVia: 'TRADE', acquiredAt: new Date() },
      });
    }

    await tx.trade.update({
      where: { id: tradeId },
      data: { status: 'ACCEPTED', resolvedAt: new Date() },
    });
  });
}

export async function checkTradeVetoes(tradeId: string): Promise<boolean> {
  const trade = await prisma.trade.findUnique({
    where: { id: tradeId },
    include: {
      votes: true,
      league: { include: { settings: true } },
    },
  });
  if (!trade || !trade.league.settings) return false;

  const vetoCount = trade.votes.filter((v) => v.vote === 'VETO').length;
  const threshold = trade.league.settings.vetoThreshold;

  if (vetoCount >= threshold) {
    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'VETOED', resolvedAt: new Date() },
    });
    return true;
  }
  return false;
}

export async function expireStaleTrades(): Promise<void> {
  await prisma.trade.updateMany({
    where: {
      status: 'PENDING',
      expiresAt: { lte: new Date() },
    },
    data: { status: 'EXPIRED' },
  });
}
