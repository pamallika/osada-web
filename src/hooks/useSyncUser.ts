import { useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';

export const useSyncUser = () => {
    const { setUser, logout, token } = useAuthStore();

    const syncUser = useCallback(async () => {
        if (!token) return;
        
        try {
            const userData = await authApi.getMe();
            setUser(userData);
        } catch (error: unknown) {
            console.error('Failed to sync user:', error);
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                logout();
            }
        }
    }, [token, setUser, logout]);

    useEffect(() => {
        syncUser();
    }, [syncUser]);

    return { syncUser };
};
