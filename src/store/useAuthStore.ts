import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api/types';
import { useWebSocketStore } from './useWebSocketStore';

interface AuthState {
    token: string | null;
    user: User | null;
    isInitialLoading: boolean;
    isTMA: boolean;
    pendingApplicationsCount: number;
    setAuth: (token: string, user?: User) => void;
    setUser: (user: User) => void;
    setInitialLoading: (loading: boolean) => void;
    setPendingApplicationsCount: (count: number) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: localStorage.getItem('siege-token'),
            user: null,
            isInitialLoading: true,
            isTMA: !!(window as any).Telegram?.WebApp?.initData,
            pendingApplicationsCount: 0,
            setAuth: (token, user) => {
                localStorage.setItem('siege-token', token);
                set({ token, user: user ?? null, isInitialLoading: false });
            },
            setUser: (user) => set({ user }),
            setInitialLoading: (isInitialLoading) => set({ isInitialLoading }),
            setPendingApplicationsCount: (pendingApplicationsCount) => set({ pendingApplicationsCount }),
            logout: () => {
                localStorage.removeItem('siege-token');
                useWebSocketStore.getState().disconnectWebSockets();
                set({ token: null, user: null, isInitialLoading: false });
            },
        }),
        {
            name: 'siege-auth-storage',
        }
    )
);