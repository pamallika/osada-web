import React, { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProfile } from '../hooks/useProfile';
import { authApi } from '../api/auth';

const CLASSES = [
    'Warrior', 'Ranger', 'Sorceress', 'Berserker', 'Tamer', 'Musa', 'Maehwa', 'Valkyrie',
    'Kunoichi', 'Ninja', 'Wizard', 'Witch', 'Dark Knight', 'Striker', 'Mystic', 'Lahn',
    'Archer', 'Shai', 'Guardian', 'Hashashin', 'Nova', 'Sage', 'Corsair', 'Drakania',
    'Woosa', 'Maegu', 'Scholar', 'Dosa'
];

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const location = useLocation() as any;
    const [searchParams] = useSearchParams();
    
    const [accountFormData, setAccountFormData] = React.useState({
        email: user?.email || '',
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [accountLoading, setAccountLoading] = React.useState(false);
    const [accountErrors, setAccountErrors] = React.useState<Record<string, string[]>>({});
    
    const { 
        formData, 
        setFormData, 
        isLoading, 
        error, 
        success, 
        gearScore, 
        handleChange, 
        updateProfile,
        setError,
        setSuccess
    } = useProfile({
        family_name: user?.profile?.family_name || '',
        global_name: user?.profile?.global_name || '',
        char_class: user?.profile?.char_class || '',
        attack: user?.profile?.attack || 0,
        awakening_attack: user?.profile?.awakening_attack || 0,
        defense: user?.profile?.defense || 0,
    });

    useEffect(() => {
        const linked = searchParams.get('linked');
        const errorParam = searchParams.get('error');

        if (linked === 'success' || errorParam) {
            const handleParams = async () => {
                if (linked === 'success') {
                    setSuccess('Аккаунт успешно привязан');
                    try {
                        const userData = await authApi.getMe();
                        setUser(userData);
                    } catch (e) {
                        console.error('Failed to refresh user data:', e);
                    }
                } else if (errorParam === 'already_linked') {
                    setError('Этот аккаунт уже привязан к другому профилю');
                } else if (errorParam) {
                    setError('Ошибка при привязке аккаунта');
                }

                // Clear query params from URL
                window.history.replaceState({}, document.title, window.location.pathname);
            };
            handleParams();
        }
    }, [searchParams, setUser, setSuccess, setError]);

    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
            // Clear state after reading it to avoid re-showing on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state, setError]);

    useEffect(() => {
        if (user) {
            setAccountFormData(prev => ({ ...prev, email: user.email || '' }));
            if (user.profile) {
                setFormData({
                    family_name: user.profile.family_name || '',
                    global_name: user.profile.global_name || '',
                    char_class: user.profile.char_class || '',
                    attack: user.profile.attack ?? 0,
                    awakening_attack: user.profile.awakening_attack ?? 0,
                    defense: user.profile.defense ?? 0,
                });
            }
        }
    }, [user, setFormData]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        if (e.target.value === '0') {
            const name = e.target.name;
            setFormData(prev => ({ ...prev, [name]: '' as any }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile();
    };

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccountLoading(true);
        setError(null);
        setSuccess(null);
        setAccountErrors({});

        if (accountFormData.password && accountFormData.password !== accountFormData.password_confirmation) {
            setAccountErrors({ password_confirmation: ['Пароли не совпадают'] });
            setAccountLoading(false);
            return;
        }

        try {
            const updatedUser = await authApi.updateAccount({
                email: accountFormData.email,
                current_password: accountFormData.current_password || undefined,
                password: accountFormData.password || undefined,
                password_confirmation: accountFormData.password_confirmation || undefined
            });
            setUser(updatedUser);
            setSuccess('Данные аккаунта обновлены');
            setAccountFormData(prev => ({ 
                ...prev, 
                current_password: '',
                password: '', 
                password_confirmation: '' 
            }));
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setAccountErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Ошибка при обновлении аккаунта');
            }
        } finally {
            setAccountLoading(false);
        }
    };

    const handleUnlink = async (provider: string) => {
        if (!confirm(`Вы уверены, что хотите отвязать ${provider}?`)) return;

        try {
            const updatedUser = await authApi.unlinkAccount(provider);
            setUser(updatedUser);
            setSuccess('Аккаунт отвязан');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Не удалось отвязать аккаунт');
        }
    };

    const handleConnectTelegram = async () => {
        try {
            const { link } = await authApi.getTelegramLink();
            window.open(link, '_blank');
        } catch (error) {
            console.error('Failed to get telegram link:', error);
        }
    };

    const handleConnectDiscord = async () => {
        try {
            const { link_code } = await authApi.initSocialLink('discord');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
            window.location.href = `${API_URL}/auth/redirect/discord?link_code=${link_code}`;
        } catch (err) {
            console.error('Failed to init discord link:', err);
            setError('Ошибка при инициализации привязки Discord');
        }
    };

    const isTelegramLinked = user?.linked_accounts?.some(acc => acc.provider === 'telegram');
    const isDiscordLinked = user?.linked_accounts?.some(acc => acc.provider === 'discord');

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 font-sans select-none animate-in fade-in duration-500">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 bg-violet-700 rounded-full"></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Личные настройки</span>
                </div>
                <h1 className="text-5xl font-black text-zinc-100 tracking-tighter italic uppercase">Профиль</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1">Характеристики персонажа и данные аккаунта</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Левая колонка: Основная инфо */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 text-center relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <span className="text-6xl font-black italic uppercase tracking-tighter text-zinc-100">USER</span>
                        </div>
                        <div className="w-24 h-24 bg-violet-700/10 rounded-[2rem] mx-auto mb-6 flex items-center justify-center text-violet-400 overflow-hidden border border-violet-700/30 relative group-hover:scale-105 transition-transform">
                            {user?.linked_accounts?.find(acc => acc.avatar)?.avatar ? (
                                <img 
                                    src={user.linked_accounts.find(acc => acc.avatar)?.avatar || ''} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <span className="text-4xl font-black uppercase italic">
                                    {(user?.profile?.family_name || user?.profile?.global_name || 'U').charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-black text-zinc-100 uppercase italic tracking-tight">
                            {user?.profile?.family_name || user?.profile?.global_name || 'Участник'}
                        </h2>
                        {user?.profile?.global_name && (
                            <p className="text-violet-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">
                                @{user.profile.global_name}
                            </p>
                        )}
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">{user?.email}</p>

                        <div className="pt-8 mt-8 border-t border-zinc-800/50 text-left">
                            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4 italic">Связанные аккаунты</h3>
                            <div className="space-y-3">
                                {user?.linked_accounts?.map(acc => {
                                    const isDiscord = acc.provider === 'discord';
                                    const isTelegram = acc.provider === 'telegram';
                                    
                                    return (
                                        <div key={acc.provider_id} className="flex items-center gap-3 p-4 bg-zinc-950/50 rounded-xl border border-zinc-800/50 group/item">
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg border overflow-hidden ${
                                                acc.avatar 
                                                    ? 'border-zinc-800' 
                                                    : isDiscord 
                                                        ? 'bg-[#5865F2]/10 border-[#5865F2]/20 text-[#5865F2]'
                                                        : isTelegram
                                                            ? 'bg-[#229ED9]/10 border-[#229ED9]/20 text-[#229ED9]'
                                                            : 'bg-violet-700/10 border-violet-700/20 text-violet-400'
                                            }`}>
                                                {acc.avatar ? (
                                                    <img src={acc.avatar} alt={acc.provider} className="w-full h-full object-cover" />
                                                ) : isDiscord ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                                                    </svg>
                                                ) : isTelegram ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944 6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.832 8.328l-2.016 9.48c-.144.648-.528.816-1.08.48l-3.048-2.256-1.464 1.416c-.168.168-.312.312-.648.312l.216-3.12 5.664-5.112c.24-.216-.048-.336-.384-.12l-7 4.416-3.024-.936c-.648-.216-.672-.648.144-.96l11.856-4.56c.552-.216 1.032.12.84 1.272z"/>
                                                    </svg>
                                                ) : (
                                                    <span className="uppercase text-[10px] font-black">{acc.provider.substring(0, 2)}</span>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">{acc.provider}</div>
                                                <div className="text-xs font-black text-zinc-100 truncate uppercase italic tracking-tight">
                                                    {acc.display_name || acc.username}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleUnlink(acc.provider)}
                                                className="p-2 text-zinc-600 hover:text-rose-500 transition-colors opacity-0 group-hover/item:opacity-100"
                                                title="Отвязать аккаунт"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    );
                                })}

                                {!user?.has_password && (
                                    <div className="p-3 bg-amber-900/10 border border-amber-800/30 rounded-xl mt-4">
                                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider leading-relaxed italic">
                                            ⚠️ Установите пароль, чтобы иметь возможность отвязать социальные сети
                                        </p>
                                    </div>
                                )}

                                {!isTelegramLinked && (
                                    <button 
                                        onClick={handleConnectTelegram}
                                        className="w-full flex items-center gap-3 p-4 bg-[#229ED9]/5 hover:bg-[#229ED9]/10 rounded-xl border border-[#229ED9]/20 transition-all group mt-3"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center bg-[#229ED9]/10 border border-[#229ED9]/20 rounded-lg text-[#229ED9]">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944 6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.832 8.328l-2.016 9.48c-.144.648-.528.816-1.08.48l-3.048-2.256-1.464 1.416c-.168.168-.312.312-.648.312l.216-3.12 5.664-5.112c.24-.216-.048-.336-.384-.12l-7 4.416-3.024-.936c-.648-.216-.672-.648.144-.96l11.856-4.56c.552-.216 1.032.12.84 1.272z"/>
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Telegram</div>
                                            <div className="text-xs font-black text-[#229ED9] uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">Привязать аккаунт</div>
                                        </div>
                                    </button>
                                )}

                                {!isDiscordLinked && (
                                    <button 
                                        onClick={handleConnectDiscord}
                                        className="w-full flex items-center gap-3 p-4 bg-[#5865F2]/5 hover:bg-[#5865F2]/10 rounded-xl border border-[#5865F2]/20 transition-all group mt-3"
                                    >
                                        <div className="w-10 h-10 flex items-center justify-center bg-[#5865F2]/10 border border-[#5865F2]/20 rounded-lg text-[#5865F2]">
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none mb-1">Discord</div>
                                            <div className="text-xs font-black text-[#5865F2] uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">Привязать аккаунт</div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-violet-700 p-8 rounded-[2rem] text-white shadow-xl shadow-violet-900/10 relative overflow-hidden group">
                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
                        <span className="text-violet-200 text-[10px] font-black uppercase tracking-[0.2em] relative z-10 italic">Total Gear Score</span>
                        <div className="text-5xl font-black mt-2 italic tracking-tighter relative z-10">{gearScore}</div>
                        <div className="mt-8 grid grid-cols-3 gap-3 relative z-10">
                            <div className="bg-zinc-950/20 backdrop-blur-md p-3 rounded-xl border border-white/5 text-center">
                                <div className="text-violet-200 text-[8px] font-black uppercase tracking-widest mb-1">AP</div>
                                <div className="font-black text-sm italic">{formData.attack ?? 0}</div>
                            </div>
                            <div className="bg-zinc-950/20 backdrop-blur-md p-3 rounded-xl border border-white/5 text-center">
                                <div className="text-violet-200 text-[8px] font-black uppercase tracking-widest mb-1">AAP</div>
                                <div className="font-black text-sm italic">{formData.awakening_attack ?? 0}</div>
                            </div>
                            <div className="bg-zinc-950/20 backdrop-blur-md p-3 rounded-xl border border-white/5 text-center">
                                <div className="text-violet-200 text-[8px] font-black uppercase tracking-widest mb-1">DP</div>
                                <div className="font-black text-sm italic">{formData.defense ?? 0}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая колонка: Форма */}
                <div className="lg:col-span-2">
                    <div className="bg-zinc-900 p-8 md:p-10 rounded-[2rem] border border-zinc-800/50 h-full">
                        <h2 className="text-2xl font-black text-zinc-100 mb-8 uppercase italic tracking-tight">Игровой Персонаж</h2>

                        {success && (
                            <div className="p-4 rounded-xl mb-8 flex items-center gap-3 font-black text-[10px] uppercase tracking-wider bg-emerald-900/20 text-emerald-400 border border-emerald-800/30">
                                <span className="text-base">✅</span>
                                {success}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 rounded-xl mb-8 flex items-center gap-3 font-black text-[10px] uppercase tracking-wider bg-rose-900/20 text-rose-400 border border-rose-800/30">
                                <span className="text-base">⚠️</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Фамилия в игре</label>
                                    <input
                                        type="text"
                                        name="family_name"
                                        value={formData.family_name || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-700"
                                        placeholder="Guts"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Глобальный никнейм</label>
                                    <input
                                        type="text"
                                        name="global_name"
                                        value={formData.global_name || ''}
                                        onChange={handleChange}
                                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-700"
                                        placeholder="Guts_Global"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-zinc-800/50">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Класс</label>
                                    <div className="relative">
                                        <select
                                            name="char_class"
                                            value={formData.char_class || ''}
                                            onChange={handleChange}
                                            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="">Выберите класс</option>
                                            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 border-t border-zinc-800/50">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Атака (AP)</label>
                                    <input
                                        type="number"
                                        name="attack"
                                        value={(formData.attack || 0) === 0 ? '' : (formData.attack ?? '')}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        placeholder="0"
                                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Пробужд. AP</label>
                                    <input
                                        type="number"
                                        name="awakening_attack"
                                        value={(formData.awakening_attack || 0) === 0 ? '' : (formData.awakening_attack ?? '')}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        placeholder="0"
                                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Защита (DP)</label>
                                    <input
                                        type="number"
                                        name="defense"
                                        value={(formData.defense || 0) === 0 ? '' : (formData.defense ?? '')}
                                        onChange={handleChange}
                                        onFocus={handleFocus}
                                        placeholder="0"
                                        className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-10">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-violet-700 hover:bg-violet-600 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-violet-900/10 disabled:opacity-50 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : 'Сохранить изменения'}
                                </button>
                            </div>
                        </form>

                        {/* Account Settings Section */}
                        <div className="mt-16 pt-10 border-t border-zinc-800/50">
                            <h2 className="text-2xl font-black text-zinc-100 mb-8 uppercase italic tracking-tight">Настройки аккаунта</h2>
                            
                            <form onSubmit={handleAccountSubmit} className="space-y-8">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email</label>
                                    <input
                                        type="email"
                                        value={accountFormData.email}
                                        onChange={(e) => setAccountFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className={`w-full p-4 bg-zinc-950 border ${accountErrors.email ? 'border-rose-800' : 'border-zinc-800'} rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-700`}
                                        placeholder="your@email.com"
                                        required
                                    />
                                    {accountErrors.email?.map((err, i) => (
                                        <p key={i} className="text-[10px] font-black text-rose-500 uppercase tracking-wider ml-1">{err}</p>
                                    ))}
                                </div>

                                {user?.has_password && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Текущий пароль</label>
                                        <input
                                            type="password"
                                            value={accountFormData.current_password}
                                            onChange={(e) => setAccountFormData(prev => ({ ...prev, current_password: e.target.value }))}
                                            className={`w-full p-4 bg-zinc-950 border ${accountErrors.current_password ? 'border-rose-800' : 'border-zinc-800'} rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-700`}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                        />
                                        {accountErrors.current_password?.map((err, i) => (
                                            <p key={i} className="text-[10px] font-black text-rose-500 uppercase tracking-wider ml-1">{err}</p>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Новый пароль</label>
                                            <input
                                                type="password"
                                                value={accountFormData.password}
                                                onChange={(e) => setAccountFormData(prev => ({ ...prev, password: e.target.value }))}
                                                className={`w-full p-4 bg-zinc-950 border ${accountErrors.password ? 'border-rose-800' : 'border-zinc-800'} rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-700`}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                            />
                                            {accountErrors.password?.map((err, i) => (
                                                <p key={i} className="text-[10px] font-black text-rose-500 uppercase tracking-wider ml-1">{err}</p>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Подтверждение</label>
                                            <input
                                                type="password"
                                                value={accountFormData.password_confirmation}
                                                onChange={(e) => setAccountFormData(prev => ({ ...prev, password_confirmation: e.target.value }))}
                                                className={`w-full p-4 bg-zinc-950 border ${accountErrors.password_confirmation ? 'border-rose-800' : 'border-zinc-800'} rounded-xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-700`}
                                                placeholder="••••••••"
                                                autoComplete="new-password"
                                            />
                                            {accountErrors.password_confirmation?.map((err, i) => (
                                                <p key={i} className="text-[10px] font-black text-rose-500 uppercase tracking-wider ml-1">{err}</p>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="p-4 bg-zinc-950/50 border border-zinc-800 rounded-xl">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.1em] leading-relaxed">
                                            <span className="text-violet-500">Требования к паролю:</span><br />
                                            • Минимум 8 символов<br />
                                            • Хотя бы одна заглавная буква<br />
                                            • Хотя бы одна цифра<br />
                                            • Хотя бы один спецсимвол
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={accountLoading}
                                        className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-black py-4 rounded-xl transition-all disabled:opacity-50 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                                    >
                                        {accountLoading ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        ) : 'Обновить аккаунт'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
