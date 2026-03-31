import React from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

export const toast = {
    success: (message: string, title = 'Успех') => 
        useNotificationStore.getState().addNotification({ type: 'success', title, message }),
    error: (message: string, title = 'Ошибка') => 
        useNotificationStore.getState().addNotification({ type: 'error', title, message }),
    info: (message: string, title = 'Инфо') => 
        useNotificationStore.getState().addNotification({ type: 'info', title, message }),
    warning: (message: string, title = 'Внимание') => 
        useNotificationStore.getState().addNotification({ type: 'warning', title, message }),
};

export const Toaster: React.FC = () => {
    const { notifications, removeNotification } = useNotificationStore();

    return (
        <div className="fixed bottom-6 right-6 z-[200] space-y-3 pointer-events-none">
            {notifications.map((n) => (
                <div 
                    key={n.id}
                    className={`
                        w-80 p-4 rounded-2xl border backdrop-blur-xl animate-in slide-in-from-right-10 fade-in duration-300 pointer-events-auto shadow-2xl
                        ${n.type === 'info' ? 'bg-zinc-900/90 border-zinc-800' : 
                          n.type === 'success' ? 'bg-emerald-900/20 border-emerald-800/50 text-emerald-400' :
                          n.type === 'warning' ? 'bg-amber-900/20 border-amber-800/50 text-amber-500' :
                          'bg-rose-900/20 border-rose-800/50 text-rose-500'}
                    `}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] italic mb-1 opacity-60">
                                {n.title}
                            </h4>
                            <p className="text-xs font-bold text-zinc-100 leading-tight">
                                {n.message}
                            </p>
                        </div>
                        <button 
                            onClick={() => removeNotification(n.id)}
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    {n.actionLabel && (
                        <button 
                            onClick={() => {
                                n.onAction?.();
                                removeNotification(n.id);
                            }}
                            className="mt-3 w-full bg-violet-700 hover:bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest italic py-2 rounded-lg transition-all"
                        >
                            {n.actionLabel}
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};
