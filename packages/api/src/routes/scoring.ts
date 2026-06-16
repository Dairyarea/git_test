import { FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { requireLeagueMember } from '../middleware/leagueAccess';
import { computePlayerScore, SAMPLE_STATS_BY_POSITION } from '../services/scoring.service';
import { ScoringRules, ScoringBonus } from '@ff/shared';

const prisma = new PrismaClient();

export const scoringRoutes: FastifyPluginAsync = async (server) => {
  server.get('/:leagueId/scoring', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId } = request.params;
    return prisma.scoringConfig.findUnique({ where: { leagueId } });
  });

  server.post('/:leagueId/scoring/preview', { preHandler: requireLeagueMember }, async (request: any) => {
    const { rules, bonuses } = request.body as { rules: ScoringRules; bonuses: ScoringBonus[] };

    const previews: Record<string, number> = {};
    for (const [pos, stats] of Object.entries(SAMPLE_STATS_BY_POSITION)) {
      previews[pos] = computePlayerScore(stats, rules, bonuses);
    }
    return { previews };
  });

  server.get('/:leagueId/scoring/player/:playerId/:week', { preHandler: requireLeagueMember }, async (request: any) => {
    const { leagueId, playerId, week } = request.params;

    const [scoringConfig, player] = await Promise.all([
      prisma.scoringConfig.findUnique({ where: { leagueId } }),
      prisma.player.findUnique({ where: { id: playerId } }),
    ]);

    if (!scoringConfig || !player) return null;

    const weeklyStats = player.weeklyStats as Record<string, Partial<Record<keyof ScoringRules, number>>>;
    const stats = weeklyStats[week] || {};
    const score = computePlayerScore(stats, scoringConfig.rules as unknown as ScoringRules, scoringConfig.bonuses as unknown as ScoringBonus[]);

    return { playerId, week, stats, score };
  });
};
