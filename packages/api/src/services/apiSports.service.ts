import { Position, PlayerStatus } from '@prisma/client';

const BASE_URL = 'https://v1.american-football.api-sports.io';
const NFL_LEAGUE_ID = 1;
const RATE_LIMIT_MS = 1000; // 1 second between requests to stay safe on free tier

let lastRequestAt = 0;

async function apiFetch<T>(path: string): Promise<T> {
  const now = Date.now();
  const wait = RATE_LIMIT_MS - (now - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'x-apisports-key': process.env.API_SPORTS_KEY || '',
    },
  });

  if (!res.ok) throw new Error(`API-Sports ${path} → ${res.status}`);
  const json = await res.json() as any;
  if (json.errors && Object.keys(json.errors).length > 0) {
    throw new Error(`API-Sports error: ${JSON.stringify(json.errors)}`);
  }
  return json as T;
}

export function getNFLLeagueId() {
  return NFL_LEAGUE_ID;
}

// ─── Teams ────────────────────────────────────────────────────────────────────

export interface ApiTeam {
  id: number;
  name: string;
  code: string;
  logo: string;
}

export async function fetchNFLTeams(season: number): Promise<ApiTeam[]> {
  const data = await apiFetch<{ response: { team: ApiTeam }[] }>(
    `/teams?league=${NFL_LEAGUE_ID}&season=${season}`
  );
  return data.response.map((r) => r.team);
}

// ─── Players ──────────────────────────────────────────────────────────────────

export interface ApiPlayer {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  position: string;
  photo: string;
  team: { id: number; name: string; code: string };
  number: number | null;
  injury: { status: string | null; type: string | null } | null;
}

export async function fetchPlayersByTeam(teamId: number, season: number): Promise<ApiPlayer[]> {
  const all: ApiPlayer[] = [];
  let page = 1;

  while (true) {
    const data = await apiFetch<{
      response: ApiPlayer[];
      paging: { current: number; total: number };
    }>(`/players?team=${teamId}&season=${season}&page=${page}`);

    all.push(...data.response);
    if (data.paging.current >= data.paging.total) break;
    page++;
  }

  return all;
}

// ─── Games ────────────────────────────────────────────────────────────────────

export interface ApiGame {
  id: number;
  week: string;
  date: { date: string; time: string; timezone: string };
  status: { short: string; long: string };
  teams: {
    home: { id: number; name: string };
    away: { id: number; name: string };
  };
  scores: {
    home: { total: number | null };
    away: { total: number | null };
  };
}

export async function fetchGamesByWeek(season: number, week: number): Promise<ApiGame[]> {
  const data = await apiFetch<{ response: ApiGame[] }>(
    `/games?league=${NFL_LEAGUE_ID}&season=${season}&week=${week}`
  );
  return data.response;
}

// ─── Game Player Stats ─────────────────────────────────────────────────────────

export interface ApiPlayerGameStats {
  player: { id: number; name: string };
  statistics: {
    passing?: { attempts: number; completions: number; yards: number; touchdowns: number; interceptions: number; twoPointConversions?: number };
    rushing?: { attempts: number; yards: number; touchdowns: number; twoPointConversions?: number };
    receiving?: { receptions: number; yards: number; touchdowns: number; targets: number; twoPointConversions?: number };
    fumbles?: { lost: number; total: number };
    kicking?: {
      fieldGoalsMade0_19?: number; fieldGoalsMade20_29?: number; fieldGoalsMade30_39?: number;
      fieldGoalsMade40_49?: number; fieldGoalsMade50_59?: number; fieldGoalsMade60plus?: number;
      fieldGoalsMissed?: number; extraPointsMade?: number; extraPointsMissed?: number;
    };
    defense?: { sacks: number; interceptions: number; fumblesRecovered: number; safeties: number; touchdowns: number };
    returning?: { touchdowns: number };
  }[];
}

