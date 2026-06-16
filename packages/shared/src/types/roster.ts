import { Player, Position } from './player';

export type SlotStatus = 'ACTIVE' | 'BENCH' | 'IR';
export type AcquireType = 'DRAFT' | 'WAIVER' | 'TRADE' | 'FREE_AGENT';

export interface RosterSlot {
  id: string;
  teamId: string;
  playerId: string;
  player: Player;
  status: SlotStatus;
  slotType: string;
  acquiredAt: string;
  acquiredVia: AcquireType;
}

export interface Team {
  id: string;
  leagueId: string;
  ownerId: string;
  ownerName: string;
  ownerAvatarUrl?: string;
  name: string;
  logoUrl?: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  weeklyScore?: number;
  projectedScore?: number;
  waiversRemaining?: number;
  faabRemaining?: number;
  roster?: RosterSlot[];
}

export interface LineupSlot {
  slotType: string;
  slotLabel: string;
  eligiblePositions: Position[];
  player: RosterSlot | null;
  isLocked: boolean;
}
