import React from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { PositionBadge } from '../../components/roster/PositionBadge';
import { Badge } from '../../components/ui/Badge';
import { COLORS, TYPOGRAPHY, STATUS_COLORS } from '../../constants/theme';
import { SCORING_LABELS } from '@ff/shared';

export default function PlayerDetailScreen() {
  const { playerId } = useLocalSearchParams<{ playerId: string }>();

  const { data: player, isLoading } = useQuery({
    queryKey: ['players', playerId],
    queryFn: () => api.get(`/players/${playerId}`).then((r) => r.data),
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!player) return null;

  const statusColor = STATUS_COLORS[player.status] || COLORS.textMuted;
  const weeklyStats = player.weeklyStats || {};
  const weeks = Object.keys(weeklyStats).sort((a, b) => parseInt(b) - parseInt(a));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        {player.photoUrl ? (
          <Image source={{ uri: player.photoUrl }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder} />
        )}
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{player.name}</Text>
          <View style={styles.meta}>
            <PositionBadge position={player.position} />
            <Text style={styles.team}>{player.nflTeam}</Text>
            {player.jerseyNumber && <Text style={styles.jersey}>#{player.jerseyNumber}</Text>}
          </View>
          {player.status !== 'ACTIVE' && (
            <Badge label={player.status} color={statusColor + '33'} textColor={statusColor} />
          )}
          {player.injuryNote && (
            <Text style={styles.injuryNote}>{player.injuryNote}</Text>
          )}
        </View>
      </View>

      {player.byeWeek && (
        <Card style={styles.byeCard}>
          <Text style={styles.byeLabel}>Bye Week</Text>
          <Text style={styles.byeValue}>{player.byeWeek}</Text>
        </Card>
      )}

      {weeks.length > 0 && (
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Weekly Stats</Text>
          {weeks.slice(0, 8).map((week) => {
            const stats = weeklyStats[week] as Record<string, number>;
            const statKeys = Object.keys(stats).filter((k) => stats[k] !== 0);
            if (statKeys.length === 0) return null;
            return (
              <Card key={week} style={styles.weekCard}>
                <Text style={styles.weekLabel}>Week {week}</Text>
                <View style={styles.statsGrid}>
                  {statKeys.map((k) => (
                    <View key={k} style={styles.statItem}>
                      <Text style={styles.statValue}>{stats[k]}</Text>
                      <Text style={styles.statLabel}>
                        {(SCORING_LABELS as any)[k] || k}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  photo: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface },
  photoPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface },
  headerInfo: { flex: 1, gap: 6, justifyContent: 'center' },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  team: { ...TYPOGRAPHY.bodyBold, color: COLORS.textSecondary },
  jersey: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  injuryNote: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, fontStyle: 'italic' },
  byeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  byeLabel: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  byeValue: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  statsSection: { gap: 10 },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, marginBottom: 4 },
  weekCard: {},
  weekLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, marginBottom: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  statItem: { alignItems: 'center', minWidth: 56 },
  statValue: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary },
  statLabel: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary, textAlign: 'center' },
});
