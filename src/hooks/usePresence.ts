import { useWebSocketStore } from '../store/useWebSocketStore';

export const usePresence = () => {
    const onlineUsers = useWebSocketStore((state) => state.onlineUsers);

    return { 
        onlineCount: onlineUsers.length, 
        onlineUsers 
    };
};
