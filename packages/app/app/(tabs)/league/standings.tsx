import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Skeleton } from '../../../components/ui/Skeleton';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

export default function StandingsScreen() {
  const { activeLeagueId } = useLeagueStore();

  const { data: standings, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['leagues', activeLeagueId, 'standings'],
    queryFn: () => api.get(`/leagues/${activeLeagueId}/standings`).then((r) => r.data),
    enabled: !!activeLeagueId,
  });

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={[styles.th, { flex: 1 }]}>Team</Text>
        <Text style={styles.th}>W-L</Text>
        <Text style={styles.th}>PF</Text>
        <Text style={styles.th}>PA</Text>
      </View>
      {isLoading ? (
        <View style={{ padding: 16, gap: 8 }}>
          {[...Array(10)].map((_, i) => <Skeleton key={i} height={56} borderRadius={10} />)}
        </View>
      ) : (
        <FlatList
          data={standings}
          keyExtractor={(item: any) => item.team.id}
          contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 4 }}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.8}
              onPress={() => router.push(`/trade/new?teamId=${item.team.id}`)}
            >
              <Text style={styles.rank}>#{item.rank}</Text>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{item.team.name}</Text>
                <Text style={styles.ownerName}>{item.team.owner?.displayName}</Text>
              </View>
              <Text style={styles.stat}>{item.record}</Text>
              <Text style={styles.stat}>{item.team.pointsFor?.toFixed(1)}</Text>
              <Text style={styles.stat}>{item.team.pointsAgainst?.toFixed(1)}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.tradeBtn} onPress={() => router.push('/settings/league/scoring')}>
        <Ionicons name="settings-outline" size={20} color={COLORS.primary} />
        <Text style={styles.tradeBtnText}>League Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  th: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, width: 52, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  rank: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, width: 28 },
  teamInfo: { flex: 1 },
  teamName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  ownerName: { ...TYPOGRAPHY.caption, color: COLORS.textSecondary },
  stat: { ...TYPOGRAPHY.body, color: COLORS.textPrimary, width: 52, textAlign: 'center' },
  tradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tradeBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.primary },
});
