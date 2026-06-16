import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useLeague, useUpdateLeagueSettings } from '../../../hooks/useLeague';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';

const REVIEW_PERIODS = [0, 1, 2, 3, 5, 7];
const VETO_THRESHOLDS = [1, 2, 3, 4, 5, 6];
const DEADLINE_WEEKS = [null, 9, 10, 11, 12, 13];

export default function TradeSettingsScreen() {
  const { activeLeagueId } = useLeagueStore();
  const { data: league } = useLeague(activeLeagueId || '');
  const { mutate: updateSettings, isPending } = useUpdateLeagueSettings(activeLeagueId || '');

  const settings = league?.settings;
  const [reviewPeriod, setReviewPeriod] = useState(settings?.tradeReviewPeriod ?? 2);
  const [vetoEnabled, setVetoEnabled] = useState(settings?.vetoVotingEnabled ?? true);
  const [vetoThreshold, setVetoThreshold] = useState(settings?.vetoThreshold ?? 4);
  const [deadlineWeek, setDeadlineWeek] = useState<number | null>(settings?.tradeDeadlineWeek ?? 12);

  const handleSave = () => {
    updateSettings(
      {
        tradeReviewPeriod: reviewPeriod,
        vetoVotingEnabled: vetoEnabled,
        vetoThreshold,
        tradeDeadlineWeek: deadlineWeek,
      },
      {
        onSuccess: () => Alert.alert('Saved', 'Trade settings updated.'),
        onError: () => Alert.alert('Error', 'Failed to save.'),
      },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Trade Deadline</Text>
          <Text style={styles.settingDesc}>After this week, no trades are allowed.</Text>
        </View>
        <View style={styles.chipGrid}>
          {DEADLINE_WEEKS.map((w) => (
            <TouchableOpacity
              key={String(w)}
              style={[styles.chip, deadlineWeek === w && styles.chipActive]}
              onPress={() => setDeadlineWeek(w)}
            >
              <Text style={[styles.chipText, deadlineWeek === w && styles.chipTextActive]}>
                {w === null ? 'None' : `Wk ${w}`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Trade Review Period</Text>
          <Text style={styles.settingDesc}>Days receiving team has to accept or reject.</Text>
        </View>
        <View style={styles.chipGrid}>
          {REVIEW_PERIODS.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.chip, reviewPeriod === d && styles.chipActive]}
              onPress={() => setReviewPeriod(d)}
            >
              <Text style={[styles.chipText, reviewPeriod === d && styles.chipTextActive]}>
                {d === 0 ? 'Instant' : `${d}d`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card style={styles.settingRow}>
        <View style={styles.settingRowInner}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Veto Voting</Text>
            <Text style={styles.settingDesc}>League members can vote to veto trades.</Text>
          </View>
          <Switch
            value={vetoEnabled}
            onValueChange={setVetoEnabled}
            trackColor={{ true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
        {vetoEnabled && (
          <View style={{ marginTop: 12 }}>
            <Text style={styles.settingLabel}>Votes Needed to Veto</Text>
            <View style={[styles.chipGrid, { marginTop: 8 }]}>
              {VETO_THRESHOLDS.map((n) => (
                <TouchableOpacity
                  key={n}
                  style={[styles.chip, vetoThreshold === n && styles.chipActive]}
                  onPress={() => setVetoThreshold(n)}
                >
                  <Text style={[styles.chipText, vetoThreshold === n && styles.chipTextActive]}>
                    {n} vote{n !== 1 ? 's' : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </Card>

      <Button label="Save Trade Settings" onPress={handleSave} loading={isPending} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40, gap: 10 },
  settingRow: { gap: 10 },
  settingRowInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  settingInfo: { marginBottom: 4 },
  settingLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  settingDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  chipActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '22' },
  chipText: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.primary },
});
