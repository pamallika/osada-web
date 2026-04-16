import { apiClient } from './client';
import type { ApiResponse, PublicGuildList, PublicGuildProfile, PublicGuildMember, GuildHistoryEvent } from './types';

export const publicApi = {
    getGuilds: async () => {
        const { data } = await apiClient.get<ApiResponse<PublicGuildList[]>>('public/guilds');
        return data.data;
    },

    getGuildProfile: async (slug: string) => {
        const { data } = await apiClient.get<ApiResponse<PublicGuildProfile>>(`public/guilds/${slug}`);
        return data.data;
    },

    getGuildMembers: async (slug: string) => {
        const { data } = await apiClient.get<ApiResponse<PublicGuildMember[]>>(`public/guilds/${slug}/members`);
        return data.data;
    },

    getGuildHistory: async (slug: string) => {
        const { data } = await apiClient.get<ApiResponse<GuildHistoryEvent[]>>(`public/guilds/${slug}/history`);
        return data.data;
    }
};
