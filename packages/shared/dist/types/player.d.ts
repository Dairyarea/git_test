import { ScoringRules } from './scoring';
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'K' | 'DEF';
export type PlayerStatus = 'ACTIVE' | 'INJURED' | 'OUT' | 'BYE' | 'SUSPENDED' | 'QUESTIONABLE' | 'DOUBTFUL';
export interface Player {
    id: string;
    externalId: string;
    name: string;
    firstName: string;
    lastName: string;
    position: Position;
    nflTeam: string;
    jerseyNumber?: number;
    status: PlayerStatus;
    injuryNote?: string;
    byeWeek?: number;
    photoUrl?: string;
    weeklyStats: Record<string, Partial<Record<keyof ScoringRules, number>>>;
    seasonStats?: Partial<Record<keyof ScoringRules, number>>;
    projectedPoints?: number;
    weeklyPoints?: Record<string, number>;
}
export interface PlayerSearchResult {
    id: string;
    name: string;
    position: Position;
    nflTeam: string;
    status: PlayerStatus;
    projectedPoints?: number;
    isOwned: boolean;
    ownerTeamName?: string;
}
//# sourceMappingURL=player.d.ts.map