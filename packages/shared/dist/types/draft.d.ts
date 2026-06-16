import { Player } from './player';
import { DraftType } from './league';
export interface DraftPick {
    id: string;
    leagueId: string;
    teamId: string;
    teamName: string;
    playerId: string;
    player: Player;
    round: number;
    pick: number;
    pickedAt: string;
}
export interface DraftState {
    leagueId: string;
    type: DraftType;
    status: 'PENDING' | 'LIVE' | 'COMPLETE';
    currentPick: number;
    totalPicks: number;
    currentRound: number;
    rounds: number;
    onTheClockTeamId: string;
    onTheClockUserId: string;
    pickTimerSeconds: number;
    timerRemaining: number;
    picks: DraftPick[];
    draftOrder: string[];
}
export type DraftEvent = {
    type: 'PICK_MADE';
    data: DraftPick;
} | {
    type: 'TIMER_TICK';
    data: {
        remaining: number;
        pickIndex: number;
    };
} | {
    type: 'DRAFT_STARTED';
    data: DraftState;
} | {
    type: 'DRAFT_COMPLETE';
    data: {
        picks: DraftPick[];
    };
} | {
    type: 'QUEUE_UPDATED';
    data: {
        teamId: string;
        queue: string[];
    };
};
export type DraftAction = {
    type: 'MAKE_PICK';
    data: {
        playerId: string;
    };
} | {
    type: 'QUEUE_PLAYER';
    data: {
        playerId: string;
        position?: number;
    };
} | {
    type: 'DEQUEUE_PLAYER';
    data: {
        playerId: string;
    };
};
//# sourceMappingURL=draft.d.ts.map