import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LineupSlot } from '@ff/shared';
import { PlayerCard } from './PlayerCard';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface RosterSlotProps {
  slot: LineupSlot;
  onPlayerPress?: (playerId: string) => void;
  onSlotPress?: (slot: LineupSlot) => void;
  points?: number;
  isLocked?: boolean;
}

export function RosterSlotRow({ slot, onPlayerPress, onSlotPress, points }: RosterSlotProps) {
  return (
    <View style={styles.row}>
      <View style={styles.slotLabel}>
        <Text style={styles.slotText}>{slot.slotType}</Text>
      </View>
      {slot.player ? (
        <View style={styles.playerContainer}>
          <PlayerCard
            player={slot.player.player}
            onPress={() => onPlayerPress?.(slot.player!.playerId)}
            showPoints
            points={points}
            compact
          />
          {slot.isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={12} color={COLORS.textMuted} />
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity style={styles.emptySlot} onPress={() => onSlotPress?.(slot)}>
          <Ionicons name="add" size={18} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>
            {slot.eligiblePositions.join('/')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  slotLabel: {
    width: 52,
    alignItems: 'center',
  },
  slotText: {
    ...TYPOGRAPHY.captionBold,
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },
  playerContainer: {
    flex: 1,
    position: 'relative',
  },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  emptySlot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
});
