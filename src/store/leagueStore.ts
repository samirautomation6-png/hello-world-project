import { create } from 'zustand';
import defaultLeagueData from '@/data/defaultLeagueData.json';

const STORAGE_KEY = 'football-league-data';

// Load from localStorage or use default
const loadState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Error loading state:', err);
  }
  return defaultLeagueData;
};

const initialState = loadState();

const saveState = (state: any) => {
  const json = JSON.stringify(state, null, 2);
  localStorage.setItem(STORAGE_KEY, json);
  console.log('State saved → total matches:', state.matches.length);
};

export interface Team {
  id: string;
  name: string;
  coach: string;
  logo: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  teamId: string;
  goals: number;
  image: string | null;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeGoals: number;
  awayGoals: number;
  scorers: { playerId: string; goals: number }[];
  date: string;
}

interface LeagueState {
  teams: Team[];
  players: Player[];
  matches: Match[];
  selectedHomeTeam: Team | null;
  selectedAwayTeam: Team | null;
  setSelectedHomeTeam: (team: Team | null) => void;
  setSelectedAwayTeam: (team: Team | null) => void;
  addMatch: (homeGoals: number, awayGoals: number, scorers?: { playerId: string; goals: number }[]) => any;
  addPlayer: (player: Omit<Player, 'id'>) => any;
  editPlayer: (id: string, data: Partial<Player>) => any;
  deletePlayer: (id: string) => void;
  updateTeamLogo: (teamId: string, logo: string) => void;
  resetLeague: () => void;
  getFullState: () => { teams: Team[]; players: Player[]; matches: Match[] };
}

export const useLeagueStore = create<LeagueState>((set, get) => ({
  ...initialState,

  setSelectedHomeTeam: (team) => set({ selectedHomeTeam: team }),
  setSelectedAwayTeam: (team) => set({ selectedAwayTeam: team }),

  addMatch: (homeGoals, awayGoals, scorers = []) => {
    const state = get();
    const homeTeam = state.selectedHomeTeam || state.teams[0];
    const awayTeam = state.selectedAwayTeam || state.teams[1];

    if (!homeTeam || !awayTeam || homeTeam.id === awayTeam.id) {
      alert('Please select two different teams!');
      return null;
    }

    const homeWin = homeGoals > awayGoals;
    const draw = homeGoals === awayGoals;

    const updatedTeams = state.teams.map((t) => {
      if (t.id === homeTeam.id) {
        return {
          ...t,
          played: t.played + 1,
          won: t.won + (homeWin ? 1 : 0),
          drawn: t.drawn + (draw ? 1 : 0),
          lost: t.lost + (!homeWin && !draw ? 1 : 0),
          goalsFor: t.goalsFor + homeGoals,
          goalsAgainst: t.goalsAgainst + awayGoals,
          points: t.points + (homeWin ? 3 : draw ? 1 : 0),
        };
      }
      if (t.id === awayTeam.id) {
        return {
          ...t,
          played: t.played + 1,
          won: t.won + (!homeWin && !draw ? 1 : 0),
          drawn: t.drawn + (draw ? 1 : 0),
          lost: t.lost + (homeWin ? 1 : 0),
          goalsFor: t.goalsFor + awayGoals,
          goalsAgainst: t.goalsAgainst + homeGoals,
          points: t.points + (!homeWin && !draw ? 3 : draw ? 1 : 0),
        };
      }
      return t;
    });

    const updatedPlayers = state.players.map((p) => {
      const goal = scorers.find((s) => s.playerId === p.id);
      return goal ? { ...p, goals: p.goals + goal.goals } : p;
    });

    const newMatch: Match = {
      id: `match-${Date.now()}`,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: homeTeam.name,
      awayTeamName: awayTeam.name,
      homeGoals,
      awayGoals,
      scorers,
      date: new Date().toISOString(),
    };

    const newState = {
      teams: updatedTeams,
      players: updatedPlayers,
      matches: [...state.matches, newMatch],
    };

    saveState({ ...state, ...newState });
    set(newState);
    return newState;
  },

  addPlayer: (playerData) => {
    const state = get();
    const newPlayer: Player = {
      ...playerData,
      id: `player-${Date.now()}`,
    };
    const updatedPlayers = [...state.players, newPlayer];
    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
    return { teams: state.teams, players: updatedPlayers, matches: state.matches };
  },

  editPlayer: (id, data) => {
    const state = get();
    const updatedPlayers = state.players.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
    return { teams: state.teams, players: updatedPlayers, matches: state.matches };
  },

  deletePlayer: (id) => {
    const state = get();
    const updatedPlayers = state.players.filter((p) => p.id !== id);
    const newState = { ...state, players: updatedPlayers };
    saveState(newState);
    set({ players: updatedPlayers });
  },

  updateTeamLogo: (teamId, logo) => {
    const state = get();
    const updatedTeams = state.teams.map((t) =>
      t.id === teamId ? { ...t, logo } : t
    );
    const newState = { ...state, teams: updatedTeams };
    saveState(newState);
    set({ teams: updatedTeams });
  },

  resetLeague: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      teams: defaultLeagueData.teams.map(t => ({ ...t, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 })),
      players: defaultLeagueData.players.map(p => ({ ...p, goals: 0 })),
      matches: [],
    });
  },

  getFullState: () => {
    const state = get();
    return { teams: state.teams, players: state.players, matches: state.matches };
  },
}));
