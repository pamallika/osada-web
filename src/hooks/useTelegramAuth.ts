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
    const authCodeRef = useRef<string | null>(null);

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

    const checkAuthStatus = useCallback(async (code: string) => {
        try {
            const verifier = localStorage.getItem(`siege_tg_verifier_${code}`);
            const data = await authApi.checkTelegramAuth(code, verifier || undefined);
            
            if (data && data.token && data.user) {
                stopPolling();
                authCodeRef.current = null;
                localStorage.removeItem(`siege_tg_verifier_${code}`);
                setAuth(data.token, data.user);
                setIsLoading(false);
                navigate('/dashboard');
                return true;
            }
        } catch (err) {
            console.error('Check status error:', err);
        }
        return false;
    }, [navigate, setAuth, stopPolling]);

    const startDeepLinkAuth = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        stopPolling();
        authCodeRef.current = null;

        try {
            // PKCE: Generate Verifier and Challenge (Hash)
            const verifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            const verifierHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
                .then(buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join(''));

            const { auth_code } = await authApi.initTelegramAuth(verifierHash);
            authCodeRef.current = auth_code;
            
            // Persist verifier for recovery after tab resume
            localStorage.setItem(`siege_tg_verifier_${auth_code}`, verifier);

            const botName = import.meta.env.VITE_TELEGRAM_BOT_NAME || 'arigami_sage_bot';
            const deepLink = `https://t.me/${botName}?start=auth_${auth_code}`;
            
            window.open(deepLink, '_blank');

            // Start polling
            pollingInterval.current = window.setInterval(async () => {
                checkAuthStatus(auth_code);
            }, 3000);

            // Set timeout for 2 minutes
            timeoutId.current = window.setTimeout(() => {
                stopPolling();
                authCodeRef.current = null;
                setIsLoading(false);
                setError('Время ожидания истекло. Пожалуйста, попробуйте еще раз.');
            }, 120000);

        } catch (err: any) {
            setIsLoading(false);
            setError(err.response?.data?.message || 'Ошибка при инициализации Telegram Auth');
            console.error('Telegram deep link init error:', err);
        }
    }, [checkAuthStatus, stopPolling]);

    // Visibility API support (Fix for mobile freezes)
    useState(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible' && authCodeRef.current && isLoading) {
                console.log('Tab resumed, checking auth status immediately...');
                checkAuthStatus(authCodeRef.current);
            }
        };

        const handleFocus = () => {
            if (authCodeRef.current && isLoading) {
                checkAuthStatus(authCodeRef.current);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }); // Runs once on hook init

    return {
        startDeepLinkAuth,
        isLoading,
        error,
        setError,
        stopPolling
    };
};
