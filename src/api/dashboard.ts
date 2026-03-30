import apiClient from './client';
import type { ApiResponse } from './types';
import type { Event } from './events';
import type { Guild } from './guilds';

export interface DashboardMemberData {
    stats: {
        sieges_attended: number;
    };
    guild: Guild | null;
    next_event: Event | null; // One upcoming event where user is participating
    open_events: Event[]; // Guild events that are published and user is not in yet
}

export interface DashboardAnalyticsData {
    activity: {
        fill_rate: number; // %
        top_players: { id: number; name: string; confirmed_count: number; avatar: string | null }[];
    };
    meta: {
        class_distribution: { class: string; count: number }[];
    };
    hr?: { // Only for Admin+
        dynamics: {
            dates: string[];
            joined: number[];
            left: number[];
        };
    };
}

export const dashboardApi = {
    getMemberDashboard: async () => {
        const response = await apiClient.get<ApiResponse<DashboardMemberData>>('dashboard/member');
        return response.data;
    },

    getAnalyticsDashboard: async (period: number = 7) => {
        const response = await apiClient.get<ApiResponse<DashboardAnalyticsData>>('dashboard/analytics', {
            params: { period }
        });
        return response.data;
    }
};
