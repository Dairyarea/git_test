import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useLeagueStore } from '../stores/leagueStore';
import { League, LeagueSettings, ScoringConfig } from '@ff/shared';

export function useMyLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: () => api.get('/leagues').then((r) => r.data as League[]),
  });
}

export function useLeague(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId],
    queryFn: () => api.get(`/leagues/${leagueId}`).then((r) => r.data as League),
    enabled: !!leagueId,
  });
}

export function useCreateLeague() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; season: number }) =>
      api.post('/leagues', data).then((r) => r.data as League),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues'] }),
  });
}

export function useUpdateLeagueSettings(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: Partial<LeagueSettings>) =>
      api.put(`/leagues/${leagueId}/settings`, settings).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues', leagueId] }),
  });
}

export function useUpdateScoringConfig(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (config: Partial<ScoringConfig>) =>
      api.put(`/leagues/${leagueId}/scoring`, config).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues', leagueId] }),
  });
}

export function useJoinLeague() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) =>
      api.post('/leagues/join', { inviteCode }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues'] }),
  });
}
