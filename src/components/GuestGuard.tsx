import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface GuestGuardProps {
    children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
    const { token, user, isInitialLoading } = useAuthStore();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    if (isInitialLoading) return null;

    if (token) {
        // Если онбординг не пройден, шлем туда (кроме просмотра ивентов)
        if (!user?.profile?.family_name && !location.pathname.startsWith('/events/')) {
            return <Navigate to="/onboarding" replace />;
        }
        
        // Если мы уже авторизованы, не пускаем на логин/регистрацию/гетвей
        if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/tma-gateway') {
            return <Navigate to={from} replace />;
        }
    }

    return <>{children}</>;
};
