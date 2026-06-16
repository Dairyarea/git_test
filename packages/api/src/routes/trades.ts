import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember } from '../middleware/leagueAccess';
import { executeTrade, checkTradeVetoes } from '../services/trade.service';

const prisma = new PrismaClient();

export const tradeRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/trades', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    const { status } = request.query as { status?: string };

    return prisma.trade.findMany({
      where: { leagueId, ...(status ? { status: status as any } : {}) },
      include: {
        proposingTeam: { select: { id: true, name: true } },
        receivingTeam: { select: { id: true, name: true } },
        votes: { include: { user: { select: { id: true, displayName: true } } } },
      },
      orderBy: { proposedAt: 'desc' },
    });
  });

  server.post('/:leagueId/trades', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { leagueId } = request.params;
    const { receivingTeamId, send, receive, notes } = request.body as {
      receivingTeamId: string;
      send: string[];
      receive: string[];
      notes?: string;
    };

    const proposingTeam = await prisma.team.findFirst({
      where: { leagueId, ownerId: request.userId },
    });
    if (!proposingTeam) return reply.code(404).send({ error: 'Your team not found' });

    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: { settings: true },
    });

    const reviewDays = league?.settings?.tradeReviewPeriod ?? 2;
    const expiresAt = new Date(Date.now() + reviewDays * 24 * 60 * 60 * 1000);

    const trade = await prisma.trade.create({
      data: {
        leagueId,
        proposingTeamId: proposingTeam.id,
        receivingTeamId,
        assets: { send, receive },
        notes,
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
    const { tradeId } = request.params;
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
    return { success: true };
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

    await prisma.trade.update({
      where: { id: tradeId },
      data: { status: 'REJECTED', resolvedAt: new Date() },
    });
    return { success: true };
  });

  server.post('/:leagueId/trades/:tradeId/veto', { preHandler: requireLeagueMember }, async (request: any, reply) => {
    const { tradeId, leagueId } = request.params;

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
