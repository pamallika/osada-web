import { useState, useEffect } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth';
import type { User, UserGearMedia } from '../api/types';

export const usePlayerProfile = (userId: number | null) => {
    const [profile, setProfile] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) {
            setProfile(null);
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Assuming authApi.getUserProfile returns the user data directly or from data field
                const data = await authApi.getUserProfile(userId);
                setProfile(data);
            } catch (err: unknown) {
                const message = axios.isAxiosError(err) 
                    ? err.response?.data?.message || err.message 
                    : 'Ошибка при загрузке профиля';
                setError(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    return { profile, isLoading, error };
};
