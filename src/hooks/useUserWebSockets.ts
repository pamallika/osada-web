import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useWebSocketStore } from '../store/useWebSocketStore';
import { useSyncUser } from './useSyncUser';

export const useUserWebSockets = () => {
    const { user, token } = useAuthStore();
    const { syncUser } = useSyncUser();
    const navigate = useNavigate();
    const initWebSockets = useWebSocketStore((state) => state.initWebSockets);

    useEffect(() => {
        initWebSockets(user, token, navigate, syncUser);
    }, [user, token, navigate, syncUser, initWebSockets]);
};
