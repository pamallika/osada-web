import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth';
import type { UserGearHistory } from '../api/types';

export const useGearHistory = (userId?: number | null) => {
    const [history, setHistory] = useState<UserGearHistory[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            let data: UserGearHistory[];
            if (userId) {
                data = await authApi.getMemberGearHistory(userId);
            } else {
                data = await authApi.getGearHistory();
            }
            setHistory(data || []);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'Ошибка при загрузке истории экипировки';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const deleteSnapshot = async (id: number): Promise<boolean> => {
        setError(null);
        try {
            await authApi.deleteGearHistoryItem(id);
            setHistory(prev => prev.filter(item => item.id !== id));
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message || err.message
                : 'Ошибка при удалении записи истории';
            setError(message);
            return false;
        }
    };

    return {
        history,
        isLoading,
        error,
        deleteSnapshot,
        refresh: fetchHistory
    };
};
