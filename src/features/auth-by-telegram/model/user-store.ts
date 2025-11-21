import { create } from 'zustand';
import type { User } from '@/entities/user';;

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Действия
  setUser: (user: User | null) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
  
  clearUser: () => set({ 
    user: null, 
    isAuthenticated: false 
  }),
  
  setLoading: (isLoading) => set({ isLoading })
}));