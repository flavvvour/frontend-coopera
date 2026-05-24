import { create } from 'zustand';

interface UiState {
  activeTeamId: string | null;
  setActiveTeamId: (id: string | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  activeTeamId: null,
  setActiveTeamId: (id) => set({ activeTeamId: id }),
}));
