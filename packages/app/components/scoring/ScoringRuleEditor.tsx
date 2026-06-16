import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from 'react-native';
import {
  ScoringRules,
  ScoringBonus,
  SCORING_CATEGORIES,
  SCORING_LABELS,
  DEFAULT_SCORING,
  PPR_SCORING,
  HALF_PPR_SCORING,
} from '@ff/shared';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface ScoringRuleEditorProps {
  initialRules: ScoringRules;
  initialBonuses: ScoringBonus[];
  onSave: (rules: ScoringRules, bonuses: ScoringBonus[]) => void;
  previewPoints?: Record<string, number>;
  onPreview?: (rules: ScoringRules, bonuses: ScoringBonus[]) => void;
  isSaving?: boolean;
}

const PRESETS = [
  { label: 'Standard', rules: DEFAULT_SCORING },
  { label: 'PPR', rules: PPR_SCORING },
  { label: 'Half PPR', rules: HALF_PPR_SCORING },
];

export function ScoringRuleEditor({
  initialRules,
  initialBonuses,
  onSave,
  previewPoints,
  onPreview,
  isSaving,
}: ScoringRuleEditorProps) {
  const [rules, setRules] = useState<ScoringRules>(initialRules);
  const [bonuses, setBonuses] = useState<ScoringBonus[]>(initialBonuses);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Passing');

  const updateRule = useCallback((key: keyof ScoringRules, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      setRules((prev) => ({ ...prev, [key]: num }));
    }
  }, []);

  const applyPreset = useCallback((preset: { rules: ScoringRules }) => {
    setRules(preset.rules);
    onPreview?.(preset.rules, bonuses);
  }, [bonuses, onPreview]);

  const addBonus = () => {
    setBonuses((prev) => [
      ...prev,
      { stat: 'pass_yd', threshold: 300, bonus: 3, label: '' },
    ]);
  };

  const removeBonus = (idx: number) => {
    setBonuses((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateBonus = (idx: number, field: keyof ScoringBonus, value: string | number) => {
    setBonuses((prev) =>
      prev.map((b, i) =>
        i === idx ? { ...b, [field]: typeof value === 'string' ? parseFloat(value) || value : value } : b,
      ),
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.presets}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p.label}
            style={[styles.presetChip, rules.rec === p.rules.rec && styles.presetChipActive]}
            onPress={() => applyPreset(p)}
          >
            <Text style={[styles.presetText, rules.rec === p.rules.rec && styles.presetTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {previewPoints && (
        <Card style={styles.previewCard}>
          <Text style={styles.sectionTitle}>Sample Scores</Text>
          <View style={styles.previewGrid}>
            {Object.entries(previewPoints).map(([pos, pts]) => (
              <View key={pos} style={styles.previewItem}>
                <Text style={styles.previewPos}>{pos}</Text>
                <Text style={styles.previewPts}>{pts.toFixed(1)}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {Object.entries(SCORING_CATEGORIES).map(([category, keys]) => (
        <View key={category} style={styles.categorySection}>
          <TouchableOpacity
            style={styles.categoryHeader}
            onPress={() => setExpandedCategory(expandedCategory === category ? null : category)}
          >
            <Text style={styles.categoryTitle}>{category}</Text>
            <Text style={styles.chevron}>{expandedCategory === category ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {expandedCategory === category && (
            <View style={styles.categoryBody}>
              {keys.map((key) => (
                <View key={key} style={styles.ruleRow}>
                  <Text style={styles.ruleLabel}>{SCORING_LABELS[key]}</Text>
                  <TextInput
                    style={styles.ruleInput}
                    value={String(rules[key])}
                    onChangeText={(v) => updateRule(key, v)}
                    onBlur={() => onPreview?.(rules, bonuses)}
                    keyboardType="decimal-pad"
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.bonusSection}>
        <View style={styles.bonusHeader}>
          <Text style={styles.sectionTitle}>Bonuses</Text>
          <TouchableOpacity onPress={addBonus}>
            <Text style={styles.addBonus}>+ Add Bonus</Text>
          </TouchableOpacity>
        </View>

        {bonuses.map((bonus, idx) => (
          <Card key={idx} style={styles.bonusCard}>
            <View style={styles.bonusRow}>
              <TextInput
                style={[styles.ruleInput, styles.bonusInput]}
                placeholder="Stat"
                placeholderTextColor={COLORS.textMuted}
                value={bonus.stat}
                onChangeText={(v) => updateBonus(idx, 'stat', v)}
              />
              <TextInput
                style={[styles.ruleInput, styles.bonusInputNum]}
                placeholder="Threshold"
                placeholderTextColor={COLORS.textMuted}
                value={String(bonus.threshold)}
                onChangeText={(v) => updateBonus(idx, 'threshold', v)}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.ruleInput, styles.bonusInputNum]}
                placeholder="Bonus pts"
                placeholderTextColor={COLORS.textMuted}
                value={String(bonus.bonus)}
                onChangeText={(v) => updateBonus(idx, 'bonus', v)}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity onPress={() => removeBonus(idx)}>
                <Text style={styles.removeBonus}>✕</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>

      <Button
        label="Save Scoring Settings"
        onPress={() => onSave(rules, bonuses)}
        loading={isSaving}
        style={styles.saveBtn}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  presets: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceHigh,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  presetChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '22',
  },
  presetText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  presetTextActive: {
    color: COLORS.primary,
  },
  previewCard: {
    marginBottom: 16,
  },
  previewGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  previewItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  previewPos: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textSecondary,
  },
  previewPts: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  categorySection: {
    marginBottom: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    marginBottom: 2,
  },
  categoryTitle: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
  },
  chevron: {
    color: COLORS.textMuted,
    fontSize: 12,
  },
  categoryBody: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ruleLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    flex: 1,
    paddingRight: 12,
  },
  ruleInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.textPrimary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 64,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  bonusSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  bonusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addBonus: {
    color: COLORS.primary,
    ...TYPOGRAPHY.bodyBold,
  },
  bonusCard: {
    marginBottom: 8,
  },
  bonusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bonusInput: {
    flex: 1,
    textAlign: 'left',
  },
  bonusInputNum: {
    minWidth: 80,
  },
  removeBonus: {
    color: COLORS.danger,
    fontSize: 18,
    paddingHorizontal: 4,
  },
  saveBtn: {
    marginTop: 24,
    marginBottom: 40,
  },
});
