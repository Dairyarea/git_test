export interface ScoringRules {
  // Passing
  pass_yd: number;
  pass_td: number;
  pass_int: number;
  pass_2pt: number;
  pass_inc: number;
  pass_att: number;
  // Rushing
  rush_yd: number;
  rush_td: number;
  rush_att: number;
  rush_2pt: number;
  // Receiving
  rec: number;
  rec_yd: number;
  rec_td: number;
  rec_2pt: number;
  rec_target: number;
  // Kicking
  fg_made_0_39: number;
  fg_made_40_49: number;
  fg_made_50_59: number;
  fg_made_60_plus: number;
  fg_missed: number;
  xp_made: number;
  xp_missed: number;
  // Defense / Special Teams
  dst_sack: number;
  dst_int: number;
  dst_fumble_rec: number;
  dst_safety: number;
  dst_td: number;
  dst_blk: number;
  dst_pts_allowed_0: number;
  dst_pts_allowed_1_6: number;
  dst_pts_allowed_7_13: number;
  dst_pts_allowed_14_20: number;
  dst_pts_allowed_21_27: number;
  dst_pts_allowed_28_34: number;
  dst_pts_allowed_35_plus: number;
  dst_yds_allowed_0_99: number;
  dst_yds_allowed_100_199: number;
  dst_yds_allowed_200_299: number;
  dst_yds_allowed_300_399: number;
  dst_yds_allowed_400_plus: number;
  // Miscellaneous
  fumble_lost: number;
  fumble: number;
  return_td: number;
}

export interface ScoringBonus {
  stat: keyof ScoringRules;
  threshold: number;
  bonus: number;
  label?: string;
}

export type ScoringPreset = 'standard' | 'ppr' | 'half_ppr' | 'custom';

export const DEFAULT_SCORING: ScoringRules = {
  pass_yd: 0.04,
  pass_td: 4,
  pass_int: -2,
  pass_2pt: 2,
  pass_inc: 0,
  pass_att: 0,
  rush_yd: 0.1,
  rush_td: 6,
  rush_att: 0,
  rush_2pt: 2,
  rec: 0,
  rec_yd: 0.1,
  rec_td: 6,
  rec_2pt: 2,
  rec_target: 0,
  fg_made_0_39: 3,
  fg_made_40_49: 4,
  fg_made_50_59: 5,
  fg_made_60_plus: 6,
  fg_missed: -1,
  xp_made: 1,
  xp_missed: -1,
  dst_sack: 1,
  dst_int: 2,
  dst_fumble_rec: 2,
  dst_safety: 2,
  dst_td: 6,
  dst_blk: 2,
  dst_pts_allowed_0: 10,
  dst_pts_allowed_1_6: 7,
  dst_pts_allowed_7_13: 4,
  dst_pts_allowed_14_20: 1,
  dst_pts_allowed_21_27: 0,
  dst_pts_allowed_28_34: -1,
  dst_pts_allowed_35_plus: -4,
  dst_yds_allowed_0_99: 5,
  dst_yds_allowed_100_199: 3,
  dst_yds_allowed_200_299: 2,
  dst_yds_allowed_300_399: 0,
  dst_yds_allowed_400_plus: -1,
  fumble_lost: -2,
  fumble: 0,
  return_td: 6,
};

export const PPR_SCORING: ScoringRules = { ...DEFAULT_SCORING, rec: 1 };
export const HALF_PPR_SCORING: ScoringRules = { ...DEFAULT_SCORING, rec: 0.5 };

export const SCORING_CATEGORIES: Record<string, Array<keyof ScoringRules>> = {
  Passing: ['pass_yd', 'pass_td', 'pass_int', 'pass_2pt', 'pass_inc', 'pass_att'],
  Rushing: ['rush_yd', 'rush_td', 'rush_att', 'rush_2pt'],
  Receiving: ['rec', 'rec_yd', 'rec_td', 'rec_2pt', 'rec_target'],
  Kicking: ['fg_made_0_39', 'fg_made_40_49', 'fg_made_50_59', 'fg_made_60_plus', 'fg_missed', 'xp_made', 'xp_missed'],
  Defense: [
    'dst_sack', 'dst_int', 'dst_fumble_rec', 'dst_safety', 'dst_td', 'dst_blk',
    'dst_pts_allowed_0', 'dst_pts_allowed_1_6', 'dst_pts_allowed_7_13',
    'dst_pts_allowed_14_20', 'dst_pts_allowed_21_27', 'dst_pts_allowed_28_34', 'dst_pts_allowed_35_plus',
    'dst_yds_allowed_0_99', 'dst_yds_allowed_100_199', 'dst_yds_allowed_200_299',
    'dst_yds_allowed_300_399', 'dst_yds_allowed_400_plus',
  ],
  Miscellaneous: ['fumble_lost', 'fumble', 'return_td'],
};

export const SCORING_LABELS: Record<keyof ScoringRules, string> = {
  pass_yd: 'Passing Yards',
  pass_td: 'Passing Touchdowns',
  pass_int: 'Interceptions Thrown',
  pass_2pt: 'Passing 2-Pt Conversion',
  pass_inc: 'Incomplete Pass',
  pass_att: 'Pass Attempt',
  rush_yd: 'Rushing Yards',
  rush_td: 'Rushing Touchdowns',
  rush_att: 'Rush Attempt',
  rush_2pt: 'Rushing 2-Pt Conversion',
  rec: 'Reception',
  rec_yd: 'Receiving Yards',
  rec_td: 'Receiving Touchdowns',
  rec_2pt: 'Receiving 2-Pt Conversion',
  rec_target: 'Target',
  fg_made_0_39: 'FG Made (0-39 yds)',
  fg_made_40_49: 'FG Made (40-49 yds)',
  fg_made_50_59: 'FG Made (50-59 yds)',
  fg_made_60_plus: 'FG Made (60+ yds)',
  fg_missed: 'FG Missed',
  xp_made: 'Extra Point Made',
  xp_missed: 'Extra Point Missed',
  dst_sack: 'Sack',
  dst_int: 'Interception',
  dst_fumble_rec: 'Fumble Recovery',
  dst_safety: 'Safety',
  dst_td: 'Defensive Touchdown',
  dst_blk: 'Blocked Kick',
  dst_pts_allowed_0: 'Pts Allowed: 0',
  dst_pts_allowed_1_6: 'Pts Allowed: 1-6',
  dst_pts_allowed_7_13: 'Pts Allowed: 7-13',
  dst_pts_allowed_14_20: 'Pts Allowed: 14-20',
  dst_pts_allowed_21_27: 'Pts Allowed: 21-27',
  dst_pts_allowed_28_34: 'Pts Allowed: 28-34',
  dst_pts_allowed_35_plus: 'Pts Allowed: 35+',
  dst_yds_allowed_0_99: 'Yds Allowed: 0-99',
  dst_yds_allowed_100_199: 'Yds Allowed: 100-199',
  dst_yds_allowed_200_299: 'Yds Allowed: 200-299',
  dst_yds_allowed_300_399: 'Yds Allowed: 300-399',
  dst_yds_allowed_400_plus: 'Yds Allowed: 400+',
  fumble_lost: 'Fumble Lost',
  fumble: 'Fumble',
  return_td: 'Return Touchdown',
};
