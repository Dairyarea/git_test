import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useLeague, useUpdateLeagueSettings } from '../../../hooks/useLeague';
import { Button } from '../../../components/ui/Button';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { PlayoffFormat, Tiebreaker } from '@ff/shared';

const FORMATS: { value: PlayoffFormat; label: string; desc: string }[] = [
  { value: 'SINGLE_ELIMINATION', label: 'Single Elimination', desc: 'One loss and you\'re out.' },
  { value: 'DOUBLE_ELIMINATION', label: 'Double Elimination', desc: 'Two losses to be eliminated.' },
  { value: 'TOTAL_POINTS', label: 'Total Points', desc: 'Highest cumulative score wins.' },
];

const TEAM_COUNTS = [2, 4, 6, 8, 10];
const START_WEEKS = [13, 14, 15, 16];
const TIEBREAKERS: { value: Tiebreaker; label: string }[] = [
  { value: 'POINTS_FOR', label: 'Total Points For' },
  { value: 'HEAD_TO_HEAD', label: 'Head-to-Head Record' },
  { value: 'BENCH_POINTS', label: 'Bench Points' },
  { value: 'POINTS_AGAINST', label: 'Points Against' },
  { value: 'COIN_FLIP', label: 'Coin Flip' },
];

export default function PlayoffSettingsScreen() {
  const { activeLeagueId } = useLeagueStore();
  const { data: league } = useLeague(activeLeagueId || '');
  const { mutate: updateSettings, isPending } = useUpdateLeagueSettings(activeLeagueId || '');

  const [format, setFormat] = useState<PlayoffFormat>(
    (league?.settings?.playoffFormat as PlayoffFormat) || 'SINGLE_ELIMINATION',
  );
  const [teamCount, setTeamCount] = useState(league?.settings?.playoffTeamCount || 6);
  const [startWeek, setStartWeek] = useState(league?.settings?.playoffStartWeek || 14);
  const [tiebreakers, setTiebreakers] = useState<Tiebreaker[]>(
    (league?.settings?.tiebreakers as Tiebreaker[]) || ['POINTS_FOR', 'HEAD_TO_HEAD'],
  );

  const moveTiebreaker = (value: Tiebreaker, dir: -1 | 1) => {
    const idx = tiebreakers.indexOf(value);
    if (idx + dir < 0 || idx + dir >= tiebreakers.length) return;
    const next = [...tiebreakers];
    [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
    setTiebreakers(next);
  };

  const toggleTiebreaker = (value: Tiebreaker) => {
    setTiebreakers((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value],
    );
  };

  const handleSave = () => {
    updateSettings(
      { playoffFormat: format, playoffTeamCount: teamCount, playoffStartWeek: startWeek, tiebreakers },
      {
        onSuccess: () => Alert.alert('Saved', 'Playoff settings updated.'),
        onError: () => Alert.alert('Error', 'Failed to save.'),
      },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Playoff Format</Text>
      {FORMATS.map((f) => (
        <TouchableOpacity
          key={f.value}
          style={[styles.optionCard, format === f.value && styles.optionCardActive]}
          onPress={() => setFormat(f.value)}
        >
          <View style={[styles.radio, format === f.value && styles.radioActive]}>
            {format === f.value && <View style={styles.radioDot} />}
          </View>
          <View>
            <Text style={styles.optionLabel}>{f.label}</Text>
            <Text style={styles.optionDesc}>{f.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Teams in Playoffs</Text>
      <View style={styles.chipGrid}>
        {TEAM_COUNTS.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.chip, teamCount === n && styles.chipActive]}
            onPress={() => setTeamCount(n)}
          >
            <Text style={[styles.chipText, teamCount === n && styles.chipTextActive]}>{n} teams</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Playoffs Start Week</Text>
      <View style={styles.chipGrid}>
        {START_WEEKS.map((w) => (
          <TouchableOpacity
            key={w}
            style={[styles.chip, startWeek === w && styles.chipActive]}
            onPress={() => setStartWeek(w)}
          >
            <Text style={[styles.chipText, startWeek === w && styles.chipTextActive]}>Week {w}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Tiebreakers (drag to reorder)</Text>
      {tiebreakers.map((t, i) => (
        <View key={t} style={styles.tiebreakerRow}>
          <Text style={styles.tiebreakerNum}>{i + 1}.</Text>
          <Text style={styles.tiebreakerLabel}>
            {TIEBREAKERS.find((tb) => tb.value === t)?.label}
          </Text>
          <View style={styles.tiebreakerBtns}>
            <TouchableOpacity onPress={() => moveTiebreaker(t, -1)} disabled={i === 0}>
              <Text style={[styles.arrow, i === 0 && styles.arrowDisabled]}>▲</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => moveTiebreaker(t, 1)} disabled={i === tiebreakers.length - 1}>
              <Text style={[styles.arrow, i === tiebreakers.length - 1 && styles.arrowDisabled]}>▼</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => toggleTiebreaker(t)}>
              <Text style={styles.removeText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.addTiebreakers}>
        {TIEBREAKERS.filter((tb) => !tiebreakers.includes(tb.value)).map((tb) => (
          <TouchableOpacity key={tb.value} style={styles.addChip} onPress={() => toggleTiebreaker(tb.value)}>
            <Text style={styles.addChipText}>+ {tb.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button label="Save Playoff Settings" onPress={handleSave} loading={isPending} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, marginBottom: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  optionCardActive: { borderColor: COLORS.primary },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  optionLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  optionDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  chipText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary },
  tiebreakerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 8,
  },
  tiebreakerNum: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, width: 20 },
  tiebreakerLabel: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, flex: 1 },
  tiebreakerBtns: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  arrow: { fontSize: 16, color: COLORS.textSecondary },
  arrowDisabled: { color: COLORS.border },
  removeText: { color: COLORS.danger, fontSize: 16 },
  addTiebreakers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  addChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addChipText: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
});
