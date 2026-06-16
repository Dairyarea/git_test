import { z } from 'zod';
export declare const rosterSlotConfigSchema: z.ZodObject<{
    slot: z.ZodString;
    label: z.ZodString;
    eligiblePositions: z.ZodArray<z.ZodString, "many">;
    count: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    label: string;
    slot: string;
    eligiblePositions: string[];
    count: number;
}, {
    label: string;
    slot: string;
    eligiblePositions: string[];
    count: number;
}>;
export declare const leagueSettingsSchema: z.ZodObject<{
    teamCount: z.ZodNumber;
    rosterSlots: z.ZodArray<z.ZodObject<{
        slot: z.ZodString;
        label: z.ZodString;
        eligiblePositions: z.ZodArray<z.ZodString, "many">;
        count: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        label: string;
        slot: string;
        eligiblePositions: string[];
        count: number;
    }, {
        label: string;
        slot: string;
        eligiblePositions: string[];
        count: number;
    }>, "many">;
    rosterSize: z.ZodNumber;
    waiverType: z.ZodEnum<["FAAB", "ROLLING_PRIORITY", "INVERSE_STANDINGS"]>;
    faabBudget: z.ZodNumber;
    waiverDay: z.ZodNumber;
    waiverOrderReset: z.ZodEnum<["INVERSE_STANDINGS", "NO_CHANGE", "WAIVER_SUCCESS"]>;
    tradeDeadlineWeek: z.ZodNullable<z.ZodNumber>;
    tradeReviewPeriod: z.ZodNumber;
    vetoThreshold: z.ZodNumber;
    vetoVotingEnabled: z.ZodBoolean;
    instantTrades: z.ZodBoolean;
    tradeVisibility: z.ZodEnum<["PUBLIC", "COMMISSIONER_ONLY", "TEAMS_ONLY"]>;
    anonymousManagers: z.ZodBoolean;
    playoffStartWeek: z.ZodNumber;
    playoffTeamCount: z.ZodNumber;
    playoffFormat: z.ZodEnum<["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "TOTAL_POINTS"]>;
    regularSeasonWeeks: z.ZodNumber;
    tiebreakers: z.ZodArray<z.ZodEnum<["POINTS_FOR", "HEAD_TO_HEAD", "BENCH_POINTS", "POINTS_AGAINST", "COIN_FLIP"]>, "many">;
}, "strip", z.ZodTypeAny, {
    teamCount: number;
    rosterSlots: {
        label: string;
        slot: string;
        eligiblePositions: string[];
        count: number;
    }[];
    rosterSize: number;
    waiverType: "FAAB" | "ROLLING_PRIORITY" | "INVERSE_STANDINGS";
    faabBudget: number;
    waiverDay: number;
    waiverOrderReset: "INVERSE_STANDINGS" | "NO_CHANGE" | "WAIVER_SUCCESS";
    tradeDeadlineWeek: number | null;
    tradeReviewPeriod: number;
    vetoThreshold: number;
    vetoVotingEnabled: boolean;
    instantTrades: boolean;
    tradeVisibility: "PUBLIC" | "COMMISSIONER_ONLY" | "TEAMS_ONLY";
    anonymousManagers: boolean;
    playoffStartWeek: number;
    playoffTeamCount: number;
    playoffFormat: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "TOTAL_POINTS";
    regularSeasonWeeks: number;
    tiebreakers: ("POINTS_FOR" | "HEAD_TO_HEAD" | "BENCH_POINTS" | "POINTS_AGAINST" | "COIN_FLIP")[];
}, {
    teamCount: number;
    rosterSlots: {
        label: string;
        slot: string;
        eligiblePositions: string[];
        count: number;
    }[];
    rosterSize: number;
    waiverType: "FAAB" | "ROLLING_PRIORITY" | "INVERSE_STANDINGS";
    faabBudget: number;
    waiverDay: number;
    waiverOrderReset: "INVERSE_STANDINGS" | "NO_CHANGE" | "WAIVER_SUCCESS";
    tradeDeadlineWeek: number | null;
    tradeReviewPeriod: number;
    vetoThreshold: number;
    vetoVotingEnabled: boolean;
    instantTrades: boolean;
    tradeVisibility: "PUBLIC" | "COMMISSIONER_ONLY" | "TEAMS_ONLY";
    anonymousManagers: boolean;
    playoffStartWeek: number;
    playoffTeamCount: number;
    playoffFormat: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "TOTAL_POINTS";
    regularSeasonWeeks: number;
    tiebreakers: ("POINTS_FOR" | "HEAD_TO_HEAD" | "BENCH_POINTS" | "POINTS_AGAINST" | "COIN_FLIP")[];
}>;
export declare const createLeagueSchema: z.ZodObject<{
    name: z.ZodString;
    season: z.ZodNumber;
    settings: z.ZodOptional<z.ZodObject<{
        teamCount: z.ZodNumber;
        rosterSlots: z.ZodArray<z.ZodObject<{
            slot: z.ZodString;
            label: z.ZodString;
            eligiblePositions: z.ZodArray<z.ZodString, "many">;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            label: string;
            slot: string;
            eligiblePositions: string[];
            count: number;
        }, {
            label: string;
            slot: string;
            eligiblePositions: string[];
            count: number;
        }>, "many">;
        rosterSize: z.ZodNumber;
        waiverType: z.ZodEnum<["FAAB", "ROLLING_PRIORITY", "INVERSE_STANDINGS"]>;
        faabBudget: z.ZodNumber;
        waiverDay: z.ZodNumber;
        waiverOrderReset: z.ZodEnum<["INVERSE_STANDINGS", "NO_CHANGE", "WAIVER_SUCCESS"]>;
        tradeDeadlineWeek: z.ZodNullable<z.ZodNumber>;
        tradeReviewPeriod: z.ZodNumber;
        vetoThreshold: z.ZodNumber;
        vetoVotingEnabled: z.ZodBoolean;
        instantTrades: z.ZodBoolean;
        tradeVisibility: z.ZodEnum<["PUBLIC", "COMMISSIONER_ONLY", "TEAMS_ONLY"]>;
        anonymousManagers: z.ZodBoolean;
        playoffStartWeek: z.ZodNumber;
        playoffTeamCount: z.ZodNumber;
        playoffFormat: z.ZodEnum<["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION", "TOTAL_POINTS"]>;
        regularSeasonWeeks: z.ZodNumber;
        tiebreakers: z.ZodArray<z.ZodEnum<["POINTS_FOR", "HEAD_TO_HEAD", "BENCH_POINTS", "POINTS_AGAINST", "COIN_FLIP"]>, "many">;
    }, "strip", z.ZodTypeAny, {
        teamCount: number;
        rosterSlots: {
            label: string;
            slot: string;
            eligiblePositions: string[];
            count: number;
        }[];
        rosterSize: number;
        waiverType: "FAAB" | "ROLLING_PRIORITY" | "INVERSE_STANDINGS";
        faabBudget: number;
        waiverDay: number;
        waiverOrderReset: "INVERSE_STANDINGS" | "NO_CHANGE" | "WAIVER_SUCCESS";
        tradeDeadlineWeek: number | null;
        tradeReviewPeriod: number;
        vetoThreshold: number;
        vetoVotingEnabled: boolean;
        instantTrades: boolean;
        tradeVisibility: "PUBLIC" | "COMMISSIONER_ONLY" | "TEAMS_ONLY";
        anonymousManagers: boolean;
        playoffStartWeek: number;
        playoffTeamCount: number;
        playoffFormat: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "TOTAL_POINTS";
        regularSeasonWeeks: number;
        tiebreakers: ("POINTS_FOR" | "HEAD_TO_HEAD" | "BENCH_POINTS" | "POINTS_AGAINST" | "COIN_FLIP")[];
    }, {
        teamCount: number;
        rosterSlots: {
            label: string;
            slot: string;
            eligiblePositions: string[];
            count: number;
        }[];
        rosterSize: number;
        waiverType: "FAAB" | "ROLLING_PRIORITY" | "INVERSE_STANDINGS";
        faabBudget: number;
        waiverDay: number;
        waiverOrderReset: "INVERSE_STANDINGS" | "NO_CHANGE" | "WAIVER_SUCCESS";
        tradeDeadlineWeek: number | null;
        tradeReviewPeriod: number;
        vetoThreshold: number;
        vetoVotingEnabled: boolean;
        instantTrades: boolean;
        tradeVisibility: "PUBLIC" | "COMMISSIONER_ONLY" | "TEAMS_ONLY";
        anonymousManagers: boolean;
        playoffStartWeek: number;
        playoffTeamCount: number;
        playoffFormat: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "TOTAL_POINTS";
        regularSeasonWeeks: number;
        tiebreakers: ("POINTS_FOR" | "HEAD_TO_HEAD" | "BENCH_POINTS" | "POINTS_AGAINST" | "COIN_FLIP")[];
    }>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    season: number;
    settings?: {
        teamCount: number;
        rosterSlots: {
            label: string;
            slot: string;
            eligiblePositions: string[];
            count: number;
        }[];
        rosterSize: number;
        waiverType: "FAAB" | "ROLLING_PRIORITY" | "INVERSE_STANDINGS";
        faabBudget: number;
        waiverDay: number;
        waiverOrderReset: "INVERSE_STANDINGS" | "NO_CHANGE" | "WAIVER_SUCCESS";
        tradeDeadlineWeek: number | null;
        tradeReviewPeriod: number;
        vetoThreshold: number;
        vetoVotingEnabled: boolean;
        instantTrades: boolean;
        tradeVisibility: "PUBLIC" | "COMMISSIONER_ONLY" | "TEAMS_ONLY";
        anonymousManagers: boolean;
        playoffStartWeek: number;
        playoffTeamCount: number;
        playoffFormat: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "TOTAL_POINTS";
        regularSeasonWeeks: number;
        tiebreakers: ("POINTS_FOR" | "HEAD_TO_HEAD" | "BENCH_POINTS" | "POINTS_AGAINST" | "COIN_FLIP")[];
    } | undefined;
}, {
    name: string;
    season: number;
    settings?: {
        teamCount: number;
        rosterSlots: {
            label: string;
            slot: string;
            eligiblePositions: string[];
            count: number;
        }[];
        rosterSize: number;
        waiverType: "FAAB" | "ROLLING_PRIORITY" | "INVERSE_STANDINGS";
        faabBudget: number;
        waiverDay: number;
        waiverOrderReset: "INVERSE_STANDINGS" | "NO_CHANGE" | "WAIVER_SUCCESS";
        tradeDeadlineWeek: number | null;
        tradeReviewPeriod: number;
        vetoThreshold: number;
        vetoVotingEnabled: boolean;
        instantTrades: boolean;
        tradeVisibility: "PUBLIC" | "COMMISSIONER_ONLY" | "TEAMS_ONLY";
        anonymousManagers: boolean;
        playoffStartWeek: number;
        playoffTeamCount: number;
        playoffFormat: "SINGLE_ELIMINATION" | "DOUBLE_ELIMINATION" | "TOTAL_POINTS";
        regularSeasonWeeks: number;
        tiebreakers: ("POINTS_FOR" | "HEAD_TO_HEAD" | "BENCH_POINTS" | "POINTS_AGAINST" | "COIN_FLIP")[];
    } | undefined;
}>;
export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type LeagueSettingsInput = z.infer<typeof leagueSettingsSchema>;
//# sourceMappingURL=league.schema.d.ts.map