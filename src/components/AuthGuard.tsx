import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { token, user, isInitialLoading } = useAuthStore();
    const location = useLocation();

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если пользователь залогинен, но нет family_name (онбординг не пройден)
    // редиректим на страницу онбординга.
    const hasCompletedOnboarding = !!user?.profile?.family_name;

    if (!hasCompletedOnboarding && 
        location.pathname !== '/onboarding' && 
        location.pathname !== '/profile' &&
        !location.pathname.startsWith('/events/') // Разрешаем просмотр ивентов без полного профиля
    ) {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};
