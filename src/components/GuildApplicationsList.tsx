import React, { useEffect, useState } from 'react';
import { guildApi, type GuildMember } from '../api/guilds';

export const GuildApplicationsList: React.FC = () => {
    const [applications, setApplications] = useState<GuildMember[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchApplications = async () => {
        try {
            const data = await guildApi.getApplications();
            setApplications(data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleAction = async (userId: number, action: 'approve' | 'reject') => {
        if (!userId) return;
        
        try {
            if (action === 'approve') {
                await guildApi.approveApplication(userId);
            } else {
                await guildApi.rejectApplication(userId);
            }
            setApplications(prev => prev.filter(app => app.user.id !== userId));
        } catch (error) {
            console.error(`Failed to ${action} application:`, error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-12 gap-4">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Синхронизация заявок</span>
        </div>
    );

    if (applications.length === 0) return (
        <div className="text-slate-500 text-center p-12 border-2 border-dashed border-slate-700/50 rounded-[2rem]">
            <div className="text-4xl mb-4 grayscale opacity-20">📂</div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] italic">Нет входящих заявок</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map(app => (
                <div key={app.user.id} className="bg-slate-900/50 p-6 rounded-3xl border-2 border-slate-700/30 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-lg border border-slate-700 group-hover:scale-105 transition-transform">
                            👤
                        </div>
                        <div>
                            <div className="font-black text-white uppercase italic tracking-tight">{app.user.profile?.family_name || app.user.profile?.global_name || 'Участник'}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{app.user.profile?.char_class || 'БЕЗ КЛАССА'}</div>
                            <div className="text-[8px] text-slate-600 font-bold uppercase mt-1">Подано: {new Date(app.created_at).toLocaleDateString()}</div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleAction(app.user.id, 'approve')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-all shadow-lg shadow-emerald-500/10 border border-emerald-400/20"
                            title="Принять"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleAction(app.user.id, 'reject')}
                            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-3 rounded-xl transition-all border border-red-500/20"
                            title="Отклонить"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};
