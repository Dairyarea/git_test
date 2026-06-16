import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useLeague, useUpdateLeagueSettings } from '../../../hooks/useLeague';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { TradeVisibility } from '@ff/shared';

const REVIEW_PERIODS = [0, 1, 2, 3, 5, 7];
const VETO_THRESHOLDS = [1, 2, 3, 4, 5, 6];
const DEADLINE_WEEKS = [null, 9, 10, 11, 12, 13];

const VISIBILITY_OPTIONS: { value: TradeVisibility; label: string; desc: string }[] = [
  {
    value: 'PUBLIC',
    label: 'Public',
    desc: 'All league members see every trade proposal and result.',
  },
  {
    value: 'COMMISSIONER_ONLY',
    desc: 'Only the commissioner sees all trades. Other members only see their own.',
    label: 'Commissioner Only',
  },
  {
    value: 'TEAMS_ONLY',
    label: 'Secret Trades',
    desc: 'Only the two teams in a trade see it. League-wide trade history is hidden.',
  },
];

export default function TradeSettingsScreen() {
  const { activeLeagueId } = useLeagueStore();
  const { data: league } = useLeague(activeLeagueId || '');
  const { mutate: updateSettings, isPending } = useUpdateLeagueSettings(activeLeagueId || '');

  const settings = league?.settings;
  const [reviewPeriod, setReviewPeriod] = useState(settings?.tradeReviewPeriod ?? 2);
  const [vetoEnabled, setVetoEnabled] = useState(settings?.vetoVotingEnabled ?? true);
  const [vetoThreshold, setVetoThreshold] = useState(settings?.vetoThreshold ?? 4);
  const [deadlineWeek, setDeadlineWeek] = useState<number | null>(settings?.tradeDeadlineWeek ?? 12);
  const [instantTrades, setInstantTrades] = useState(settings?.instantTrades ?? false);
  const [tradeVisibility, setTradeVisibility] = useState<TradeVisibility>(
    (settings?.tradeVisibility as TradeVisibility) ?? 'PUBLIC',
  );
  const [anonymousManagers, setAnonymousManagers] = useState(settings?.anonymousManagers ?? false);

  const handleInstantToggle = (val: boolean) => {
    setInstantTrades(val);
    if (val) {
      // Instant trades supersede veto voting — disable veto to avoid confusion
      setVetoEnabled(false);
      setReviewPeriod(0);
    }
  };

  const handleSave = () => {
    updateSettings(
      {
        tradeReviewPeriod: instantTrades ? 0 : reviewPeriod,
        vetoVotingEnabled: instantTrades ? false : vetoEnabled,
        vetoThreshold,
        tradeDeadlineWeek: deadlineWeek,
        instantTrades,
        tradeVisibility,
        anonymousManagers,
      },
      {
        onSuccess: () => Alert.alert('Saved', 'Trade & privacy settings updated.'),
        onError: () => Alert.alert('Error', 'Failed to save.'),
      },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Instant Trades ── */}
      <Card style={styles.settingRow}>
        <View style={styles.settingRowInner}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Instant Trades</Text>
            <Text style={styles.settingDesc}>
              Trades execute the moment the receiving team accepts. Veto voting is bypassed — no takebacks.
            </Text>
          </View>
          <Switch
            value={instantTrades}
            onValueChange={handleInstantToggle}
            trackColor={{ true: COLORS.accent }}
            thumbColor="#fff"
          />
        </View>
        {instantTrades && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningText}>
              ⚡ Accepted trades execute immediately and cannot be vetoed.
            </Text>
          </View>
        )}
      </Card>

      {/* ── Trade Deadline ── */}
      <Card style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Trade Deadline</Text>
          <Text style={styles.settingDesc}>No trades are allowed after this week.</Text>
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

      {/* ── Review period + veto — only shown when instant trades is off ── */}
      {!instantTrades && (
        <>
          <Card style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Trade Review Period</Text>
              <Text style={styles.settingDesc}>
                Days the receiving team has to accept or reject before a proposal expires.
              </Text>
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
                <Text style={styles.settingDesc}>
                  League members can vote to block accepted trades during the review window.
                </Text>
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
        </>
      )}

      {/* ── Trade Visibility ── */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Trade Visibility</Text>
        <Text style={styles.sectionDesc}>Controls who can see trades in the league activity feed.</Text>
      </View>

      {VISIBILITY_OPTIONS.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.optionCard, tradeVisibility === opt.value && styles.optionCardActive]}
          onPress={() => setTradeVisibility(opt.value)}
          activeOpacity={0.8}
        >
          <View style={[styles.radio, tradeVisibility === opt.value && styles.radioActive]}>
            {tradeVisibility === opt.value && <View style={styles.radioDot} />}
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionLabel}>{opt.label}</Text>
            <Text style={styles.optionDesc}>{opt.desc}</Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* ── Anonymous Managers ── */}
      <View style={[styles.sectionHeader, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>Manager Anonymity</Text>
        <Text style={styles.sectionDesc}>
          Hides real account names from other league members. Team names are still visible.
          Commissioners always see real names.
        </Text>
      </View>

      <Card style={styles.settingRow}>
        <View style={styles.settingRowInner}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Anonymous Managers</Text>
            <Text style={styles.settingDesc}>
              Show "Manager" instead of display names in standings, matchups, and trades.
            </Text>
          </View>
          <Switch
            value={anonymousManagers}
            onValueChange={setAnonymousManagers}
            trackColor={{ true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
        {anonymousManagers && (
          <View style={[styles.warningBanner, { backgroundColor: COLORS.primary + '22' }]}>
            <Text style={[styles.warningText, { color: COLORS.primary }]}>
              🕵️ Manager identities are hidden from other members. You (commissioner) still see real names.
            </Text>
          </View>
        )}
      </Card>

      <Button label="Save Settings" onPress={handleSave} loading={isPending} style={styles.saveBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 48, gap: 10 },
  settingRow: { gap: 10 },
  settingRowInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  settingInfo: { flex: 1 },
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
  warningBanner: {
    backgroundColor: COLORS.accent + '22',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  warningText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: '600',
  },
  sectionHeader: { paddingTop: 8 },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  sectionDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
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
    flexShrink: 0,
  },
  radioActive: { borderColor: COLORS.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  optionBody: { flex: 1 },
  optionLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  optionDesc: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, marginTop: 2 },
  saveBtn: { marginTop: 8 },
});
