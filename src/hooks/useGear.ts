import { useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { authApi } from '../api/auth';
import type { UserGearMedia, UserProfile } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';

export const useGear = () => {
    const { user, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [media, setMedia] = useState<UserGearMedia[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const fetchGear = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.getGear();
            setMedia(data.media);
            setProfile(data.profile);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при загрузке данных экипировки';
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGear();
    }, [fetchGear]);

    const uploadMedia = async (file: File, label: string) => {
        setIsUploading(true);
        setError(null);
        setSuccess(null);
        try {
            const newMedia = await authApi.uploadGearMedia(file, label);
            // Replace existing media with same label or add new
            setMedia(prev => {
                const filtered = prev.filter(m => m.label !== label);
                return [...filtered, newMedia];
            });
            
            // Sync user data to get updated verification status
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
            
            setSuccess('Скриншот успешно загружен');
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при загрузке файла';
            setError(message);
            return false;
        } finally {
            setIsUploading(false);
        }
    };

    const deleteMedia = async (id: number) => {
        setError(null);
        try {
            await authApi.deleteGearMedia(id);
            setMedia(prev => prev.filter(m => m.id !== id));
            
            // Sync user data
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
            
            setSuccess('Скриншот удален');
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при удалении скриншота';
            setError(message);
            return false;
        }
    };

    const submitForVerification = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const updatedMembership = await authApi.submitVerification();
            if (user) {
                const updatedMemberships = user.guild_memberships?.map(m => 
                    m.guild.id === updatedMembership.guild.id ? updatedMembership : m
                );
                setUser({ ...user, guild_memberships: updatedMemberships });
            }
            setSuccess('Заявка на верификацию отправлена');
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при отправке заявки';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        media,
        profile,
        isLoading,
        isUploading,
        error,
        success,
        uploadMedia,
        deleteMedia,
        submitForVerification,
        refresh: fetchGear
    };
};
