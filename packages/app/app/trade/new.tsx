import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useLeagueStore } from '../../stores/leagueStore';
import { useMyTeam, useTeamRoster } from '../../hooks/useRoster';
import { TradeProposal } from '../../components/trade/TradeProposal';
import { api } from '../../lib/api';
import { COLORS, TYPOGRAPHY } from '../../constants/theme';
import { Team } from '@ff/shared';

export default function NewTradeScreen() {
  const { teamId } = useLocalSearchParams<{ teamId: string }>();
  const { activeLeagueId } = useLeagueStore();
  const qc = useQueryClient();

  const { data: myTeam, isLoading: loadingMine } = useMyTeam(activeLeagueId || '');
  const { data: theirRoster, isLoading: loadingTheirs } = useTeamRoster(activeLeagueId || '', teamId || '');

  const { mutate: proposeTrade, isPending } = useMutation({
    mutationFn: (data: { receivingTeamId: string; send: string[]; receive: string[]; notes?: string }) =>
      api.post(`/leagues/${activeLeagueId}/trades`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leagues', activeLeagueId, 'trades'] });
      router.back();
    },
  });

  if (loadingMine || loadingTheirs) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }

  if (!myTeam || !theirRoster) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>Could not load team data</Text>
      </View>
    );
  }

  const theirTeam: Team = {
    ...myTeam,
    id: teamId || '',
    roster: theirRoster,
  };

  return (
    <View style={styles.container}>
      <TradeProposal
        myTeam={myTeam}
        theirTeam={theirTeam}
        onSubmit={(send, receive, notes) =>
          proposeTrade({ receivingTeamId: teamId || '', send, receive, notes })
        }
        isSubmitting={isPending}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 16 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...TYPOGRAPHY.body, color: COLORS.textSecondary },
});
