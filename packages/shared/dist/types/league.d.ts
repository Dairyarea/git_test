import { ScoringRules, ScoringBonus } from './scoring';
export type DraftType = 'SNAKE' | 'LINEAR' | 'AUCTION';
export type WaiverType = 'FAAB' | 'ROLLING_PRIORITY' | 'INVERSE_STANDINGS';
export type WaiverReset = 'INVERSE_STANDINGS' | 'NO_CHANGE' | 'WAIVER_SUCCESS';
export type PlayoffFormat = 'SINGLE_ELIMINATION' | 'DOUBLE_ELIMINATION' | 'TOTAL_POINTS';
export type Tiebreaker = 'POINTS_FOR' | 'HEAD_TO_HEAD' | 'BENCH_POINTS' | 'POINTS_AGAINST' | 'COIN_FLIP';
export type TradeVisibility = 'PUBLIC' | 'COMMISSIONER_ONLY' | 'TEAMS_ONLY';
export interface RosterSlotConfig {
    slot: string;
    label: string;
    eligiblePositions: string[];
    count: number;
}
export declare const DEFAULT_ROSTER_SLOTS: RosterSlotConfig[];
export interface LeagueSettings {
    teamCount: number;
    rosterSlots: RosterSlotConfig[];
    rosterSize: number;
    waiverType: WaiverType;
    faabBudget: number;
    waiverDay: number;
    waiverOrderReset: WaiverReset;
    tradeDeadlineWeek: number | null;
    tradeReviewPeriod: number;
    vetoThreshold: number;
    vetoVotingEnabled: boolean;
    instantTrades: boolean;
    tradeVisibility: TradeVisibility;
    anonymousManagers: boolean;
    playoffStartWeek: number;
    playoffTeamCount: number;
    playoffFormat: PlayoffFormat;
    regularSeasonWeeks: number;
    tiebreakers: Tiebreaker[];
}
export interface ScoringConfig {
    rules: ScoringRules;
    bonuses: ScoringBonus[];
    pprValue: number;
}
export interface DraftConfig {
    type: DraftType;
    scheduledAt: string | null;
    status: 'PENDING' | 'LIVE' | 'COMPLETE';
    pickTimerSeconds: number;
    draftOrder: string[];
    currentPick: number;
    rounds: number;
    auctionBudget?: number;
}
export interface League {
    id: string;
    name: string;
    season: number;
    commissionerId: string;
    settings: LeagueSettings;
    scoringConfig: ScoringConfig;
    draftConfig: DraftConfig;
    createdAt: string;
    memberCount: number;
    logoUrl?: string;
}
export interface LeagueMember {
    id: string;
    userId: string;
    leagueId: string;
    teamId: string;
    role: 'COMMISSIONER' | 'MEMBER';
    joinedAt: string;
}
export declare const DEFAULT_LEAGUE_SETTINGS: LeagueSettings;
//# sourceMappingURL=league.d.ts.map