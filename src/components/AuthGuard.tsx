import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { token, user } = useAuthStore();
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Если пользователь залогинен, но нет family_name (онбординг не пройден)
    // редиректим на страницу онбординга.
    const hasCompletedOnboarding = !!user?.profile?.family_name;

    if (!hasCompletedOnboarding && location.pathname !== '/onboarding' && location.pathname !== '/profile') {
        return <Navigate to="/onboarding" replace />;
    }

    return <>{children}</>;
};
