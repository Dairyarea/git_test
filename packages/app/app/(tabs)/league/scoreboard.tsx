import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function ScoreboardScreen() {
  const { activeLeagueId, currentWeek } = useLeagueStore();

  const { data: matchups, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['leagues', activeLeagueId, 'matchups', currentWeek],
    queryFn: () =>
      api
        .get(`/leagues/${activeLeagueId}/matchups`, { params: { week: currentWeek } })
        .then((r) => r.data),
    enabled: !!activeLeagueId,
    refetchInterval: 5 * 60 * 1000,
  });

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        <Text style={styles.weekLabel}>Week {currentWeek}</Text>
      </View>
      <FlatList
        data={matchups || []}
        keyExtractor={(item: any) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
        renderItem={({ item }: { item: any }) => (
          <TouchableOpacity
            onPress={() => router.push(`/leagues/${activeLeagueId}/matchups/${item.id}`)}
            activeOpacity={0.8}
          >
            <Card style={styles.matchupCard}>
              <View style={styles.matchupRow}>
                <View style={styles.teamSide}>
                  <Text style={styles.teamName} numberOfLines={1}>{item.homeTeam?.name}</Text>
                  <Text style={styles.ownerName}>{item.homeTeam?.owner?.displayName}</Text>
                </View>
                <View style={styles.scores}>
                  <Text style={[styles.score, item.homeScore > item.awayScore && styles.winnerScore]}>
                    {item.homeScore?.toFixed(2) || '0.00'}
                  </Text>
                  <Text style={styles.dash}>-</Text>
                  <Text style={[styles.score, item.awayScore > item.homeScore && styles.winnerScore]}>
                    {item.awayScore?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <View style={[styles.teamSide, { alignItems: 'flex-end' }]}>
                  <Text style={styles.teamName} numberOfLines={1}>{item.awayTeam?.name}</Text>
                  <Text style={styles.ownerName}>{item.awayTeam?.owner?.displayName}</Text>
                </View>
              </View>
              {item.isPlayoff && (
                <View style={styles.playoffBadge}>
                  <Ionicons name="trophy" size={12} color={COLORS.warning} />
                  <Text style={styles.playoffText}>Playoff</Text>
                </View>
              )}
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No matchups scheduled</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  weekHeader: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  weekLabel: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  list: { padding: 16, gap: 8 },
  matchupCard: {},
  matchupRow: { flexDirection: 'row', alignItems: 'center' },
  teamSide: { flex: 1 },
  teamName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  ownerName: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  scores: { alignItems: 'center', paddingHorizontal: 12 },
  score: { fontSize: 20, fontWeight: '800', color: COLORS.textSecondary },
  winnerScore: { color: COLORS.textPrimary },
  dash: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted },
  playoffBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8 },
  playoffText: { ...TYPOGRAPHY.captionBold, color: COLORS.warning },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});
