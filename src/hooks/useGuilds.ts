import { useState, useCallback } from 'react';
import axios from 'axios';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

export const useGuilds = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useAuthStore();

    const createGuild = useCallback(async (name: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await guildApi.create(name);
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при создании гильдии';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    const acceptInvite = useCallback(async (inviteCode: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const token = inviteCode.includes('/invite/') ? inviteCode.split('/invite/')[1] : inviteCode;
            await guildApi.acceptInvite(token);
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при вступлении в гильдию';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [setUser]);

    return {
        isLoading,
        error,
        createGuild,
        acceptInvite,
        setError
    };
};
