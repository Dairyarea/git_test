import { create } from 'zustand';
import { League } from '@ff/shared';

interface LeagueState {
  activeLeagueId: string | null;
  activeLeague: League | null;
  currentWeek: number;
  setActiveLeague: (league: League) => void;
  setActiveLeagueId: (id: string) => void;
  setCurrentWeek: (week: number) => void;
  clearActiveLeague: () => void;
}

export const useLeagueStore = create<LeagueState>((set) => ({
  activeLeagueId: null,
  activeLeague: null,
  currentWeek: 1,

  setActiveLeague: (league) => set({ activeLeague: league, activeLeagueId: league.id }),
  setActiveLeagueId: (id) => set({ activeLeagueId: id }),
  setCurrentWeek: (week) => set({ currentWeek: week }),
  clearActiveLeague: () => set({ activeLeague: null, activeLeagueId: null }),
}));
