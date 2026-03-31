import { apiClient } from './client';
import type { ApiResponse, User } from './types';

export interface Guild {
    id: number;
    name: string;
    slug?: string;
    invite_slug?: string | null;
    logo_url?: string | null;
}

export interface GuildMember {
    id: number;
    user_id: number;
    role: 'creator' | 'admin' | 'officer' | 'member' | 'pending';
    status: 'active' | 'pending';
    user: User;
    created_at: string;
}

export const guildApi = {
    create: async (name: string) => {
        const { data } = await apiClient.post<ApiResponse<Guild>>('guilds', { name });
        return data.data;
    },

    acceptInvite: async (token: string) => {
        const { data } = await apiClient.post<ApiResponse<unknown>>(`invites/${token}/accept`);
        return data.data;
    },

    getInvite: async () => {
        const { data } = await apiClient.get<ApiResponse<{ url: string }>>('guilds/my/invite');
        return data.data;
    },

    getInviteInfo: async (slug: string) => {
        const { data } = await apiClient.get<ApiResponse<{ id: number, name: string, logo_url: string, members_count: number }>>(`guilds/invite-info/${slug}`);
        return data.data;
    },

    applyToGuild: async (slug: string) => {
        const { data } = await apiClient.post<ApiResponse<null>>(`guilds/apply/${slug}`);
        return data.data;
    },

    cancelApplication: async () => {
        const { data } = await apiClient.post<ApiResponse<null>>('guilds/my/application', {
            _method: 'DELETE'
        });
        return data.data;
    },

    leaveGuild: async () => {
        const { data } = await apiClient.post<ApiResponse<User>>('guilds/my/leave');
        return data.data;
    },

    updateInviteSlug: async (slug: string) => {
        const { data } = await apiClient.post<ApiResponse<Guild>>('guilds/my/invite-slug', {
            invite_slug: slug,
            _method: 'PATCH'
        });
        return data.data;
    },

    getApplications: async () => {
        const { data } = await apiClient.get<ApiResponse<GuildMember[]>>('guilds/my/applications');
        return data.data;
    },

    approveApplication: async (userId: number) => {
        const { data } = await apiClient.post<ApiResponse<null>>(`guilds/my/applications/${userId}/approve`);
        return data.data;
    },

    rejectApplication: async (userId: number) => {
        const { data } = await apiClient.post<ApiResponse<null>>(`guilds/my/applications/${userId}/reject`);
        return data.data;
    },

    getMembers: async () => {
        const { data } = await apiClient.get<ApiResponse<GuildMember[]>>('guilds/my/members');
        return data.data;
    },

    updateMemberRole: async (userId: number, role: string) => {
        const { data } = await apiClient.post<ApiResponse<GuildMember>>(`guilds/my/members/${userId}/role`, { 
            role,
            _method: 'PATCH'
        });
        return data.data;
    },

    kickMember: async (userId: number) => {
        await apiClient.post(`guilds/my/members/${userId}`, {
            _method: 'DELETE'
        });
    },

    getIntegrations: async () => {
        const { data } = await apiClient.get<ApiResponse<any[]>>('guilds/my/integrations');
        return data.data;
    },

    updateIntegration: async (provider: string, settings: any) => {
        const { data } = await apiClient.post<ApiResponse<any>>(`guilds/my/integrations/${provider}`, {
            ...settings,
            _method: 'PATCH'
        });
        return data.data;
    },

    deleteIntegration: async (provider: string) => {
        await apiClient.post(`guilds/my/integrations/${provider}`, {
            _method: 'DELETE'
        });
    },

    getTelegramBindToken: async () => {
        const { data } = await apiClient.get<ApiResponse<{ token: string }>>('guilds/my/telegram-bind-token');
        return data.data;
    },

    uploadLogo: async (file: File) => {
        const formData = new FormData();
        formData.append('logo', file);
        const { data } = await apiClient.post<ApiResponse<Guild>>('guilds/my/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data.data;
    }
};
