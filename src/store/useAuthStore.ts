import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    name: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user?: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: localStorage.getItem('siege-token'),
            user: null,
            setAuth: (token, user) => {
                localStorage.setItem('siege-token', token);
                set({ token, user: user ?? null });
            },
            logout: () => {
                localStorage.removeItem('siege-token');
                set({ token: null, user: null });
            },
        }),
        {
            name: 'siege-auth-storage',
        }
    )
);