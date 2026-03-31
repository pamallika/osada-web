import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';

const InviteHandler = () => {
    const { slug } = useParams();
    const { token: authToken, user, setUser } = useAuthStore();
    const navigate = useNavigate();
    const fetchInProgress = useRef(false);
    
    const [inviteInfo, setInviteInfo] = useState<{ id: number, name: string, logo_url: string, members_count: number } | null>(null);
    const [status, setStatus] = useState<'loading' | 'confirm' | 'error' | 'success'>('loading');
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    const fetchInviteInfo = async () => {
        if (!slug || fetchInProgress.current) return;
        
        fetchInProgress.current = true;
        setStatus('loading');
        setError(null);
        try {
            const info = await guildApi.getInviteInfo(slug);
            setInviteInfo(info);
            setStatus('confirm');
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setError(err.response?.data?.message || 'Не удалось получить информацию о гильдии.');
        } finally {
            fetchInProgress.current = false;
        }
    };

    useEffect(() => {
        if (!slug) return;

        // Сохраняем инвайт в localStorage для восстановления контекста после логина/онбординга
        localStorage.setItem('pending_invite', slug);

        if (!authToken) {
            navigate('/login', { state: { from: `/invite/${slug}` } });
            return;
        }

        // Если залогинен, но нет family_name - AuthGuard сам редиректнет на onboarding.
        // Когда пользователь вернется на /invite/:slug после онбординга, мы продолжим здесь.
        if (!user?.profile?.family_name) {
            return;
        }

        fetchInviteInfo();
    }, [slug, authToken, !!user?.profile?.family_name, navigate]);

    const handleApply = async () => {
        if (!slug) return;
        setProcessing(true);
        try {
            await guildApi.applyToGuild(slug);
            localStorage.removeItem('pending_invite');
            
            // Обновляем данные пользователя
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
            
            setStatus('success');
            setTimeout(() => navigate('/dashboard'), 2000);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при подаче заявки.');
            setStatus('error');
        } finally {
            setProcessing(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
                <div className="flex flex-col items-center gap-6">
                    <div className="w-16 h-16 border-4 border-violet-700 border-t-transparent rounded-2xl animate-spin shadow-xl shadow-violet-900/20"></div>
                    <p className="text-xl font-black uppercase italic tracking-widest text-zinc-100">Проверка инвайта...</p>
                </div>
            </div>
        );
    }

    if (status === 'confirm' && inviteInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white p-4 font-sans">
                <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-violet-700"></div>
                    
                    <div className="w-24 h-24 bg-zinc-950 rounded-[2rem] mx-auto mb-6 flex items-center justify-center border border-zinc-800 overflow-hidden">
                        {inviteInfo.logo_url ? (
                            <img src={inviteInfo.logo_url} alt={inviteInfo.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-4xl font-black italic text-violet-500">{inviteInfo.name.charAt(0).toUpperCase()}</span>
                        )}
                    </div>

                    <h1 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter mb-2">{inviteInfo.name}</h1>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8 italic">
                        Участников: <span className="text-zinc-300">{inviteInfo.members_count}</span>
                    </p>

                    <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-10 text-balance">
                        Вы получили приглашение вступить в гильдию. Хотите подать заявку?
                    </p>

                    <div className="space-y-3">
                        <button 
                            onClick={handleApply}
                            disabled={processing}
                            className="w-full bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] italic shadow-xl shadow-violet-900/10"
                        >
                            {processing ? 'Подача заявки...' : 'Вступить в гильдию'}
                        </button>
                        <button 
                            onClick={() => {
                                localStorage.removeItem('pending_invite');
                                navigate('/dashboard');
                            }}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] italic"
                        >
                            На главную
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white p-4 font-sans">
                <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-rose-900/30 shadow-2xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 text-4xl mx-auto mb-6">
                        ⚠️
                    </div>
                    <h1 className="text-2xl font-black text-zinc-100 uppercase italic mb-4 tracking-tight">Ошибка инвайта</h1>
                    <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed max-w-xs mx-auto">{error}</p>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={fetchInviteInfo}
                            className="w-full bg-violet-700 hover:bg-violet-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all shadow-xl shadow-violet-900/20"
                        >
                            Попробовать снова
                        </button>
                        <button 
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] italic transition-all"
                        >
                            На главную
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white p-4 font-sans">
                <div className="bg-zinc-900 p-10 rounded-[2.5rem] border border-emerald-900/30 shadow-2xl max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 text-4xl mx-auto mb-6">
                        ✅
                    </div>
                    <h1 className="text-2xl font-black text-zinc-100 uppercase italic mb-4 tracking-tight">Заявка подана!</h1>
                    <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed">
                        Вы успешно подали заявку в гильдию. Ожидайте решения офицеров.
                    </p>
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full animate-[progress_2s_ease-in-out]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default InviteHandler;
