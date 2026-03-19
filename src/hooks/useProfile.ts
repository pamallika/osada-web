import { useState, useCallback } from 'react';
import axios from 'axios';
import { authApi, type ProfileData } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

export const useProfile = (initialData: ProfileData) => {
    const { setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState<ProfileData>(initialData);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSuccess(null);
        setError(null);

        if (name === 'family_name' || name === 'char_class' || name === 'global_name') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else {
            const val = value === '' ? 0 : parseInt(value);
            setFormData(prev => ({ ...prev, [name]: isNaN(val) ? 0 : val }));
        }
    }, []);

    const updateProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const updatedUser = await authApi.updateProfile(formData);
            setUser(updatedUser);
            setSuccess('Профиль успешно обновлен!');
            return true;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при обновлении профиля';
            setError(message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [formData, setUser]);

    const gearScore = Math.max(formData.attack || 0, formData.awakening_attack || 0) + (formData.defense || 0);

    return {
        formData,
        setFormData,
        isLoading,
        error,
        success,
        gearScore,
        handleChange,
        updateProfile,
        setError,
        setSuccess
    };
};
