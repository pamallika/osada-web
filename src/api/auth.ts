import { apiClient } from './client';
import type { ApiResponse, User, UserGearMedia, GuildMembership, UserProfile } from './types';

export type ProfileData = Partial<UserProfile>;

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

    getGear: async () => {
        const { data } = await apiClient.get<ApiResponse<{ profile: UserProfile, media: UserGearMedia[] }>>('auth/gear');
        return data.data;
    },

    uploadGearMedia: async (file: File, label: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('label', label);
        const { data } = await apiClient.post<ApiResponse<UserGearMedia>>('auth/gear/media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.data;
    },

    deleteGearMedia: async (id: number) => {
        const { data } = await apiClient.post<ApiResponse<null>>(`auth/gear/media/${id}`, { _method: 'DELETE' });
        return data.data;
    },

    submitVerification: async () => {
        const { data } = await apiClient.post<ApiResponse<GuildMembership>>('guilds/my/verification/submit');
        return data.data;
    },

    getVerifications: async () => {
        const { data } = await apiClient.get<ApiResponse<GuildMembership[]>>('guilds/my/verifications');
        return data.data;
    },

    getVerificationDetails: async (userId: number) => {
        const { data } = await apiClient.get<ApiResponse<{ membership: GuildMembership, profile: UserProfile, media: UserGearMedia[] }>>(`guilds/my/verifications/${userId}`);
        return data.data;
    },

    approveVerification: async (userId: number) => {
        const { data } = await apiClient.post<ApiResponse<GuildMembership>>(`guilds/my/verifications/${userId}/approve`);
        return data.data;
    },

    rejectVerification: async (userId: number) => {
        const { data } = await apiClient.post<ApiResponse<GuildMembership>>(`guilds/my/verifications/${userId}/reject`);
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

    verifyTelegramTMA: async (payload: { initData: string }) => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('auth/telegram/verify', payload);
        return data.data;
    },

    registerTelegramTMA: async (payload: { initData: string }) => {
        const { data } = await apiClient.post<ApiResponse<AuthResponse>>('auth/telegram/register', payload);
        return data.data;
    },

    linkTelegramTMA: async (payload: { initData: string }) => {
        const { data } = await apiClient.post<ApiResponse<User>>('auth/telegram/link', payload);
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

    initTelegramAuth: async (verifierHash?: string) => {
        const { data } = await apiClient.post<ApiResponse<{ auth_code: string }>>('auth/telegram/init', { verifier_hash: verifierHash });
        return data.data;
    },

    initSocialLink: async (provider: string) => {
        const { data } = await apiClient.post<ApiResponse<{ link_code: string }>>('auth/social/link-init', { provider });
        return data.data;
    },

    checkTelegramAuth: async (authCode: string, verifier?: string) => {
        const { data } = await apiClient.get<ApiResponse<AuthResponse | null>>(`auth/telegram/check/${authCode}`, {
            params: { verifier }
        });
        return data.data;
    },

    uploadAvatar: async (file: File) => {
        const formData = new FormData();
        formData.append('avatar', file);
        const { data } = await apiClient.post<ApiResponse<User>>('auth/avatar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return data.data;
    }
};
