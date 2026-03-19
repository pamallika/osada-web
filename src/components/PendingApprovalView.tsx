import React, { useState } from 'react';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/useAuthStore';

interface PendingApprovalViewProps {
    guildName: string;
}

export const PendingApprovalView: React.FC<PendingApprovalViewProps> = ({ guildName }) => {
    const { setUser } = useAuthStore();
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        if (!confirm('Вы уверены, что хотите отменить заявку?')) return;
        
        setLoading(true);
        try {
            await guildApi.cancelApplication();
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
        } catch (error) {
            console.error('Failed to cancel application:', error);
            alert('Не удалось отменить заявку. Попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[60vh] font-sans select-none animate-in fade-in duration-700">
            <div className="w-24 h-24 bg-amber-500/10 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-2xl border border-amber-500/20 relative group">
                <div className="absolute inset-0 bg-amber-500/5 rounded-[2rem] animate-pulse"></div>
                <span className="relative z-10 group-hover:scale-110 transition-transform duration-500">⏳</span>
            </div>
            
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] italic mb-3">Заявка на рассмотрении</span>
            <h2 className="text-4xl font-black mb-4 text-zinc-100 uppercase italic tracking-tighter">Ожидайте ответа</h2>
            
            <p className="text-zinc-500 text-sm font-medium max-w-md mb-8 leading-relaxed">
                Ваша заявка в гильдию <span className="text-zinc-100 font-black italic">{guildName}</span> обрабатывается офицерами.
            </p>
            
            <div className="space-y-4 w-full max-w-sm">
                <div className="p-5 bg-zinc-900 border border-zinc-800/50 rounded-2xl shadow-inner">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Статус системы</span>
                        </div>
                        <span className="text-[10px] font-black text-amber-500 uppercase italic tracking-wider">В ОЖИДАНИИ</span>
                    </div>
                </div>

                <button 
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full bg-zinc-800 hover:bg-rose-900/20 hover:text-rose-500 hover:border-rose-800/50 border border-transparent text-zinc-500 font-black py-4 rounded-xl transition-all uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-zinc-500/30 border-t-zinc-500 rounded-full animate-spin"></div>
                    ) : 'Отменить заявку'}
                </button>
            </div>
        </div>
    );
};
