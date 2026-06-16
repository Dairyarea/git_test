"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLeagueSchema = exports.leagueSettingsSchema = exports.rosterSlotConfigSchema = void 0;
const zod_1 = require("zod");
exports.rosterSlotConfigSchema = zod_1.z.object({
    slot: zod_1.z.string(),
    label: zod_1.z.string(),
    eligiblePositions: zod_1.z.array(zod_1.z.string()),
    count: zod_1.z.number().int().min(0).max(20),
});
exports.leagueSettingsSchema = zod_1.z.object({
    teamCount: zod_1.z.number().int().min(4).max(32),
    rosterSlots: zod_1.z.array(exports.rosterSlotConfigSchema).min(1),
    rosterSize: zod_1.z.number().int().min(5).max(50),
    waiverType: zod_1.z.enum(['FAAB', 'ROLLING_PRIORITY', 'INVERSE_STANDINGS']),
    faabBudget: zod_1.z.number().int().min(0).max(10000),
    waiverDay: zod_1.z.number().int().min(0).max(6),
    waiverOrderReset: zod_1.z.enum(['INVERSE_STANDINGS', 'NO_CHANGE', 'WAIVER_SUCCESS']),
    tradeDeadlineWeek: zod_1.z.number().int().min(1).max(18).nullable(),
    tradeReviewPeriod: zod_1.z.number().int().min(0).max(7),
    vetoThreshold: zod_1.z.number().int().min(1).max(20),
    vetoVotingEnabled: zod_1.z.boolean(),
    instantTrades: zod_1.z.boolean(),
    tradeVisibility: zod_1.z.enum(['PUBLIC', 'COMMISSIONER_ONLY', 'TEAMS_ONLY']),
    anonymousManagers: zod_1.z.boolean(),
    playoffStartWeek: zod_1.z.number().int().min(8).max(18),
    playoffTeamCount: zod_1.z.number().int().min(2).max(16),
    playoffFormat: zod_1.z.enum(['SINGLE_ELIMINATION', 'DOUBLE_ELIMINATION', 'TOTAL_POINTS']),
    regularSeasonWeeks: zod_1.z.number().int().min(8).max(17),
    tiebreakers: zod_1.z.array(zod_1.z.enum(['POINTS_FOR', 'HEAD_TO_HEAD', 'BENCH_POINTS', 'POINTS_AGAINST', 'COIN_FLIP'])),
});
exports.createLeagueSchema = zod_1.z.object({
    name: zod_1.z.string().min(2).max(50),
    season: zod_1.z.number().int().min(2020).max(2035),
    settings: exports.leagueSettingsSchema.optional(),
});
//# sourceMappingURL=league.schema.js.map