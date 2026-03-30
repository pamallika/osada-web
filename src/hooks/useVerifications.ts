import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth';
import type { GuildMembership, UserProfile, UserGearMedia } from '../api/types';

export const useVerifications = () => {
    const [verifications, setVerifications] = useState<GuildMembership[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVerifications = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.getVerifications();
            setVerifications(data);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при загрузке списка верификаций';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVerifications();
    }, [fetchVerifications]);

    const getVerificationDetails = async (userId: number) => {
        setError(null);
        try {
            return await authApi.getVerificationDetails(userId);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при загрузке деталей верификации';
            setError(message);
            return null;
        }
    };

    const approve = async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await authApi.approveVerification(userId);
            setVerifications(prev => prev.map(v => 
                v.user?.id === updated.user?.id ? updated : v
            ));
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при подтверждении верификации';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const reject = async (userId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const updated = await authApi.rejectVerification(userId);
            setVerifications(prev => prev.map(v => 
                v.user?.id === updated.user?.id ? updated : v
            ));
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при отклонении верификации';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        verifications,
        isLoading,
        error,
        getVerificationDetails,
        approve,
        reject,
        refresh: fetchVerifications
    };
};
