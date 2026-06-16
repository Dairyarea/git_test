import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useLeague, useUpdateLeagueSettings } from '../../../hooks/useLeague';
import { RosterSlotConfig, DEFAULT_ROSTER_SLOTS } from '@ff/shared';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

const AVAILABLE_SLOTS: RosterSlotConfig[] = [
  ...DEFAULT_ROSTER_SLOTS,
  { slot: 'SUPERFLEX', label: 'Superflex (QB/RB/WR/TE)', eligiblePositions: ['QB', 'RB', 'WR', 'TE'], count: 1 },
  { slot: 'OP', label: 'Offensive Player (Any)', eligiblePositions: ['QB', 'RB', 'WR', 'TE', 'K'], count: 1 },
  { slot: 'RB/WR', label: 'RB/WR Flex', eligiblePositions: ['RB', 'WR'], count: 1 },
  { slot: 'WR/TE', label: 'WR/TE Flex', eligiblePositions: ['WR', 'TE'], count: 1 },
];

export default function RosterSettingsScreen() {
  const { activeLeagueId } = useLeagueStore();
  const { data: league, isLoading } = useLeague(activeLeagueId || '');
  const { mutate: updateSettings, isPending: isSaving } = useUpdateLeagueSettings(activeLeagueId || '');

  const [slots, setSlots] = useState<RosterSlotConfig[]>(
    (league?.settings?.rosterSlots as RosterSlotConfig[]) || DEFAULT_ROSTER_SLOTS,
  );

  const updateCount = (slotType: string, delta: number) => {
    setSlots((prev) =>
      prev.map((s) => s.slot === slotType ? { ...s, count: Math.max(0, s.count + delta) } : s),
    );
  };

  const addSlot = (slot: RosterSlotConfig) => {
    if (slots.find((s) => s.slot === slot.slot)) {
      updateCount(slot.slot, 1);
    } else {
      setSlots((prev) => [...prev, { ...slot, count: 1 }]);
    }
  };

  const removeSlot = (slotType: string) => {
    setSlots((prev) => prev.filter((s) => s.slot !== slotType));
  };

  const totalRosterSize = slots.reduce((sum, s) => sum + s.count, 0);

  const handleSave = () => {
    updateSettings(
      { rosterSlots: slots, rosterSize: totalRosterSize },
      {
        onSuccess: () => Alert.alert('Saved', 'Roster settings updated.'),
        onError: () => Alert.alert('Error', 'Failed to save.'),
      },
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.summary}>
        <Text style={styles.summaryLabel}>Total Roster Size</Text>
        <Text style={styles.summaryValue}>{totalRosterSize} players</Text>
      </Card>

      <Text style={styles.sectionTitle}>Current Slots</Text>
      {slots.map((slot) => (
        <View key={slot.slot} style={styles.slotRow}>
          <View style={styles.slotInfo}>
            <Text style={styles.slotName}>{slot.label}</Text>
            <Text style={styles.slotPositions}>{slot.eligiblePositions.join(', ')}</Text>
          </View>
          <View style={styles.counter}>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateCount(slot.slot, -1)}>
              <Ionicons name="remove" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.counterVal}>{slot.count}</Text>
            <TouchableOpacity style={styles.counterBtn} onPress={() => updateCount(slot.slot, 1)}>
              <Ionicons name="add" size={18} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => removeSlot(slot.slot)} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      ))}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Add Slot Type</Text>
      <View style={styles.addSlotGrid}>
        {AVAILABLE_SLOTS.filter((s) => !slots.find((existing) => existing.slot === s.slot)).map((slot) => (
          <TouchableOpacity key={slot.slot} style={styles.addSlotChip} onPress={() => addSlot(slot)}>
            <Ionicons name="add" size={14} color={COLORS.primary} />
            <Text style={styles.addSlotText}>{slot.slot}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button label="Save Roster Settings" onPress={handleSave} loading={isSaving} style={styles.saveBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  summaryLabel: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  summaryValue: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, marginBottom: 10 },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 12,
    marginBottom: 6,
    gap: 10,
  },
  slotInfo: { flex: 1 },
  slotName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  slotPositions: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  counter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  counterBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterVal: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, width: 24, textAlign: 'center' },
  removeBtn: { padding: 4 },
  addSlotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  addSlotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary + '44',
  },
  addSlotText: { ...TYPOGRAPHY.captionBold, color: COLORS.primary },
  saveBtn: { marginTop: 24 },
});
