import { apiClient } from './client';
import type { ApiResponse, User } from './types';

export type ProfileData = {
    family_name: string;
    global_name?: string | null;
    char_class?: string | null;
    attack?: number | null;
    awakening_attack?: number | null;
    defense?: number | null;
}

interface AuthResponse {
    token: string;
    user: User;
}

export const authApi = {
    getMe: async () => {
        const { data } = await apiClient.get<ApiResponse<User>>('auth/me');
        return data.data;
    },

    updateProfile: async (profileData: ProfileData) => {
        const { data } = await apiClient.post<ApiResponse<User>>('auth/profile', {
            ...profileData,
            _method: 'PATCH'
        });
        return data.data;
    },

    updateAccount: async (accountData: { 
        email?: string; 
        password?: string; 
        current_password?: string; 
        password_confirmation?: string; 
    }) => {
        const { data } = await apiClient.post<ApiResponse<User>>('auth/account', {
            ...accountData,
            _method: 'PATCH'
        });
        return data.data;
    },

    unlinkAccount: async (provider: string) => {
        const { data } = await apiClient.post<ApiResponse<User>>(`auth/linked-accounts/${provider}`, {
            _method: 'DELETE'
        });
        return data.data;
    },

    login: async (credentials: Record<string, string>) => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('auth/login', credentials);
        return data.data; 
    },

    loginViaTelegram: async (payload: any) => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('auth/telegram/login', payload);
        return data.data;
    },

    register: async (credentials: Record<string, string>) => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('auth/register', credentials);
        return data.data; 
    },

    logout: async () => {
        await apiClient.post('auth/logout');
    },

    getUserProfile: async (userId: number) => {
        const { data } = await apiClient.get<ApiResponse<User>>(`users/${userId}/profile`);
        return data.data;
    },

    getTelegramLink: async () => {
        const { data } = await apiClient.get<ApiResponse<{ link: string }>>('auth/telegram-link');
        return data.data;
    },

    initTelegramAuth: async () => {
        const { data } = await apiClient.post<ApiResponse<{ auth_code: string }>>('auth/telegram/init');
        return data.data;
    },

    initSocialLink: async (provider: string) => {
        const { data } = await apiClient.post<ApiResponse<{ link_code: string }>>('auth/social/link-init', { provider });
        return data.data;
    },

    checkTelegramAuth: async (authCode: string) => {
        const { data } = await apiClient.get<ApiResponse<AuthResponse | null>>(`auth/telegram/check/${authCode}`);
        return data.data;
    }
};
