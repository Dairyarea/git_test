import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember } from '../middleware/leagueAccess';
import { executeTrade, checkTradeVetoes } from '../services/trade.service';

const prisma = new PrismaClient();

async function getLeagueSettings(leagueId: string) {
  return prisma.leagueSettings.findUnique({ where: { leagueId } });
}

async function getRequestingTeam(leagueId: string, userId: string) {
  return prisma.team.findFirst({ where: { leagueId, ownerId: userId }, select: { id: true } });
}

async function isCommissioner(leagueId: string, userId: string): Promise<boolean> {
  const member = await prisma.leagueMember.findUnique({
    where: { leagueId_userId: { leagueId, userId } },
  });
  return member?.role === 'COMMISSIONER';
}

export const tradeRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/trades', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { status } = request.query as { status?: string };

    const [settings, myTeam, commissioner] = await Promise.all([
      getLeagueSettings(leagueId),
      getRequestingTeam(leagueId, request.userId),
      isCommissioner(leagueId, request.userId),
    ]);

    const visibility = settings?.tradeVisibility ?? 'PUBLIC';

    // Build visibility filter — commissioners always see everything
    let visibilityWhere: any = {};
    if (!commissioner && visibility !== 'PUBLIC') {
      // Only show trades where the requester's team is a party
      visibilityWhere = {
        OR: [
          { proposingTeamId: myTeam?.id },
          { receivingTeamId: myTeam?.id },
        ],
      };
    }

    const trades = await prisma.trade.findMany({
      where: {
        leagueId,
        ...visibilityWhere,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        proposingTeam: { select: { id: true, name: true } },
        receivingTeam: { select: { id: true, name: true } },
        votes: { include: { user: { select: { id: true, displayName: true } } } },
      },
      orderBy: { proposedAt: 'desc' },
    });

    // When anonymousManagers is on, strip owner identity from vote records for non-commissioners
    if (settings?.anonymousManagers && !commissioner) {
      return trades.map((t) => ({
        ...t,
        votes: t.votes.map((v) => ({
          ...v,
          user: { id: v.user.id, displayName: 'League Member' },
        })),
      }));
    }

    return trades;
  });

  server.post('/:leagueId/trades', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { leagueId } = request.params;
    const { receivingTeamId, send, receive, notes } = request.body as {
      receivingTeamId: string;
      send: string[];
      receive: string[];
      notes?: string;
    };

    const [proposingTeam, settings] = await Promise.all([
      prisma.team.findFirst({ where: { leagueId, ownerId: request.userId } }),
      getLeagueSettings(leagueId),
    ]);

    if (!proposingTeam) return reply.code(404).send({ error: 'Your team not found' });

    if (settings?.tradeDeadlineWeek != null) {
      // Deadline enforcement would compare against current week from a config/env value
    }

    const reviewDays = settings?.instantTrades ? 0 : (settings?.tradeReviewPeriod ?? 2);
    const expiresAt = new Date(Date.now() + Math.max(reviewDays, 1) * 24 * 60 * 60 * 1000);

    const trade = await prisma.trade.create({
      data: {
        leagueId,
        proposingTeamId: proposingTeam.id,
        receivingTeamId,
        assets: { send, receive },
        notes,
        instant: settings?.instantTrades ?? false,
        expiresAt,
      },
      include: {
        proposingTeam: true,
        receivingTeam: true,
      },
    });

    reply.code(201);
    return trade;
  });

  server.post('/:leagueId/trades/:tradeId/accept', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { leagueId, tradeId } = request.params;
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { receivingTeam: true },
    });

    if (!trade) return reply.code(404).send({ error: 'Trade not found' });
    if (trade.receivingTeam.ownerId !== request.userId) {
      return reply.code(403).send({ error: 'Only the receiving team can accept' });
    }
    if (trade.status !== 'PENDING') {
      return reply.code(400).send({ error: 'Trade is no longer pending' });
    }

    await executeTrade(tradeId);

    // If this trade was created with instant-trade rules, close the veto window immediately
    if (trade.instant) {
      await prisma.trade.update({
        where: { id: tradeId },
        data: { expiresAt: new Date() },
      });
    }

    return { success: true, instant: trade.instant };
  });

  server.post('/:leagueId/trades/:tradeId/reject', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { tradeId } = request.params;
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: { receivingTeam: true },
    });

    if (!trade) return reply.code(404).send({ error: 'Trade not found' });
    if (trade.receivingTeam.ownerId !== request.userId) {
      return reply.code(403).send({ error: 'Only the receiving team can reject' });
    }
    if (trade.status !== 'PENDING') {
      return reply.code(400).send({ error: 'Trade is no longer pending' });
    }

    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'REJECTED', resolvedAt: new Date() },
    });
    return { success: true };
  });

  server.post('/:leagueId/trades/:tradeId/veto', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { tradeId, leagueId } = request.params;

    const trade = await prisma.trade.findUnique({ where: { id: tradeId } });
    if (!trade) return reply.code(404).send({ error: 'Trade not found' });

    // Instant trades cannot be vetoed
    if (trade.instant) {
      return reply.code(400).send({ error: 'This trade was processed instantly and cannot be vetoed.' });
    }

    if (trade.status === 'ACCEPTED' && trade.expiresAt < new Date()) {
      return reply.code(400).send({ error: 'Veto window has closed.' });
    }

    const settings = await getLeagueSettings(leagueId);
    if (!settings?.vetoVotingEnabled) {
      return reply.code(400).send({ error: 'Veto voting is disabled for this league.' });
    }

    const member = await prisma.leagueMember.findUnique({
      where: { leagueId_userId: { leagueId, userId: request.userId } },
    });
    if (!member) return reply.code(403).send({ error: 'Not a league member' });

    const existingVote = await prisma.tradeVote.findUnique({
      where: { tradeId_userId: { tradeId, userId: request.userId } },
    });
    if (existingVote) return reply.code(409).send({ error: 'Already voted' });

    await prisma.tradeVote.create({
      data: { tradeId, userId: request.userId, vote: 'VETO' },
    });

    const vetoed = await checkTradeVetoes(tradeId);
    return { success: true, vetoed };
  });
};
