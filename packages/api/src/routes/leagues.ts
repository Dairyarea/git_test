import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createLeagueSchema } from '@ff/shared';
import { DEFAULT_LEAGUE_SETTINGS, DEFAULT_SCORING, DEFAULT_ROSTER_SLOTS } from '@ff/shared';
import { requireCommissioner, requireLeagueMember } from '../middleware/leagueAccess';

const prisma = new PrismaClient();

export const leagueRoutes: FastifyPluginAsync = async (server) => {
  server.get('/', async (request) => {
    const members = await prisma.leagueMember.findMany({
      where: { userId: request.userId },
      include: {
        league: {
          include: {
            settings: true,
            _count: { select: { members: true } },
          },
        },
      },
    });
    return members.map((m) => ({
      ...m.league,
      memberCount: m.league._count.members,
      role: m.role,
    }));
  });

  server.post('/', async (request, reply) => {
    const body = createLeagueSchema.parse(request.body);
    const settings = body.settings || DEFAULT_LEAGUE_SETTINGS;

    const league = await prisma.$transaction(async (tx) => {
      const league = await tx.league.create({
        data: {
          name: body.name,
          season: body.season,
          commissionerId: request.userId,
        },
      });

      await tx.leagueSettings.create({
        data: {
          leagueId: league.id,
          teamCount: settings.teamCount,
          rosterSlots: settings.rosterSlots,
          rosterSize: settings.rosterSize,
          waiverType: settings.waiverType,
          faabBudget: settings.faabBudget,
          waiverDay: settings.waiverDay,
          waiverOrderReset: settings.waiverOrderReset,
          tradeDeadlineWeek: settings.tradeDeadlineWeek,
          tradeReviewPeriod: settings.tradeReviewPeriod,
          vetoThreshold: settings.vetoThreshold,
          vetoVotingEnabled: settings.vetoVotingEnabled,
          playoffStartWeek: settings.playoffStartWeek,
          playoffTeamCount: settings.playoffTeamCount,
          playoffFormat: settings.playoffFormat,
          regularSeasonWeeks: settings.regularSeasonWeeks,
          tiebreakers: settings.tiebreakers,
        },
      });

      await tx.scoringConfig.create({
        data: {
          leagueId: league.id,
          rules: DEFAULT_SCORING,
          bonuses: [],
          pprValue: 0,
        },
      });

      await tx.draftConfig.create({
        data: {
          leagueId: league.id,
          rounds: Math.floor(settings.rosterSize * 1),
        },
      });

      await tx.leagueMember.create({
        data: { leagueId: league.id, userId: request.userId, role: 'COMMISSIONER' },
      });

      await tx.team.create({
        data: {
          leagueId: league.id,
          ownerId: request.userId,
          name: 'My Team',
          faabRemaining: settings.faabBudget,
        },
      });

      return league;
    });

    reply.code(201);
    return league;
  });

  server.get('/:leagueId', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    return prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        settings: true,
        scoringConfig: true,
        draftConfig: true,
        _count: { select: { members: true } },
      },
    });
  });

  server.post('/:leagueId/join', async (request: any, reply) => {
    const { inviteCode } = request.body as { inviteCode: string };
    const league = await prisma.league.findUnique({ where: { inviteCode }, include: { settings: true } });
    if (!league) return reply.code(404).send({ error: 'Invalid invite code' });

    const existing = await prisma.leagueMember.findUnique({
      where: { leagueId_userId: { leagueId: league.id, userId: request.userId } },
    });
    if (existing) return reply.code(409).send({ error: 'Already a member' });

    const memberCount = await prisma.leagueMember.count({ where: { leagueId: league.id } });
    if (league.settings && memberCount >= league.settings.teamCount) {
      return reply.code(400).send({ error: 'League is full' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.leagueMember.create({
        data: { leagueId: league.id, userId: request.userId, role: 'MEMBER' },
      });
      await tx.team.create({
        data: {
          leagueId: league.id,
          ownerId: request.userId,
          name: 'My Team',
          faabRemaining: league.settings?.faabBudget ?? 100,
        },
      });
    });

    return { leagueId: league.id };
  });

  server.put('/:leagueId/settings', { preHandler: requireCommissioner }, async (request: any) => {
    const { leagueId } = request.params;
    const body = request.body as any;
    return prisma.leagueSettings.upsert({
      where: { leagueId },
      create: { ...body, leagueId },
      update: body,
    });
  });

  server.put('/:leagueId/scoring', { preHandler: requireCommissioner }, async (request: any) => {
    const { leagueId } = request.params;
    const body = request.body as any;
    return prisma.scoringConfig.upsert({
      where: { leagueId },
      create: { ...body, leagueId },
      update: body,
    });
  });

  server.get('/:leagueId/invite', { preHandler: requireCommissioner }, async (request: any) => {
    const { leagueId } = request.params;
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { inviteCode: true },
    });
    return { inviteCode: league?.inviteCode };
  });
};
