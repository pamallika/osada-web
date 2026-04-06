import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProfile } from '../hooks/useProfile';
import { authApi } from '../api/auth';
import { GearSection } from '../components/GearSection';
import { ProfileAvatar } from '../components/Profile/ProfileAvatar';
import { toast } from '../components/Toaster';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/Skeleton';

const CLASSES = [
    'Warrior', 'Ranger', 'Sorceress', 'Berserker', 'Tamer', 'Musa', 'Maehwa', 'Valkyrie',
    'Kunoichi', 'Ninja', 'Wizard', 'Witch', 'Dark Knight', 'Striker', 'Mystic', 'Lahn',
    'Archer', 'Shai', 'Guardian', 'Hashashin', 'Nova', 'Sage', 'Corsair', 'Drakania',
    'Woosa', 'Maegu', 'Scholar', 'Dosa'
];

type Tab = 'settings' | 'gear';

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<Tab>('settings');

    const [accountFormData, setAccountFormData] = useState({
        email: user?.email || '',
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [accountLoading, setAccountLoading] = useState(false);
    const [accountErrors, setAccountErrors] = useState<Record<string, string[]>>({});

    const {
        formData,
        setFormData,
        isLoading,
        gearScore,
        handleChange,
        updateProfile,
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
            if (linked === 'success') {
                toast.success('Аккаунт успешно привязан');
                authApi.getMe().then(setUser).catch(console.error);
            } else if (errorParam === 'already_linked') {
                toast.error('Этот аккаунт уже привязан к другому профилю');
            } else if (errorParam) {
                toast.error('Ошибка при привязке аккаунта');
            }
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [searchParams, setUser]);

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

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await updateProfile();
    };

    const handleAccountSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccountLoading(true);
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
            toast.success('Данные аккаунта обновлены');
            setAccountFormData(prev => ({ ...prev, current_password: '', password: '', password_confirmation: '' }));
        } catch (err: any) {
            if (err.response?.data?.errors) {
                setAccountErrors(err.response.data.errors);
            } else {
                toast.error(err.response?.data?.message || 'Ошибка при обновлении аккаунта');
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
            toast.success('Аккаунт отвязан');
        } catch (err: any) {
            const msg: string = err.response?.data?.message || '';
            if (msg.toLowerCase().includes('cannot unlink the last')) {
                toast.error('Нельзя отвязать последний способ входа. Сначала установите пароль или привяжите другой аккаунт.');
            } else {
                toast.error(msg || 'Не удалось отвязать аккаунт');
            }
        }
    };

    const handleConnectSocial = async (provider: 'discord' | 'telegram') => {
        try {
            if (provider === 'telegram') {
                const { link } = await authApi.getTelegramLink();
                window.open(link, '_blank');
            } else {
                const { link_code } = await authApi.initSocialLink('discord');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
                window.location.href = `${API_URL}/auth/redirect/discord?link_code=${link_code}`;
            }
        } catch (err) {
            toast.error('Ошибка при инициализации привязки');
        }
    };

    if (!user) {
        return (
            <div className="max-w-5xl mx-auto p-6 md:p-10">
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
                    <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 space-y-4">
                        <Skeleton className="w-full aspect-square rounded-xl" />
                        <Skeleton className="h-6 w-3/4 mx-auto" />
                        <Skeleton className="h-4 w-1/2 mx-auto" />
                        <Skeleton className="h-28 w-full rounded-xl" />
                        <Skeleton className="h-12 w-full rounded-xl" />
                    </div>
                    <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 space-y-6">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                        </div>
                        <Skeleton className="h-10 w-36 rounded-xl" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 select-none animate-in fade-in duration-500">
            <div className="mb-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-600 mb-1">Личный кабинет</p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Профиль</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 items-start">
                {/* Left Sidebar */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 shadow-xl shadow-black/20">
                    <ProfileAvatar />
                    
                    <div className="mt-4 text-center">
                        <h2 className="text-lg font-bold tracking-tight text-white">
                            {user.profile?.family_name || 'Участник'}
                        </h2>
                        {user.profile?.global_name && (
                            <p className="text-xs text-zinc-500 mt-0.5">
                                @{user.profile.global_name}
                            </p>
                        )}
                    </div>

                    {/* Gear Score Card */}
                    <div className="mt-6 bg-zinc-950/60 border border-white/[0.06] rounded-xl p-4 shadow-inner">
                        <div className="text-center mb-4">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 mb-1">Gear Score</p>
                            <p className="text-4xl font-semibold tracking-tight text-white tabular-nums">{gearScore}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'AP', value: user.profile?.attack || 0 },
                                { label: 'AAP', value: user.profile?.awakening_attack || 0 },
                                { label: 'DP', value: user.profile?.defense || 0 }
                            ].map(stat => (
                                <div key={stat.label} className="bg-zinc-900/60 border border-white/[0.06] rounded-lg py-2 text-center">
                                    <p className="text-[9px] text-zinc-600 uppercase tracking-wider mb-0.5">{stat.label}</p>
                                    <p className="text-sm font-semibold text-zinc-200 tabular-nums">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Connections */}
                    <div className="mt-6 space-y-3">
                        {['discord', 'telegram'].map(provider => {
                            const linked = user.linked_accounts?.find(acc => acc.provider === provider);
                            const isDiscord = provider === 'discord';
                            
                            return (
                                <div key={provider} className="flex items-center gap-3 p-3 bg-zinc-950/40 border border-white/[0.06] rounded-xl group/item">
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border transition-colors",
                                        linked 
                                            ? isDiscord 
                                                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
                                                : "bg-sky-500/10 border-sky-500/20 text-sky-400"
                                            : "bg-zinc-900 border-white/[0.04] text-zinc-600"
                                    )}>
                                        <span className="text-xs font-bold uppercase">{provider[0]}</span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-zinc-300 truncate">
                                            {linked?.display_name || linked?.username || (isDiscord ? 'Discord' : 'Telegram')}
                                        </p>
                                        <p className="text-[10px] text-zinc-600">{linked ? 'Подключено' : 'Не привязано'}</p>
                                    </div>
                                    {linked ? (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)] flex-shrink-0" />
                                            <button 
                                                onClick={() => handleUnlink(provider)} 
                                                className="opacity-0 group-hover/item:opacity-100 p-1 text-zinc-600 hover:text-rose-500 transition-all"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => handleConnectSocial(provider as any)} 
                                            className="p-1 text-zinc-600 hover:text-violet-400 transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="space-y-6">
                    {/* Tabs */}
                    <div className="inline-flex p-1 bg-zinc-900/40 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={cn(
                                "px-5 py-2 rounded-lg text-sm font-medium transition-all transition-colors",
                                activeTab === 'settings' 
                                    ? "text-white bg-white/10 ring-1 ring-white/10 shadow-lg" 
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Настройки
                        </button>
                        <button
                            onClick={() => setActiveTab('gear')}
                            className={cn(
                                "px-5 py-2 rounded-lg text-sm font-medium transition-all transition-colors",
                                activeTab === 'gear' 
                                    ? "text-white bg-white/10 ring-1 ring-white/10 shadow-lg" 
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Верификация гира
                        </button>
                    </div>

                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20">
                        {activeTab === 'settings' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Character Form */}
                                <section>
                                    <h3 className="text-lg font-semibold text-white mb-6 tracking-tight">Персонаж</h3>
                                    <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Фамилия</label>
                                            <input type="text" name="family_name" value={formData.family_name || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Глобальный ник</label>
                                            <input type="text" name="global_name" value={formData.global_name || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                                        </div>
                                        <div className="space-y-1.5 overflow-hidden">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Класс</label>
                                            <select name="char_class" value={formData.char_class || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer">
                                                <option value="" className="bg-zinc-900">Выберите класс</option>
                                                {CLASSES.map(c => <option key={c} value={c} className="bg-zinc-900">{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                                            {[
                                                { label: 'AP', name: 'attack' },
                                                { label: 'AAP', name: 'awakening_attack' },
                                                { label: 'DP', name: 'defense' }
                                            ].map(stat => (
                                                <div key={stat.name} className="space-y-1.5">
                                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1 block text-center">{stat.label}</label>
                                                    <input type="number" name={stat.name} value={(formData as any)[stat.name] || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 text-center focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="md:col-span-2 pt-4">
                                            <button type="submit" disabled={isLoading} className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-2.5 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50">
                                                {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                                            </button>
                                        </div>
                                    </form>
                                </section>

                                {/* Account Form */}
                                <section className="pt-8 border-t border-white/[0.06]">
                                    <h3 className="text-lg font-semibold text-white mb-6 tracking-tight">Аккаунт</h3>
                                    <form onSubmit={handleAccountSubmit} className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Email</label>
                                            <input type="email" value={accountFormData.email} onChange={e => setAccountFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                                        </div>
                                        
                                        <div className="pt-4 border-t border-white/[0.06]">
                                            <p className="text-xs text-zinc-600 mb-4">Оставьте поля пустыми, если не хотите менять пароль</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Новый пароль</label>
                                                    <input type="password" value={accountFormData.password} onChange={e => setAccountFormData(p => ({ ...p, password: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" placeholder="••••••••" />
                                                    {accountErrors.password && <p className="text-rose-500 text-[10px] mt-1">{accountErrors.password[0]}</p>}
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Подтверждение</label>
                                                    <input type="password" value={accountFormData.password_confirmation} onChange={e => setAccountFormData(p => ({ ...p, password_confirmation: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" placeholder="••••••••" />
                                                    {accountErrors.password_confirmation && <p className="text-rose-500 text-[10px] mt-1">{accountErrors.password_confirmation[0]}</p>}
                                                </div>
                                            </div>
                                            {user.has_password && (
                                                <div className="mt-4 space-y-1.5">
                                                    <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Текущий пароль (для подтверждения)</label>
                                                    <input type="password" value={accountFormData.current_password} onChange={e => setAccountFormData(p => ({ ...p, current_password: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" placeholder="••••••••" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-2">
                                            <button type="submit" disabled={accountLoading} className="bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50">
                                                {accountLoading ? 'Обновление...' : 'Обновить настройки'}
                                            </button>
                                        </div>
                                    </form>
                                </section>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                                <GearSection />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
