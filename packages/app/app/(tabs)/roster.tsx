import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  RefreshControl,
  Alert,
} from 'react-native';
import { useLeagueStore } from '../../stores/leagueStore';
import { useMyTeam, useSetLineup, useDropPlayer } from '../../hooks/useRoster';
import { RosterSlotRow } from '../../components/roster/RosterSlot';
import { PlayerSearch } from '../../components/draft/PlayerSearch';
import { Skeleton } from '../../components/ui/Skeleton';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { LineupSlot, RosterSlot, DEFAULT_ROSTER_SLOTS } from '@ff/shared';
import { Ionicons } from '@expo/vector-icons';

export default function RosterScreen() {
  const { activeLeagueId } = useLeagueStore();
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<LineupSlot | null>(null);

  const { data: team, isLoading, refetch, isRefetching } = useMyTeam(activeLeagueId || '');
  const { mutate: setLineup } = useSetLineup(activeLeagueId || '');
  const { mutate: dropPlayer } = useDropPlayer(activeLeagueId || '');

  if (!activeLeagueId) {
    return (
      <View style={styles.empty}>
        <Ionicons name="people-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Select a league from the Home tab</Text>
      </View>
    );
  }

  const buildLineupSlots = (): LineupSlot[] => {
    if (!team?.roster) return [];
    const rosterBySlot = new Map<string, RosterSlot[]>();
    for (const slot of team.roster) {
      const arr = rosterBySlot.get(slot.slotType) || [];
      arr.push(slot);
      rosterBySlot.set(slot.slotType, arr);
    }

    const slots: LineupSlot[] = [];
    for (const slotConfig of DEFAULT_ROSTER_SLOTS) {
      const filledSlots = rosterBySlot.get(slotConfig.slot) || [];
      for (let i = 0; i < slotConfig.count; i++) {
        slots.push({
          slotType: slotConfig.slot,
          slotLabel: slotConfig.label,
          eligiblePositions: slotConfig.eligiblePositions as any,
          player: filledSlots[i] || null,
          isLocked: false,
        });
      }
    }
    return slots;
  };

  const lineupSlots = buildLineupSlots();
  const activeSots = lineupSlots.filter((s) => s.slotType !== 'BN' && s.slotType !== 'IR');
  const benchSlots = lineupSlots.filter((s) => s.slotType === 'BN');
  const irSlots = lineupSlots.filter((s) => s.slotType === 'IR');

  const handleDropPlayer = (playerId: string) => {
    Alert.alert('Drop Player', 'Release this player to free agency?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Drop',
        style: 'destructive',
        onPress: () => dropPlayer(playerId),
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      {isLoading ? (
        <>
          {[...Array(8)].map((_, i) => <Skeleton key={i} height={56} borderRadius={8} style={{ marginBottom: 8 }} />)}
        </>
      ) : (
        <>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{team?.name}</Text>
            <Text style={styles.record}>{team?.wins ?? 0}-{team?.losses ?? 0}</Text>
          </View>

          <Text style={styles.sectionLabel}>STARTERS</Text>
          {activeSots.map((slot, i) => (
            <RosterSlotRow
              key={`starter-${i}`}
              slot={slot}
              onSlotPress={(s) => {
                setSelectedSlot(s);
                setAddModalVisible(true);
              }}
              onPlayerPress={(pid) => handleDropPlayer(pid)}
            />
          ))}

          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>BENCH</Text>
          {benchSlots.map((slot, i) => (
            <RosterSlotRow
              key={`bench-${i}`}
              slot={slot}
              onSlotPress={(s) => {
                setSelectedSlot(s);
                setAddModalVisible(true);
              }}
            />
          ))}

          {irSlots.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 16 }]}>INJURED RESERVE</Text>
              {irSlots.map((slot, i) => (
                <RosterSlotRow key={`ir-${i}`} slot={slot} />
              ))}
            </>
          )}
        </>
      )}

      <Modal
        visible={addModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Player</Text>
            <TouchableOpacity onPress={() => setAddModalVisible(false)}>
              <Ionicons name="close" size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>
          <PlayerSearch
            leagueId={activeLeagueId}
            onSelect={(playerId) => {
              setAddModalVisible(false);
            }}
          />
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
  teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  teamName: { ...TYPOGRAPHY.h2, color: COLORS.textPrimary },
  record: { ...TYPOGRAPHY.h3, color: COLORS.textSecondary },
  sectionLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 8 },
  modal: { flex: 1, backgroundColor: COLORS.background, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
});
