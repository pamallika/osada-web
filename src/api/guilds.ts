import { apiClient } from './client';

export interface Guild {
    id: number;
    name: string;
    slug: string;
    logo_url?: string;
}

export const guildApi = {
    create: async (name: string) => {
        const { data } = await apiClient.post('/guilds', { name });
        return data.data as Guild;
    },

    getMe: async () => {
        const { data } = await apiClient.get('/auth/me');
        return data.data;
    }
};