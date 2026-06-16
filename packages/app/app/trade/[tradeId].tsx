import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLeagueStore } from '../../stores/leagueStore';
import { useAuthStore } from '../../stores/authStore';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PlayerCard } from '../../components/roster/PlayerCard';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Trade } from '@ff/shared';
import { Ionicons } from '@expo/vector-icons';

const STATUS_COLORS: Record<string, string> = {
  PENDING: COLORS.warning,
  ACCEPTED: COLORS.accent,
  REJECTED: COLORS.danger,
  VETOED: COLORS.danger,
  EXPIRED: COLORS.textMuted,
  WITHDRAWN: COLORS.textMuted,
};

export default function TradeDetailScreen() {
  const { tradeId } = useLocalSearchParams<{ tradeId: string }>();
  const { activeLeagueId } = useLeagueStore();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: trade, isLoading } = useQuery({
    queryKey: ['trades', tradeId],
    queryFn: () =>
      api
        .get(`/leagues/${activeLeagueId}/trades`)
        .then((r) => r.data.find((t: Trade) => t.id === tradeId)),
    enabled: !!tradeId && !!activeLeagueId,
  });

  const { mutate: accept, isPending: accepting } = useMutation({
    mutationFn: () => api.post(`/leagues/${activeLeagueId}/trades/${tradeId}/accept`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades', tradeId] }),
  });

  const { mutate: reject, isPending: rejecting } = useMutation({
    mutationFn: () => api.post(`/leagues/${activeLeagueId}/trades/${tradeId}/reject`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades', tradeId] }),
  });

  const { mutate: veto } = useMutation({
    mutationFn: () => api.post(`/leagues/${activeLeagueId}/trades/${tradeId}/veto`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trades', tradeId] }),
  });

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!trade) {
    return (
      <View style={styles.loading}>
        <Text style={styles.error}>Trade not found</Text>
      </View>
    );
  }

  const isReceiver = trade.receivingTeam?.ownerId === user?.id;
  const hasVoted = trade.votes?.some((v: any) => v.userId === user?.id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.header}>
        <Badge
          label={trade.status}
          color={STATUS_COLORS[trade.status] + '33'}
          textColor={STATUS_COLORS[trade.status]}
        />
        <Text style={styles.meta}>
          Proposed {new Date(trade.proposedAt).toLocaleDateString()}
        </Text>
        {trade.notes && <Text style={styles.notes}>{trade.notes}</Text>}
      </Card>

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.teamLabel}>{trade.proposingTeamName} sends</Text>
          {trade.proposingPlayers?.map((p: any) => (
            <PlayerCard key={p.id} player={p} compact />
          ))}
        </View>
        <View style={styles.arrowCol}>
          <Ionicons name="swap-horizontal" size={22} color={COLORS.textMuted} />
        </View>
        <View style={styles.column}>
          <Text style={styles.teamLabel}>{trade.receivingTeamName} sends</Text>
          {trade.receivingPlayers?.map((p: any) => (
            <PlayerCard key={p.id} player={p} compact />
          ))}
        </View>
      </View>

      {trade.votes?.length > 0 && (
        <Card style={styles.votesCard}>
          <Text style={styles.votesTitle}>Veto Votes ({trade.vetoCount}/{trade.vetoThreshold})</Text>
          {trade.votes.map((v: any) => (
            <View key={v.id} style={styles.voteRow}>
              <Text style={styles.voterName}>{v.userName}</Text>
              <Badge
                label={v.vote}
                color={v.vote === 'VETO' ? COLORS.danger + '33' : COLORS.accent + '33'}
                textColor={v.vote === 'VETO' ? COLORS.danger : COLORS.accent}
                size="sm"
              />
            </View>
          ))}
        </Card>
      )}

      {trade.status === 'PENDING' && (
        <View style={styles.actions}>
          {isReceiver && (
            <>
              <Button
                label="Accept Trade"
                variant="primary"
                onPress={() => accept()}
                loading={accepting}
                style={{ flex: 1 }}
              />
              <Button
                label="Reject"
                variant="danger"
                onPress={() => reject()}
                loading={rejecting}
                style={{ flex: 1 }}
              />
            </>
          )}
          {!isReceiver && !hasVoted && (
            <Button
              label="Vote to Veto"
              variant="secondary"
              onPress={() => {
                Alert.alert('Vote to Veto?', 'Cast your veto vote on this trade.', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Veto', style: 'destructive', onPress: () => veto() },
                ]);
              }}
            />
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
  header: { gap: 6 },
  meta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  notes: { ...TYPOGRAPHY.body, color: COLORS.textSecondary, marginTop: 4 },
  columns: { flexDirection: 'row', gap: 8 },
  column: { flex: 1 },
  arrowCol: { width: 30, alignItems: 'center', justifyContent: 'center' },
  teamLabel: { ...TYPOGRAPHY.captionBold, color: COLORS.textMuted, marginBottom: 6 },
  votesCard: { gap: 8 },
  votesTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textPrimary },
  voteRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voterName: { ...TYPOGRAPHY.body, color: COLORS.textPrimary },
  actions: { flexDirection: 'row', gap: 10 },
});
