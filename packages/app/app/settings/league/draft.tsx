import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useLeague } from '../../../hooks/useLeague';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { DraftType } from '@ff/shared';

const DRAFT_TYPES: { value: DraftType; label: string; desc: string }[] = [
  { value: 'SNAKE', label: 'Snake Draft', desc: 'Order reverses each round. Most common.' },
  { value: 'LINEAR', label: 'Linear Draft', desc: 'Same order every round.' },
  { value: 'AUCTION', label: 'Auction Draft', desc: 'Each team bids on players with a budget.' },
];

const TIMERS = [30, 60, 90, 120, 180, 300];

export default function DraftSettingsScreen() {
  const { activeLeagueId } = useLeagueStore();
  const { data: league } = useLeague(activeLeagueId || '');
  const qc = useQueryClient();

  const [draftType, setDraftType] = useState<DraftType>(
    (league?.draftConfig?.type as DraftType) || 'SNAKE',
  );
  const [timer, setTimer] = useState(league?.draftConfig?.pickTimerSeconds || 90);
  const [rounds, setRounds] = useState(league?.draftConfig?.rounds || 15);

  const { mutate: saveConfig, isPending } = useMutation({
    mutationFn: (data: any) =>
      api.put(`/leagues/${activeLeagueId}/draft/config`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leagues', activeLeagueId] });
      Alert.alert('Saved', 'Draft settings updated.');
    },
  });

  const { mutate: startDraft, isPending: isStarting } = useMutation({
    mutationFn: () =>
      api.post(`/leagues/${activeLeagueId}/draft/start`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leagues', activeLeagueId, 'draft'] });
      Alert.alert('Draft Started!', 'The draft is now live.');
    },
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>Draft Format</Text>
      {DRAFT_TYPES.map((dt) => (
        <TouchableOpacity
          key={dt.value}
          style={[styles.optionCard, draftType === dt.value && styles.optionCardActive]}
          onPress={() => setDraftType(dt.value)}
        >
          <View style={[styles.radio, draftType === dt.value && styles.radioActive]}>
            {draftType === dt.value && <View style={styles.radioDot} />}
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionLabel}>{dt.label}</Text>
            <Text style={styles.optionDesc}>{dt.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Pick Timer</Text>
      <View style={styles.timerGrid}>
        {TIMERS.map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.timerChip, timer === t && styles.timerChipActive]}
            onPress={() => setTimer(t)}
          >
            <Text style={[styles.timerText, timer === t && styles.timerTextActive]}>
              {t >= 60 ? `${t / 60}m` : `${t}s`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Rounds</Text>
      <View style={styles.timerGrid}>
        {[12, 13, 14, 15, 16, 17, 18, 20].map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.timerChip, rounds === r && styles.timerChipActive]}
            onPress={() => setRounds(r)}
          >
            <Text style={[styles.timerText, rounds === r && styles.timerTextActive]}>{r}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        label="Save Draft Settings"
        onPress={() => saveConfig({ type: draftType, pickTimerSeconds: timer, rounds })}
        loading={isPending}
        style={{ marginTop: 24 }}
      />

      {league?.draftConfig?.status === 'PENDING' && (
        <Button
          label="Start Draft Now"
          onPress={() => {
            Alert.alert('Start Draft?', 'This will immediately start the draft for all teams.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Start Draft', onPress: () => startDraft() },
            ]);
          }}
          variant="danger"
          loading={isStarting}
          style={{ marginTop: 12 }}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, marginBottom: 10 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  optionInfo: { flex: 1 },
  optionLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  optionDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  timerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timerChipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  timerText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textSecondary },
  timerTextActive: { color: COLORS.primary },
});
