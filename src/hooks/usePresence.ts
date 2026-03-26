import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { getEcho } from '../api/echo';
import { useNavigate } from 'react-router-dom';

interface PresenceUser {
    id: number;
    name: string;
    role: string;
}

export const usePresence = () => {
    const { user, token } = useAuthStore();
    const { addNotification } = useNotificationStore();
    const navigate = useNavigate();
    const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
    
    const activeGuild = user?.guild_memberships?.find(m => m.status === 'active')?.guild;
    const guildId = activeGuild?.id;

    const handleNotification = useCallback((data: any) => {
        addNotification({
            title: data.type === 'info' ? 'Уведомление' : 'Важное событие', 
            message: data.message || 'Проверьте раздел событий',
            type: data.type || 'info',
            actionLabel: data.link_url ? 'Перейти' : undefined,
            onAction: data.link_url ? () => navigate(data.link_url) : undefined
        });
    }, [addNotification, navigate]);

    useEffect(() => {
        if (!token || !guildId) {
            setOnlineUsers([]);
            return;
        }

        const echo = getEcho();
        if (!echo) return;
        
        const channelName = `guild.${guildId}`; // Reverted to match botPhp

        echo.join(channelName)
            .here((users: PresenceUser[]) => {
                setOnlineUsers(users);
            })
            .joining((user: PresenceUser) => {
                setOnlineUsers((prev) => [...prev.filter(u => u.id !== user.id), user]);
            })
            .leaving((user: PresenceUser) => {
                setOnlineUsers((prev) => prev.filter(u => u.id !== user.id));
            })
            .listen('.GlobalNotification', (data: any) => {
                handleNotification(data);
            });

        return () => {
            echo.leave(channelName);
        };
    }, [guildId, token, handleNotification]);

    return { 
        onlineCount: onlineUsers.length, 
        onlineUsers 
    };
};
