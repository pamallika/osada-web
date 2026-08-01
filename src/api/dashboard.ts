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
        top_players: { id: number; name: string; confirmed_count: number; avatar: string | null }[]; // All active players ordered by count
    };
    meta: {
        class_distribution: { class: string; count: number }[];
    };
    gear?: {
        averages: {
            avg_gs: number;
            avg_attack: number;
            avg_awakening_attack: number;
            avg_defense: number;
        };
        gs_distribution: { range: string; count: number }[]; // '< 750', '750-800', '800-840', '840+'
        class_gear: { class_name: string; avg_gs: number; count: number }[];
        growth_trend: { dates: string[]; avg_gs: number[] };
        top_growth: { user_id: number; family_name: string; current_gs: number; gs_delta: number; avatar: string | null }[];
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
