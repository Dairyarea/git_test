import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Player, PlayerSearchResult } from '@ff/shared';
import { PositionBadge } from './PositionBadge';
import { COLORS, STATUS_COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface PlayerCardProps {
  player: Player | PlayerSearchResult;
  onPress?: () => void;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  showPoints?: boolean;
  points?: number;
  compact?: boolean;
}

export function PlayerCard({
  player,
  onPress,
  onAction,
  actionIcon = 'add-circle',
  showPoints = false,
  points,
  compact = false,
}: PlayerCardProps) {
  const statusColor = STATUS_COLORS[player.status] || COLORS.textMuted;

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {'photoUrl' in player && player.photoUrl ? (
        <Image source={{ uri: player.photoUrl }} style={styles.photo} />
      ) : (
        <View style={styles.photoPlaceholder}>
          <Ionicons name="person" size={20} color={COLORS.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <PositionBadge position={player.position} size="sm" />
          <Text style={styles.name} numberOfLines={1}>{player.name}</Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.team}>{player.nflTeam}</Text>
          {player.status !== 'ACTIVE' && (
            <Text style={[styles.status, { color: statusColor }]}>
              {' · '}{player.status}
            </Text>
          )}
        </View>
      </View>

      {showPoints && (
        <Text style={styles.points}>{points != null ? points.toFixed(1) : '—'}</Text>
      )}

      {'isOwned' in player && player.isOwned && !onAction && (
        <Text style={styles.owned} numberOfLines={1}>{player.ownerTeamName}</Text>
      )}

      {onAction && (
        <TouchableOpacity onPress={onAction} style={styles.action}>
          <Ionicons name={actionIcon} size={26} color={COLORS.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  cardCompact: {
    paddingVertical: 8,
    borderRadius: 8,
  },
  photo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceHigh,
  },
  photoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 3,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    ...TYPOGRAPHY.bodyBold,
    color: COLORS.textPrimary,
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  team: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  status: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
  },
  points: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    minWidth: 44,
    textAlign: 'right',
  },
  owned: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    maxWidth: 80,
  },
  action: {
    padding: 4,
  },
});
