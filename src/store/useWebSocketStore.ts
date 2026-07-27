import { create } from 'zustand';
import { getEcho } from '../api/echo';
import { useAuthStore } from './useAuthStore';
import { useNotificationStore } from './useNotificationStore';
import type { User } from '../api/types';

export interface PresenceUser {
    id: number;
    name: string;
    role: string;
}

interface WebSocketStoreState {
    onlineUsers: PresenceUser[];
    activeGuildId: number | null;
    activeUserId: number | null;
    
    // Actions
    initWebSockets: (user: User | null, token: string | null, navigate?: (path: string) => void, syncUser?: () => void) => void;
    disconnectWebSockets: () => void;
}

let currentGuildId: number | null = null;
let currentUserId: number | null = null;

export const useWebSocketStore = create<WebSocketStoreState>((set, get) => ({
    onlineUsers: [],
    activeGuildId: null,
    activeUserId: null,

    initWebSockets: (user, token, navigate, syncUser) => {
        if (!user || !token) {
            get().disconnectWebSockets();
            return;
        }

        const echo = getEcho();
        if (!echo) return;

        const activeMembership = user.guild_memberships?.find(m => m.status === 'active');
        const newGuildId = activeMembership?.guild.id || null;
        const newUserId = user.id;

        // Clean up previous guild subscriptions if guild changed
        if (currentGuildId && currentGuildId !== newGuildId) {
            echo.leaveChannel(`presence-guild.${currentGuildId}`);
            echo.leaveChannel(`private-guild.${currentGuildId}`);
            set({ onlineUsers: [] });
        }

        // Clean up previous user subscription if user changed
        if (currentUserId && currentUserId !== newUserId) {
            echo.leaveChannel(`private-App.Models.User.${currentUserId}`);
        }

        currentGuildId = newGuildId;
        currentUserId = newUserId;
        set({ activeGuildId: newGuildId, activeUserId: newUserId });

        // 1. Personal user channel
        const personalChannelName = `App.Models.User.${user.id}`;
        const personalChannel = echo.private(personalChannelName);

        // Remove listeners first to avoid duplicates
        personalChannel.stopListening('GuildApplicationProcessed');

        personalChannel.listen('GuildApplicationProcessed', (payload: { status: 'approved' | 'rejected' }) => {
            const { addNotification } = useNotificationStore.getState();
            if (payload.status === 'approved') {
                addNotification({
                    type: 'success',
                    title: 'Поздравляем!',
                    message: 'Ваша заявка в гильдию была одобрена!'
                });
                syncUser?.();
                if (navigate) {
                    setTimeout(() => navigate('/events'), 1500);
                }
            } else if (payload.status === 'rejected') {
                addNotification({
                    type: 'error',
                    title: 'Отказ',
                    message: 'К сожалению, ваша заявка в гильдию была отклонена.'
                });
                syncUser?.();
            }
        });

        // 2. Guild channels if user is in an active guild
        if (newGuildId) {
            // Admin/Officer notification channel
            if (activeMembership && ['creator', 'admin', 'officer'].includes(activeMembership.role)) {
                const guildChannel = echo.private(`guild.${newGuildId}`);
                guildChannel.stopListening('GuildApplicationCreated');
                guildChannel.listen('GuildApplicationCreated', (payload: any) => {
                    const { pendingApplicationsCount, setPendingApplicationsCount } = useAuthStore.getState();
                    const { addNotification } = useNotificationStore.getState();
                    setPendingApplicationsCount(pendingApplicationsCount + 1);
                    addNotification({
                        type: 'info',
                        title: 'Новая заявка',
                        message: `${payload.family_name || 'Игрок'} подал заявку в гильдию.`
                    });
                });
            }

            // Presence channel for online users list
            const presenceChannelName = `guild.${newGuildId}`;
            echo.join(presenceChannelName)
                .here((users: PresenceUser[]) => {
                    set({ onlineUsers: users });
                })
                .joining((joiningUser: PresenceUser) => {
                    set((state) => {
                        if (state.onlineUsers.some(u => u.id === joiningUser.id)) return state;
                        return { onlineUsers: [...state.onlineUsers, joiningUser] };
                    });
                })
                .leaving((leavingUser: PresenceUser) => {
                    set((state) => ({
                        onlineUsers: state.onlineUsers.filter(u => u.id !== leavingUser.id)
                    }));
                })
                .error((error: any) => {
                    console.error('Presence Channel Error:', error);
                })
                .stopListening('.GlobalNotification')
                .listen('.GlobalNotification', (data: any) => {
                    const { addNotification } = useNotificationStore.getState();
                    addNotification({
                        title: data.type === 'info' ? 'Уведомление' : 'Важное событие', 
                        message: data.message || 'Проверьте раздел событий',
                        type: data.type || 'info',
                        actionLabel: data.link_url ? 'Перейти' : undefined,
                        onAction: data.link_url && navigate ? () => navigate(data.link_url) : undefined
                    });
                });
        }
    },

    disconnectWebSockets: () => {
        const echo = getEcho();
        if (echo) {
            if (currentUserId) {
                echo.leaveChannel(`private-App.Models.User.${currentUserId}`);
            }
            if (currentGuildId) {
                echo.leaveChannel(`presence-guild.${currentGuildId}`);
                echo.leaveChannel(`private-guild.${currentGuildId}`);
            }
        }
        currentGuildId = null;
        currentUserId = null;
        set({ onlineUsers: [], activeGuildId: null, activeUserId: null });
    }
}));
