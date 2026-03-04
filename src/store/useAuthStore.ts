import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
    family_name: string | null;
    char_class: string | null;
    level: number | null;
    attack: number | null;
    awk_attack: number | null;
    defense: number | null;
    gear_score: number | null;
}

interface LinkedAccount {
    provider: string;
    provider_id: string;
    username: string;
    display_name: string | null;
    avatar: string | null;
}

interface User {
    id: number;
    name: string;
    email?: string;
    profile?: Profile;
    linked_accounts?: LinkedAccount[];
}

interface AuthState {
    token: string | null;
    user: User | null;
    isInitialLoading: boolean;
    setAuth: (token: string, user?: User) => void;
    setUser: (user: User) => void;
    setInitialLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: localStorage.getItem('siege-token'),
            user: null,
            isInitialLoading: true,
            setAuth: (token, user) => {
                localStorage.setItem('siege-token', token);
                set({ token, user: user ?? null });
            },
            setUser: (user) => set({ user }),
            setInitialLoading: (isInitialLoading) => set({ isInitialLoading }),
            logout: () => {
                localStorage.removeItem('siege-token');
                set({ token: null, user: null, isInitialLoading: false });
            },
        }),
        {
            name: 'siege-auth-storage',
        }
    )
);