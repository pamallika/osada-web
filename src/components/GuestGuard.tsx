import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface GuestGuardProps {
    children: React.ReactNode;
}

export const GuestGuard: React.FC<GuestGuardProps> = ({ children }) => {
    const { token, user } = useAuthStore();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    if (token) {
        // Если онбординг не пройден, шлем туда
        if (!user?.profile?.family_name) {
            return <Navigate to="/onboarding" replace />;
        }
        return <Navigate to={from} replace />;
    }

    return <>{children}</>;
};
