import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthState {
  userId: string | null;
  username: string | null;
  telegramId: string | null;
  photoUrl: string | null;
  setUser: (data: { userId?: string; username?: string; telegramId?: string; photoUrl?: string }) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userId: null,
      username: null,
      telegramId: null,
      photoUrl: null,
      setUser: (data) => set((state) => ({
        userId: data.userId !== undefined ? data.userId : state.userId,
        username: data.username !== undefined ? data.username : state.username,
        telegramId: data.telegramId !== undefined ? data.telegramId : state.telegramId,
        photoUrl: data.photoUrl !== undefined ? data.photoUrl : state.photoUrl,
      })),
      clear: () => set({ userId: null, username: null, telegramId: null, photoUrl: null }),
    }),
    {
      name: 'auth-store',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
