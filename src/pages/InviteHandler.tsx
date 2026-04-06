import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { Skeleton } from '../components/ui/Skeleton';
import { getMediaUrl } from '../lib/utils';

const getInviteErrorMessage = (error: string): string => {
    const messages: Record<string, string> = {
        'You must leave your current guild or cancel your pending application before applying to a new one.':
            'Вы уже состоите в гильдии или имеете активную заявку. Покиньте текущую гильдию перед вступлением в новую.',
        'Guild not found':
            'Гильдия не найдена. Возможно, ссылка устарела или была деактивирована.',
        'Guild is full':
            'В гильдии нет свободных мест. Обратитесь к лидеру гильдии.',
        'Already applied':
            'Вы уже подали заявку в эту гильдию. Ожидайте решения лидера.',
        'Already a member':
            'Вы уже являетесь участником этой гильдии.',
    };
    return messages[error] || 'Произошла ошибка при обработке приглашения. Попробуйте позже.';
};

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

        localStorage.setItem('pending_invite', slug);

        if (!authToken) {
            navigate('/login', { state: { from: `/invite/${slug}` } });
            return;
        }

        if (!user?.profile?.family_name) {
            return;
        }

        fetchInviteInfo();
    }, [slug, authToken, !!user?.profile?.family_name]);

    const handleApply = async () => {
        if (!slug) return;
        setProcessing(true);
        try {
            await guildApi.applyToGuild(slug);
            localStorage.removeItem('pending_invite');
            
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
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/8 blur-[100px] rounded-full pointer-events-none" />
                <div className="relative w-full max-w-sm">
                    <div className="bg-zinc-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 text-center animate-pulse">
                        <div className="flex justify-center mb-5">
                            <Skeleton className="w-20 h-20 rounded-2xl bg-white/5" />
                        </div>
                        <Skeleton className="h-7 w-48 mx-auto mb-2 bg-white/5" />
                        <Skeleton className="h-4 w-32 mx-auto mb-6 bg-white/5" />
                        <Skeleton className="h-4 w-full mx-auto mb-2 bg-white/5 opacity-50" />
                        <Skeleton className="h-4 w-2/3 mx-auto mb-8 bg-white/5 opacity-50" />
                        <Skeleton className="h-12 w-full rounded-xl mb-3 bg-white/5" />
                        <Skeleton className="h-12 w-full rounded-xl bg-white/5 opacity-50" />
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'confirm' && inviteInfo) {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-600/8 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-violet-500/40 to-transparent pointer-events-none" />

                    <div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 text-center shadow-2xl shadow-black/50 overflow-hidden">
                        <div className="flex justify-center mb-5">
                            <div className="w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-xl shadow-black/40 bg-zinc-950 flex items-center justify-center">
                                {inviteInfo.logo_url ? (
                                    <img src={getMediaUrl(inviteInfo.logo_url)} alt={inviteInfo.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-violet-500">{inviteInfo.name.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </div>

                        <h1 className="text-2xl font-bold tracking-tight text-white mb-1">
                            {inviteInfo.name}
                        </h1>

                        <div className="inline-flex items-center gap-1.5 mb-6">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                            <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">
                                {inviteInfo.members_count} участников
                            </span>
                        </div>

                        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                            Вы получили приглашение вступить в гильдию.<br />
                            Хотите подать заявку на вступление?
                        </p>

                        <div className="space-y-3">
                            <button 
                                onClick={handleApply}
                                disabled={processing}
                                className="w-full py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-900 rounded-full animate-spin" />
                                        Подача заявки...
                                    </div>
                                ) : 'Вступить в гильдию'}
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('pending_invite');
                                    navigate('/dashboard');
                                }}
                                className="w-full py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all"
                            >
                                На главную
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        const errorMessage = getInviteErrorMessage(error || '');
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-rose-600/5 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative w-full max-w-sm animate-in fade-in zoom-in-95 duration-300">
                    <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-rose-500/30 to-transparent pointer-events-none" />

                    <div className="relative bg-zinc-900/80 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 text-center shadow-2xl shadow-black/50">
                        <div className="flex justify-center mb-5">
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                                <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                        </div>

                        <h1 className="text-xl font-bold tracking-tight text-white mb-3">
                            Ошибка приглашения
                        </h1>

                        <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                            {errorMessage}
                        </p>

                        <div className="space-y-3">
                            <button 
                                onClick={fetchInviteInfo}
                                className="w-full py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98]"
                            >
                                Попробовать снова
                            </button>
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('pending_invite');
                                    navigate('/dashboard');
                                }}
                                className="w-full py-3 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/[0.08] text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-all"
                            >
                                На главную
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden text-zinc-200">
                <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="bg-zinc-900/80 backdrop-blur-2xl p-10 rounded-3xl border border-emerald-900/30 shadow-2xl max-w-sm w-full text-center relative z-10 animate-in fade-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white mb-3">Заявка подана!</h1>
                    <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                        Вы успешно подали заявку в гильдию. Ожидайте решения офицеров.
                    </p>
                    <div className="w-full bg-zinc-950/60 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div className="bg-emerald-500 h-full animate-[progress_2s_ease-in-out]"></div>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default InviteHandler;
