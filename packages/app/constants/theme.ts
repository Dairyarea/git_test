export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1D4ED8',
  accent: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#0a1628',
  surface: '#1a2740',
  surfaceHigh: '#243350',
  border: '#2a3a52',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  success: '#10B981',
};

export const POSITION_COLORS: Record<string, { bg: string; text: string }> = {
  QB: { bg: '#EF444422', text: '#EF4444' },
  RB: { bg: '#10B98122', text: '#10B981' },
  WR: { bg: '#3B82F622', text: '#3B82F6' },
  TE: { bg: '#F59E0B22', text: '#F59E0B' },
  K: { bg: '#8B5CF622', text: '#8B5CF6' },
  DEF: { bg: '#6B728022', text: '#9CA3AF' },
  FLEX: { bg: '#EC489922', text: '#EC4899' },
};

export const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#10B981',
  INJURED: '#EF4444',
  OUT: '#EF4444',
  BYE: '#F59E0B',
  QUESTIONABLE: '#F59E0B',
  DOUBTFUL: '#EF4444',
  SUSPENDED: '#6B7280',
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '800' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  h3: { fontSize: 18, fontWeight: '700' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodyBold: { fontSize: 15, fontWeight: '600' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  captionBold: { fontSize: 12, fontWeight: '600' as const },
};
