"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LEAGUE_SETTINGS = exports.DEFAULT_ROSTER_SLOTS = void 0;
exports.DEFAULT_ROSTER_SLOTS = [
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
exports.DEFAULT_LEAGUE_SETTINGS = {
    teamCount: 10,
    rosterSlots: exports.DEFAULT_ROSTER_SLOTS,
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
//# sourceMappingURL=league.js.map