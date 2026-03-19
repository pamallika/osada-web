import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';

export const useTelegramAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setAuth } = useAuthStore();
    const navigate = useNavigate();
    const pollingInterval = useRef<number | null>(null);
    const timeoutId = useRef<number | null>(null);

    const stopPolling = useCallback(() => {
        if (pollingInterval.current) {
            window.clearInterval(pollingInterval.current);
            pollingInterval.current = null;
        }
        if (timeoutId.current) {
            window.clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }
    }, []);

    const startDeepLinkAuth = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        stopPolling();

        try {
            const { auth_code } = await authApi.initTelegramAuth();
            const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME || 'arigami_sage_bot';
            const deepLink = `https://t.me/${botName}?start=auth_${auth_code}`;
            
            window.open(deepLink, '_blank');

            // Start polling
            pollingInterval.current = window.setInterval(async () => {
                try {
                    const data = await authApi.checkTelegramAuth(auth_code);
                    if (data && data.token && data.user) {
                        stopPolling();
                        setAuth(data.token, data.user);
                        setIsLoading(false);
                        
                        if (data.user.profile?.family_name) {
                            navigate('/dashboard');
                        } else {
                            navigate('/profile');
                        }
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 3000);

            // Set timeout for 2 minutes
            timeoutId.current = window.setTimeout(() => {
                stopPolling();
                setIsLoading(false);
                setError('Время ожидания истекло. Пожалуйста, попробуйте еще раз.');
            }, 120000);

        } catch (err: any) {
            setIsLoading(false);
            setError(err.response?.data?.message || 'Ошибка при инициализации Telegram Auth');
            console.error('Telegram deep link init error:', err);
        }
    }, [navigate, setAuth, stopPolling]);

    return {
        startDeepLinkAuth,
        isLoading,
        error,
        setError,
        stopPolling
    };
};
