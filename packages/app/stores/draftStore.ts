import { create } from 'zustand';
import { DraftState, DraftPick } from '@ff/shared';

interface DraftStoreState {
  draft: DraftState | null;
  myQueue: string[];
  ws: WebSocket | null;
  isConnected: boolean;

  setDraft: (draft: DraftState) => void;
  addPick: (pick: DraftPick) => void;
  updateTimer: (remaining: number) => void;
  setQueue: (queue: string[]) => void;
  enqueuePlayer: (playerId: string) => void;
  dequeuePlayer: (playerId: string) => void;
  connectWs: (leagueId: string, token: string) => void;
  disconnectWs: () => void;
  makePick: (playerId: string) => void;
}

export const useDraftStore = create<DraftStoreState>((set, get) => ({
  draft: null,
  myQueue: [],
  ws: null,
  isConnected: false,

  setDraft: (draft) => set({ draft }),

  addPick: (pick) =>
    set((s) => ({
      draft: s.draft
        ? {
            ...s.draft,
            picks: [...s.draft.picks, pick],
            currentPick: s.draft.currentPick + 1,
          }
        : null,
      myQueue: s.myQueue.filter((id) => id !== pick.playerId),
    })),

  updateTimer: (remaining) =>
    set((s) => ({
      draft: s.draft ? { ...s.draft, timerRemaining: remaining } : null,
    })),

  setQueue: (queue) => set({ myQueue: queue }),

  enqueuePlayer: (playerId) =>
    set((s) => ({
      myQueue: s.myQueue.includes(playerId) ? s.myQueue : [...s.myQueue, playerId],
    })),

  dequeuePlayer: (playerId) =>
    set((s) => ({ myQueue: s.myQueue.filter((id) => id !== playerId) })),

  connectWs: (leagueId, token) => {
    const wsUrl = (process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3000') + `/draft/${leagueId}?token=${token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => set({ isConnected: true });
    ws.onclose = () => set({ isConnected: false, ws: null });

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      const { setDraft, addPick, updateTimer, setQueue } = get();

      switch (msg.type) {
        case 'DRAFT_STARTED':
        case 'DRAFT_STATE':
          setDraft(msg.data);
          break;
        case 'PICK_MADE':
          addPick(msg.data);
          break;
        case 'TIMER_TICK':
          updateTimer(msg.data.remaining);
          break;
        case 'QUEUE_UPDATED':
          setQueue(msg.data.queue);
          break;
      }
    };

    set({ ws });
  },

  disconnectWs: () => {
    const { ws } = get();
    ws?.close();
    set({ ws: null, isConnected: false });
  },

  makePick: (playerId) => {
    const { ws } = get();
    ws?.send(JSON.stringify({ type: 'MAKE_PICK', data: { playerId } }));
  },
}));
