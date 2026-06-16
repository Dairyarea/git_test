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

export const DEFAULT_ROSTER_SLOTS: RosterSlotConfig[] = [
  { slot: 'QB', label: 'Quarterback', eligiblePositions: ['QB'], count: 1 },
  { slot: 'RB', label: 'Running Back', eligiblePositions: ['RB'], count: 2 },
  { slot: 'WR', label: 'Wide Receiver', eligiblePositions: ['WR'], count: 2 },
  { slot: 'TE', label: 'Tight End', eligiblePositions: ['TE'], count: 1 },
  { slot: 'FLEX', label: 'Flex (RB/WR/TE)', eligiblePositions: ['RB', 'WR', 'TE'], count: 1 },
  { slot: 'K', label: 'Kicker', eligiblePositions: ['K'], count: 1 },
  { slot: 'DEF', label: 'Defense/ST', eligiblePositions: ['DEF'], count: 1 },
  { slot: 'BN', label: 'Bench', eligiblePositions: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'], count: 6 },
  { slot: 'IR', label: 'Injured Reserve', eligiblePositions: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'], count: 1 },
];

export interface LeagueSettings {
  teamCount: number;
  rosterSlots: RosterSlotConfig[];
  rosterSize: number;
  // Waiver
  waiverType: WaiverType;
  faabBudget: number;
  waiverDay: number;
  waiverOrderReset: WaiverReset;
  // Trade
  tradeDeadlineWeek: number | null;
  tradeReviewPeriod: number;
  vetoThreshold: number;
  vetoVotingEnabled: boolean;
  instantTrades: boolean;
  tradeVisibility: TradeVisibility;
  // Privacy
  anonymousManagers: boolean;
  // Playoff
  playoffStartWeek: number;
  playoffTeamCount: number;
  playoffFormat: PlayoffFormat;
  // Schedule
  regularSeasonWeeks: number;
  // Tiebreakers (ordered)
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

export const DEFAULT_LEAGUE_SETTINGS: LeagueSettings = {
  teamCount: 10,
  rosterSlots: DEFAULT_ROSTER_SLOTS,
  rosterSize: 15,
  waiverType: 'FAAB',
  faabBudget: 100,
  waiverDay: 3,
  waiverOrderReset: 'INVERSE_STANDINGS',
  tradeDeadlineWeek: 12,
  tradeReviewPeriod: 2,
  vetoThreshold: 4,
  vetoVotingEnabled: true,
  instantTrades: false,
  tradeVisibility: 'PUBLIC',
  anonymousManagers: false,
  playoffStartWeek: 14,
  playoffTeamCount: 6,
  playoffFormat: 'SINGLE_ELIMINATION',
  regularSeasonWeeks: 13,
  tiebreakers: ['POINTS_FOR', 'HEAD_TO_HEAD', 'BENCH_POINTS'],
};
