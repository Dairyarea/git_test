import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../lib/api';
import { useDraftStore } from '../stores/draftStore';
import { useAuthStore } from '../stores/authStore';

export function useDraft(leagueId: string) {
  const { connectWs, disconnectWs, draft } = useDraftStore();
  const { token } = useAuthStore();

  const query = useQuery({
    queryKey: ['leagues', leagueId, 'draft'],
    queryFn: () => api.get(`/leagues/${leagueId}/draft`).then((r) => r.data),
    enabled: !!leagueId,
  });

  useEffect(() => {
    if (query.data?.config?.status === 'LIVE' && token) {
      connectWs(leagueId, token);
    }
    return () => disconnectWs();
  }, [query.data?.config?.status, token, leagueId]);

  return { ...query, liveDraft: draft };
}
