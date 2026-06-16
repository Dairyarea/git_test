import { Player } from './player';
export type TradeStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'VETOED' | 'EXPIRED' | 'WITHDRAWN';
export interface TradeAssets {
    send: string[];
    receive: string[];
    sendDraftPicks?: string[];
    receiveDraftPicks?: string[];
}
export interface Trade {
    id: string;
    leagueId: string;
    proposingTeamId: string;
    proposingTeamName: string;
    receivingTeamId: string;
    receivingTeamName: string;
    status: TradeStatus;
    assets: TradeAssets;
    proposingPlayers: Player[];
    receivingPlayers: Player[];
    proposedAt: string;
    resolvedAt: string | null;
    expiresAt: string;
    notes?: string;
    votes: TradeVote[];
    vetoCount: number;
    vetoThreshold: number;
}
export interface TradeVote {
    id: string;
    tradeId: string;
    userId: string;
    userName: string;
    vote: 'VETO' | 'APPROVE';
    votedAt: string;
}
export interface WaiverClaim {
    id: string;
    leagueId: string;
    teamId: string;
    teamName: string;
    addPlayerId: string;
    addPlayer: Player;
    dropPlayerId: string | null;
    dropPlayer: Player | null;
    priority: number;
    faabBid: number | null;
    status: 'PENDING' | 'PROCESSED' | 'FAILED';
    failureReason?: string;
    claimedAt: string | null;
    week: number;
}
//# sourceMappingURL=trade.d.ts.map