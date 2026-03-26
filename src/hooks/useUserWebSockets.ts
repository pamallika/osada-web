import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { getEcho } from '../api/echo';
import { useSyncUser } from './useSyncUser';
import { useNotificationStore } from '../store/useNotificationStore';

export const useUserWebSockets = () => {
    const { user, setPendingApplicationsCount } = useAuthStore();
    const { syncUser } = useSyncUser();
    const navigate = useNavigate();
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        if (!user) return;

        const echo = getEcho();
        if (!echo) return;

        // Personal channel for user
        const personalChannel = echo.private(`App.Models.User.${user.id}`);

        personalChannel.listen('GuildApplicationProcessed', (payload: { status: 'approved' | 'rejected' }) => {
            if (payload.status === 'approved') {
                addNotification({
                    type: 'success',
                    title: 'Поздравляем!',
                    message: 'Ваша заявка в гильдию была одобрена!'
                });
                syncUser();
                setTimeout(() => navigate('/events'), 1500);
            } else if (payload.status === 'rejected') {
                addNotification({
                    type: 'error',
                    title: 'Отказ',
                    message: 'К сожалению, ваша заявка в гильдию была отклонена.'
                });
                syncUser();
            }
        });

        // Guild channel for admins to track applications
        const activeMembership = user.guild_memberships?.find(m => m.status === 'active');
        if (activeMembership && ['creator', 'admin', 'officer'].includes(activeMembership.role)) {
            const guildChannel = echo.private(`guild.${activeMembership.guild.id}`);
            
            guildChannel.listen('GuildApplicationCreated', (payload: any) => {
                const { pendingApplicationsCount, setPendingApplicationsCount } = useAuthStore.getState();
                setPendingApplicationsCount(pendingApplicationsCount + 1);
                addNotification({
                    type: 'info',
                    title: 'Новая заявка',
                    message: `${payload.family_name} подал заявку в гильдию.`
                });
            });
        }

        return () => {
            echo.leave(`App.Models.User.${user.id}`);
            if (activeMembership) {
                echo.leave(`guild.${activeMembership.guild.id}`);
            }
        };
    }, [user, syncUser, navigate, addNotification, setPendingApplicationsCount]);
};