export async function fetchGamePlayerStats(gameId: number): Promise<ApiPlayerGameStats[]> {
  const data = await apiFetch<{
    response: { home: { players: ApiPlayerGameStats[] }; away: { players: ApiPlayerGameStats[] } };
  }>(`/games/statistics/players?id=${gameId}`);

  const resp = data.response as any;
  // Response can be an array or object depending on API version
  if (Array.isArray(resp)) {
    return resp.flatMap((side: any) => [
      ...(side?.home?.players ?? []),
      ...(side?.away?.players ?? []),
    ]);
  }
  return [
    ...(resp?.home?.players ?? []),
    ...(resp?.away?.players ?? []),
  ];
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

const POSITION_MAP: Record<string, Position> = {
  quarterback: Position.QB,
  'running back': Position.RB,
  'wide receiver': Position.WR,
  'tight end': Position.TE,
  kicker: Position.K,
  placekicker: Position.K,
  defense: Position.DEF,
  'defensive back': Position.DEF,
  safety: Position.DEF,
  cornerback: Position.DEF,
  linebacker: Position.DEF,
  'defensive lineman': Position.DEF,
  'defensive end': Position.DEF,
  'defensive tackle': Position.DEF,
};

export function mapPosition(raw: string): Position | null {
  return POSITION_MAP[raw.toLowerCase()] ?? null;
}

const STATUS_MAP: Record<string, PlayerStatus> = {
  active: PlayerStatus.ACTIVE,
  injured: PlayerStatus.INJURED,
  'injured reserve': PlayerStatus.INJURED,
  ir: PlayerStatus.INJURED,
  out: PlayerStatus.OUT,
  questionable: PlayerStatus.QUESTIONABLE,
  doubtful: PlayerStatus.DOUBTFUL,
  suspended: PlayerStatus.SUSPENDED,
};

export function mapStatus(raw: string | null | undefined): PlayerStatus {
  if (!raw) return PlayerStatus.ACTIVE;
  return STATUS_MAP[raw.toLowerCase()] ?? PlayerStatus.ACTIVE;
}

export function mapGameStatsToScoringKeys(
  stats: ApiPlayerGameStats['statistics'][0]
): Record<string, number> {
  const out: Record<string, number> = {};

  const p = stats.passing;
  if (p) {
    if (p.attempts) out.pass_att = p.attempts;
    if (p.yards) out.pass_yd = p.yards;
    if (p.touchdowns) out.pass_td = p.touchdowns;
    if (p.interceptions) out.pass_int = p.interceptions;
    if (p.attempts && p.completions != null) {
      out.pass_inc = p.attempts - p.completions;
    }
    if (p.twoPointConversions) out.pass_2pt = p.twoPointConversions;
  }

  const ru = stats.rushing;
  if (ru) {
    if (ru.attempts) out.rush_att = ru.attempts;
    if (ru.yards) out.rush_yd = ru.yards;
    if (ru.touchdowns) out.rush_td = ru.touchdowns;
    if (ru.twoPointConversions) out.rush_2pt = ru.twoPointConversions;
  }

  const re = stats.receiving;
  if (re) {
    if (re.receptions) out.rec = re.receptions;
    if (re.yards) out.rec_yd = re.yards;
    if (re.touchdowns) out.rec_td = re.touchdowns;
    if (re.targets) out.rec_target = re.targets;
    if (re.twoPointConversions) out.rec_2pt = re.twoPointConversions;
  }

  const f = stats.fumbles;
  if (f) {
    if (f.total) out.fumble = f.total;
    if (f.lost) out.fumble_lost = f.lost;
  }

  const k = stats.kicking;
  if (k) {
    const fg0 = (k.fieldGoalsMade0_19 ?? 0) + (k.fieldGoalsMade20_29 ?? 0) + (k.fieldGoalsMade30_39 ?? 0);
    if (fg0) out.fg_made_0_39 = fg0;
    if (k.fieldGoalsMade40_49) out.fg_made_40_49 = k.fieldGoalsMade40_49;
    if (k.fieldGoalsMade50_59) out.fg_made_50_59 = k.fieldGoalsMade50_59;
    if (k.fieldGoalsMade60plus) out.fg_made_60_plus = k.fieldGoalsMade60plus;
    if (k.fieldGoalsMissed) out.fg_missed = k.fieldGoalsMissed;
    if (k.extraPointsMade) out.xp_made = k.extraPointsMade;
    if (k.extraPointsMissed) out.xp_missed = k.extraPointsMissed;
  }

  const d = stats.defense;
  if (d) {
    if (d.sacks) out.dst_sack = d.sacks;
    if (d.interceptions) out.dst_int = d.interceptions;
    if (d.fumblesRecovered) out.dst_fumble_rec = d.fumblesRecovered;
    if (d.safeties) out.dst_safety = d.safeties;
    if (d.touchdowns) out.dst_td = d.touchdowns;
  }

  const ret = stats.returning;
  if (ret?.touchdowns) out.return_td = ret.touchdowns;

  return out;
}
