import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useLeagueStore } from '../../../stores/leagueStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../lib/api';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { COLORS, TYPOGRAPHY } from '../../../constants/theme';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'trades' | 'waivers';

export default function TransactionsScreen() {
  const { activeLeagueId, currentWeek } = useLeagueStore();
  const [tab, setTab] = useState<Tab>('trades');

  const { data: trades, refetch: refetchTrades, isRefetching: refetchingTrades } = useQuery({
    queryKey: ['leagues', activeLeagueId, 'trades'],
    queryFn: () => api.get(`/leagues/${activeLeagueId}/trades`).then((r) => r.data),
    enabled: !!activeLeagueId && tab === 'trades',
  });

  const { data: waivers, refetch: refetchWaivers, isRefetching: refetchingWaivers } = useQuery({
    queryKey: ['leagues', activeLeagueId, 'waivers', currentWeek],
    queryFn: () =>
      api.get(`/leagues/${activeLeagueId}/waivers`, { params: { week: currentWeek } }).then((r) => r.data),
    enabled: !!activeLeagueId && tab === 'waivers',
  });

  const STATUS_COLOR: Record<string, string> = {
    PENDING: COLORS.warning,
    ACCEPTED: COLORS.accent,
    REJECTED: COLORS.danger,
    VETOED: COLORS.danger,
    PROCESSED: COLORS.accent,
    FAILED: COLORS.danger,
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        {(['trades', 'waivers'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.activeTab]}
            onPress={() => setTab(t)}
          >
            <Text style={[styles.tabText, tab === t && styles.activeTabText]}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'trades' ? (
        <FlatList
          data={trades || []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refetchingTrades} onRefresh={refetchTrades} tintColor={COLORS.primary} />
          }
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity onPress={() => router.push(`/trade/${item.id}`)} activeOpacity={0.8}>
              <Card style={styles.tradeCard}>
                <View style={styles.tradeHeader}>
                  <Text style={styles.tradeTeams}>
                    {item.proposingTeamName} ↔ {item.receivingTeamName}
                  </Text>
                  <Badge
                    label={item.status}
                    color={STATUS_COLOR[item.status] + '33'}
                    textColor={STATUS_COLOR[item.status]}
                    size="sm"
                  />
                </View>
                <Text style={styles.tradeMeta}>
                  {new Date(item.proposedAt).toLocaleDateString()} ·{' '}
                  {item.assets?.send?.length || 0} players sent
                </Text>
              </Card>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="swap-horizontal-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No trades yet</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={waivers || []}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refetchingWaivers} onRefresh={refetchWaivers} tintColor={COLORS.primary} />
          }
          renderItem={({ item }: { item: any }) => (
            <Card style={styles.tradeCard}>
              <View style={styles.tradeHeader}>
                <Text style={styles.tradeTeams}>
                  {item.teamName}: +{item.addPlayerId}{item.dropPlayerId ? ` / -${item.dropPlayerId}` : ''}
                </Text>
                <Badge
                  label={item.status}
                  color={STATUS_COLOR[item.status] + '33'}
                  textColor={STATUS_COLOR[item.status]}
                  size="sm"
                />
              </View>
              <Text style={styles.tradeMeta}>
                Week {item.week} · {item.faabBid != null ? `$${item.faabBid} FAAB` : `Priority ${item.priority}`}
              </Text>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="person-add-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No waiver claims this week</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textMuted },
  activeTabText: { color: COLORS.primary },
  list: { padding: 16, gap: 8 },
  tradeCard: { gap: 4 },
  tradeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tradeTeams: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, flex: 1 },
  tradeMeta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  empty: { alignItems: 'center', gap: 8, paddingTop: 60 },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});
