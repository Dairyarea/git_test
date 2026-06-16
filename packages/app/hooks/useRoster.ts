import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Team, RosterSlot, PlayerSearchResult } from '@ff/shared';

export function useMyTeam(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'team'],
    queryFn: () => api.get(`/leagues/${leagueId}/teams/mine`).then((r) => r.data as Team),
    enabled: !!leagueId,
  });
}

export function useLeagueTeams(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'teams'],
    queryFn: () => api.get(`/leagues/${leagueId}/teams`).then((r) => r.data as Team[]),
    enabled: !!leagueId,
  });
}

export function useTeamRoster(leagueId: string, teamId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'teams', teamId, 'roster'],
    queryFn: () =>
      api.get(`/leagues/${leagueId}/teams/${teamId}/roster`).then((r) => r.data as RosterSlot[]),
    enabled: !!leagueId && !!teamId,
  });
}

export function useSetLineup(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (lineup: Array<{ playerId: string; slotType: string }>) =>
      api.put(`/leagues/${leagueId}/teams/mine/lineup`, { lineup }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leagues', leagueId, 'team'] }),
  });
}

export function useDropPlayer(leagueId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (playerId: string) =>
      api.post(`/leagues/${leagueId}/teams/mine/drop`, { playerId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leagues', leagueId, 'team'] });
      qc.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

export function usePlayerSearch(query: string, leagueId?: string) {
  return useQuery({
    queryKey: ['players', { q: query, leagueId }],
    queryFn: () =>
      api
        .get('/players', { params: { q: query, leagueId } })
        .then((r) => r.data.players as PlayerSearchResult[]),
    enabled: query.length >= 1,
    staleTime: 30 * 1000,
  });
}
