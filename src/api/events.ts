import apiClient from './client';
import type { ApiResponse } from './types';

export interface Participant {
    user_id: number;
    family_name: string;
    global_name?: string | null;
    char_class: string;
    avatar_url?: string | null;
    status: 'confirmed' | 'declined' | 'unknown';
    verification_status?: 'incomplete' | 'pending' | 'verified' | 'updated';
}

export interface Squad {
    id: number;
    name: string;
    limit: number;
    participants?: Participant[];
    is_system?: boolean;
}

export interface EventUser {
    id: number;
    avatar_url?: string | null;
    profile?: {
        family_name?: string;
        global_name?: string | null;
        verification_status?: 'incomplete' | 'pending' | 'verified' | 'updated';
        [key: string]: unknown;
    };
}

export interface Event {
    id: number;
    name: string;
    start_at: string;
    description: string | null;
    status: 'draft' | 'published' | 'completed' | 'cancelled' | 'archived';
    stats?: {
        total_confirmed: number;
        total_declined: number;
        total_pending: number;
        total_slots: number;
    };
    guild_id: number;
    squads?: Squad[];
    pending_users?: EventUser[];
    declined_users?: EventUser[];
}

export interface CreateEventRequest {
    guild_id: number;
    name: string;
    start_at: string;
    description?: string;
    squads?: Array<{ name: string; limit: number }>;
}

export const eventsApi = {
    getEvents: async (guildId: number) => {
        const response = await apiClient.get<ApiResponse<Event[]>>(`events`, {
            params: { guild_id: guildId }
        });
        return response.data.data;
    },

    createEvent: async (data: CreateEventRequest) => {
        const response = await apiClient.post<ApiResponse<Event>>(`events`, data);
        return response.data.data;
    },

    updateEvent: async (id: number, data: Partial<CreateEventRequest>) => {
        const response = await apiClient.post<ApiResponse<Event>>(`events/${id}`, {
            ...data,
            _method: 'PATCH'
        });
        return response.data.data;
    },

    getEvent: async (id: number) => {
        const response = await apiClient.get<ApiResponse<Event>>(`events/${id}`);
        return response.data.data;
    },

    publishEvent: async (id: number, options?: { platforms?: string[], roles?: string[] }) => {
        const response = await apiClient.post<ApiResponse<{ status: string }>>(`events/${id}/publish`, options);
        return response.data.data;
    },

    archiveEvent: async (id: number) => {
        const response = await apiClient.post<ApiResponse<{ status: string }>>(`events/${id}/archive`);
        return response.data.data;
    },

    addSquad: async (eventId: number, data: { name: string; limit: number }) => {
        const response = await apiClient.post<ApiResponse<Squad>>(`events/${eventId}/squads`, data);
        return response.data.data;
    },

    updateSquad: async (eventId: number, squadId: number, data: { name: string; limit: number }) => {
        const response = await apiClient.post<ApiResponse<Squad>>(`events/${eventId}/squads/${squadId}`, {
            ...data,
            _method: 'PATCH'
        });
        return response.data.data;
    },

    deleteSquad: async (eventId: number, squadId: number) => {
        const response = await apiClient.post<ApiResponse<{ status: string }>>(`events/${eventId}/squads/${squadId}`, {
            _method: 'DELETE'
        });
        return response.data.data;
    },

    joinEvent: async (eventId: number, squadId: number | null) => {
        const response = await apiClient.post<ApiResponse<{ status: string; squad_id: number }>>(`events/${eventId}/join`, {
            squad_id: squadId
        });
        return response.data.data;
    },

    declineEvent: async (eventId: number) => {
        const response = await apiClient.post<ApiResponse<{ status: string }>>(`events/${eventId}/decline`);
        return response.data.data;
    },

    moveParticipant: async (eventId: number, userId: number, squadId: number | null) => {
        const response = await apiClient.post<ApiResponse<{ status: string }>>(`events/${eventId}/participants/${userId}`, {
            squad_id: squadId,
            _method: 'PATCH'
        });
        return response.data.data;
    }
};
