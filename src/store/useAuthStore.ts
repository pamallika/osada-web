import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Profile {
    family_name: string | null;
    global_name: string | null;
    char_class: string | null;
    attack: number | null;
    awakening_attack: number | null;
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

interface Guild {
    id: number;
    name: string;
    logo_url: string | null;
    invite_slug: string | null;
}

interface GuildMembership {
    guild: Guild;
    role: 'creator' | 'admin' | 'officer' | 'member' | 'pending';
    status: 'active' | 'pending';
}

interface User {
    id: number;
    email: string;
    has_password: boolean;
    profile?: Profile;
    linked_accounts?: LinkedAccount[];
    guild_memberships?: GuildMembership[];
}

interface AuthState {
    token: string | null;
    user: User | null;
    isInitialLoading: boolean;
    isTMA: boolean;
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
            isTMA: !!(window as any).Telegram?.WebApp?.initData,
            setAuth: (token, user) => {
                localStorage.setItem('siege-token', token);
                set({ token, user: user ?? null, isInitialLoading: false });
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