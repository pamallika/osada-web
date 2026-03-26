import { create } from 'zustand';

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    actionLabel?: string;
    onAction?: () => void;
    autoClose?: boolean;
}

interface NotificationState {
    notifications: AppNotification[];
    addNotification: (notification: Omit<AppNotification, 'id'>) => void;
    removeNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
    notifications: [],
    addNotification: (notification) => {
        const id = Math.random().toString(36).substring(7);
        const newNotification = { ...notification, id };
        set((state) => ({ notifications: [...state.notifications, newNotification] }));
        
        if (notification.autoClose !== false) {
            setTimeout(() => {
                set((state) => ({ 
                    notifications: state.notifications.filter((n) => n.id !== id) 
                }));
            }, 6000);
        }
    },
    removeNotification: (id) => set((state) => ({ 
        notifications: state.notifications.filter((n) => n.id !== id) 
    })),
}));
