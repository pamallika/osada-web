import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';

export const useAuth = () => {
    const { logout: storeLogout, user, token, setAuth } = useAuthStore();
    const navigate = useNavigate();

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            storeLogout();
            navigate('/login');
        }
    }, [storeLogout, navigate]);

    const loginWithTelegram = useCallback(async (payload: any) => {
        try {
            const data = await authApi.loginViaTelegram(payload);
            setAuth(data.token, data.user);
            
            if (data.user.profile?.family_name) {
                navigate('/dashboard');
            } else {
                navigate('/profile');
            }
        } catch (error) {
            console.error('Telegram login failed:', error);
            throw error;
        }
    }, [setAuth, navigate]);

    return {
        user,
        token,
        logout,
        loginWithTelegram,
        isAuthenticated: !!token
    };
};
