import React from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useScoringConfig, useScoringPreview } from '../../../hooks/useScoring';
import { useUpdateScoringConfig } from '../../../hooks/useLeague';
import { ScoringRuleEditor } from '../../../components/scoring/ScoringRuleEditor';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { DEFAULT_SCORING, ScoringRules, ScoringBonus } from '@ff/shared';

export default function ScoringSettingsScreen() {
  const { activeLeagueId } = useLeagueStore();
  const { data: scoringConfig, isLoading } = useScoringConfig(activeLeagueId || '');
  const { mutate: updateScoring, isPending: isSaving } = useUpdateScoringConfig(activeLeagueId || '');
  const { mutate: preview, data: previewData } = useScoringPreview(activeLeagueId || '');

  if (!activeLeagueId) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No league selected</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  const handleSave = (rules: ScoringRules, bonuses: ScoringBonus[]) => {
    updateScoring(
      { rules, bonuses, pprValue: rules.rec },
      {
        onSuccess: () => Alert.alert('Saved', 'Scoring settings updated.'),
        onError: () => Alert.alert('Error', 'Failed to save scoring settings.'),
      },
    );
  };

  return (
    <View style={styles.container}>
      <ScoringRuleEditor
        initialRules={(scoringConfig?.rules as ScoringRules) || DEFAULT_SCORING}
        initialBonuses={(scoringConfig?.bonuses as ScoringBonus[]) || []}
        onSave={handleSave}
        previewPoints={previewData?.previews}
        onPreview={(rules, bonuses) => preview({ rules, bonuses })}
        isSaving={isSaving}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});
