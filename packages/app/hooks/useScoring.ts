import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ScoringRules, ScoringBonus } from '@ff/shared';

export function useScoringConfig(leagueId: string) {
  return useQuery({
    queryKey: ['leagues', leagueId, 'scoring'],
    queryFn: () => api.get(`/leagues/${leagueId}/scoring`).then((r) => r.data),
    enabled: !!leagueId,
  });
}

export function useScoringPreview(leagueId: string) {
  return useMutation({
    mutationFn: (body: { rules: ScoringRules; bonuses: ScoringBonus[] }) =>
      api.post(`/leagues/${leagueId}/scoring/preview`, body).then((r) => r.data),
  });
}
