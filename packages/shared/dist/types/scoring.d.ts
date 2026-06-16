export interface ScoringRules {
    pass_yd: number;
    pass_td: number;
    pass_int: number;
    pass_2pt: number;
    pass_inc: number;
    pass_att: number;
    rush_yd: number;
    rush_td: number;
    rush_att: number;
    rush_2pt: number;
    rec: number;
    rec_yd: number;
    rec_td: number;
    rec_2pt: number;
    rec_target: number;
    fg_made_0_39: number;
    fg_made_40_49: number;
    fg_made_50_59: number;
    fg_made_60_plus: number;
    fg_missed: number;
    xp_made: number;
    xp_missed: number;
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
export declare const DEFAULT_SCORING: ScoringRules;
export declare const PPR_SCORING: ScoringRules;
export declare const HALF_PPR_SCORING: ScoringRules;
export declare const SCORING_CATEGORIES: Record<string, Array<keyof ScoringRules>>;
export declare const SCORING_LABELS: Record<keyof ScoringRules, string>;
//# sourceMappingURL=scoring.d.ts.map