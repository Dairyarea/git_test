import { ScoringRules, ScoringBonus } from '@ff/shared';

export function computePlayerScore(
  stats: Partial<Record<keyof ScoringRules, number>>,
  rules: ScoringRules,
  bonuses: ScoringBonus[] = [],
): number {
  let score = 0;

  for (const [stat, value] of Object.entries(stats)) {
    const multiplier = rules[stat as keyof ScoringRules] ?? 0;
    score += (value ?? 0) * multiplier;
  }

  for (const bonus of bonuses) {
    if ((stats[bonus.stat] ?? 0) >= bonus.threshold) {
      score += bonus.bonus;
    }
  }

  return Math.round(score * 100) / 100;
}

export function computeTeamScore(
  lineup: Array<{ playerId: string; stats: Partial<Record<keyof ScoringRules, number>> }>,
  rules: ScoringRules,
  bonuses: ScoringBonus[] = [],
): { total: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {};
  let total = 0;

  for (const slot of lineup) {
    const pts = computePlayerScore(slot.stats, rules, bonuses);
    breakdown[slot.playerId] = pts;
    total += pts;
  }

  return { total: Math.round(total * 100) / 100, breakdown };
}

export function previewScoringChange(
  rules: ScoringRules,
  bonuses: ScoringBonus[],
  sampleStats: Partial<Record<keyof ScoringRules, number>>,
): number {
  return computePlayerScore(sampleStats, rules, bonuses);
}

export const SAMPLE_QB_STATS: Partial<Record<keyof ScoringRules, number>> = {
  pass_yd: 285,
  pass_td: 2,
  pass_int: 1,
  rush_yd: 18,
};

export const SAMPLE_RB_STATS: Partial<Record<keyof ScoringRules, number>> = {
  rush_yd: 92,
  rush_td: 1,
  rec: 4,
  rec_yd: 32,
};

export const SAMPLE_WR_STATS: Partial<Record<keyof ScoringRules, number>> = {
  rec: 7,
  rec_yd: 98,
  rec_td: 1,
  rec_target: 10,
};

export const SAMPLE_TE_STATS: Partial<Record<keyof ScoringRules, number>> = {
  rec: 5,
  rec_yd: 64,
  rec_td: 1,
};

export const SAMPLE_STATS_BY_POSITION = {
  QB: SAMPLE_QB_STATS,
  RB: SAMPLE_RB_STATS,
  WR: SAMPLE_WR_STATS,
  TE: SAMPLE_TE_STATS,
};
