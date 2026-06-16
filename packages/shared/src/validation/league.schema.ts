import { z } from 'zod';

export const rosterSlotConfigSchema = z.object({
  slot: z.string(),
  label: z.string(),
  eligiblePositions: z.array(z.string()),
  count: z.number().int().min(0).max(20),
});

export const leagueSettingsSchema = z.object({
  teamCount: z.number().int().min(4).max(32),
  rosterSlots: z.array(rosterSlotConfigSchema).min(1),
  rosterSize: z.number().int().min(5).max(50),
  waiverType: z.enum(['FAAB', 'ROLLING_PRIORITY', 'INVERSE_STANDINGS']),
  faabBudget: z.number().int().min(0).max(10000),
  waiverDay: z.number().int().min(0).max(6),
  waiverOrderReset: z.enum(['INVERSE_STANDINGS', 'NO_CHANGE', 'WAIVER_SUCCESS']),
  tradeDeadlineWeek: z.number().int().min(1).max(18).nullable(),
  tradeReviewPeriod: z.number().int().min(0).max(7),
  vetoThreshold: z.number().int().min(1).max(20),
  vetoVotingEnabled: z.boolean(),
  instantTrades: z.boolean(),
  tradeVisibility: z.enum(['PUBLIC', 'COMMISSIONER_ONLY', 'TEAMS_ONLY']),
  anonymousManagers: z.boolean(),
  playoffStartWeek: z.number().int().min(8).max(18),
  playoffTeamCount: z.number().int().min(2).max(16),
  playoffFormat: z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'TOTAL_POINTS']),
  regularSeasonWeeks: z.number().int().min(8).max(17),
  tiebreakers: z.array(z.enum(['POINTS_FOR', 'HEAD_TO_HEAD', 'BENCH_POINTS', 'POINTS_AGAINST', 'COIN_FLIP'])),
});

export const createLeagueSchema = z.object({
  name: z.string().min(2).max(50),
  season: z.number().int().min(2020).max(2035),
  settings: leagueSettingsSchema.optional(),
});

export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type LeagueSettingsInput = z.infer<typeof leagueSettingsSchema>;
