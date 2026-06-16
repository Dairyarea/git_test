import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useLeagueStore } from '../../stores/leagueStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { COLORS, TYPOGRAPHY, POSITION_COLORS } from '../../constants/theme';
import { PositionBadge } from '../../components/roster/PositionBadge';
import { Ionicons } from '@expo/vector-icons';

export default function MatchupScreen() {
  const { activeLeagueId, currentWeek } = useLeagueStore();

  const { data: matchups, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['leagues', activeLeagueId, 'matchups', currentWeek],
    queryFn: () =>
      api
        .get(`/leagues/${activeLeagueId}/matchups`, { params: { week: currentWeek } })
        .then((r) => r.data),
    enabled: !!activeLeagueId,
  });

  const myMatchup = matchups?.[0];

  if (!activeLeagueId) {
    return (
      <View style={styles.empty}>
        <Ionicons name="football-outline" size={48} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>Select a league to view your matchup</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />}
    >
      <Text style={styles.weekLabel}>Week {currentWeek}</Text>

      {isLoading ? (
        <>
          <Skeleton height={120} borderRadius={14} style={{ marginBottom: 12 }} />
          <Skeleton height={400} borderRadius={14} />
        </>
      ) : myMatchup ? (
        <>
          <Card style={styles.scoreCard}>
            <View style={styles.scoreRow}>
              <View style={styles.teamScore}>
                <Text style={styles.teamScoreName} numberOfLines={1}>{myMatchup.homeTeam?.name}</Text>
                <Text style={styles.score}>{myMatchup.homeScore?.toFixed(2) || '0.00'}</Text>
              </View>
              <Text style={styles.vs}>VS</Text>
              <View style={[styles.teamScore, styles.teamScoreRight]}>
                <Text style={styles.teamScoreName} numberOfLines={1}>{myMatchup.awayTeam?.name}</Text>
                <Text style={styles.score}>{myMatchup.awayScore?.toFixed(2) || '0.00'}</Text>
              </View>
            </View>

            {myMatchup.isComplete && (
              <View style={styles.resultBanner}>
                <Text style={styles.resultText}>
                  {myMatchup.homeScore > myMatchup.awayScore
                    ? `${myMatchup.homeTeam?.name} wins!`
                    : myMatchup.awayScore > myMatchup.homeScore
                    ? `${myMatchup.awayTeam?.name} wins!`
                    : 'Tie game'}
                </Text>
              </View>
            )}
          </Card>

          <Card style={styles.lineupCard}>
            <Text style={styles.sectionTitle}>Lineups</Text>
            <View style={styles.lineupColumns}>
              <View style={styles.lineupCol}>
                <Text style={styles.lineupTeamName}>{myMatchup.homeTeam?.name}</Text>
                {(myMatchup.homeLineup || []).map((slot: any, i: number) => (
                  <View key={i} style={styles.lineupRow}>
                    <PositionBadge position={slot.position || 'QB'} size="sm" />
                    <Text style={styles.lineupPlayer} numberOfLines={1}>{slot.name || '—'}</Text>
                    <Text style={styles.lineupPts}>{slot.points?.toFixed(1) || '—'}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.divider} />
              <View style={styles.lineupCol}>
                <Text style={[styles.lineupTeamName, { textAlign: 'right' }]}>{myMatchup.awayTeam?.name}</Text>
                {(myMatchup.awayLineup || []).map((slot: any, i: number) => (
                  <View key={i} style={[styles.lineupRow, { flexDirection: 'row-reverse' }]}>
                    <PositionBadge position={slot.position || 'QB'} size="sm" />
                    <Text style={[styles.lineupPlayer, { textAlign: 'right' }]} numberOfLines={1}>{slot.name || '—'}</Text>
                    <Text style={styles.lineupPts}>{slot.points?.toFixed(1) || '—'}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </>
      ) : (
        <Card style={styles.emptyCard}>
          <Ionicons name="calendar-outline" size={36} color={COLORS.textMuted} />
          <Text style={styles.emptyText}>No matchup scheduled for Week {currentWeek}</Text>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, textAlign: 'center' },
  weekLabel: { ...TYPOGRAPHY.h3, color: COLORS.textPrimary, marginBottom: 16 },
  scoreCard: { marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  teamScore: { flex: 1, gap: 4 },
  teamScoreRight: { alignItems: 'flex-end' },
  teamScoreName: { ...TYPOGRAPHY.captionBold, color: COLORS.textSecondary },
  score: { fontSize: 36, fontWeight: '800', color: COLORS.textPrimary },
  vs: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted },
  resultBanner: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
  },
  resultText: { ...TYPOGRAPHY.bodyBold, color: COLORS.accent },
  lineupCard: { },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary, marginBottom: 12 },
  lineupColumns: { flexDirection: 'row', gap: 8 },
  lineupCol: { flex: 1, gap: 6 },
  divider: { width: 1, backgroundColor: COLORS.border },
  lineupTeamName: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, marginBottom: 4 },
  lineupRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  lineupPlayer: { ...TYPOGRAPHY.caption, color: COLORS.textPrimary, flex: 1 },
  lineupPts: { ...TYPOGRAPHY.captionBold, color: COLORS.textPrimary },
  emptyCard: { alignItems: 'center', gap: 10, paddingVertical: 32 },
});
