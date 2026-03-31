import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useProfile } from '../hooks/useProfile';
import { authApi } from '../api/auth';
import { GearSection } from '../components/GearSection';
import { ProfileAvatar } from '../components/Profile/ProfileAvatar';
import { toast } from '../components/Toaster';

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
        error,
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
            toast.error(err.response?.data?.message || 'Не удалось отвязать аккаунт');
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

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 select-none animate-in fade-in duration-500">
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1.5 h-1.5 bg-violet-700 rounded-full"></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Личный кабинет</span>
                </div>
                <h1 className="text-5xl font-black text-zinc-100 tracking-tighter italic uppercase">Профиль</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Левая колонка: Статичная информация (4/12) */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-zinc-900 p-8 rounded-[2.5rem] border border-zinc-800/50 text-center relative overflow-hidden group shadow-2xl shadow-black/20">
                        <ProfileAvatar />
                        
                        <div className="mt-8 space-y-1">
                            <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">
                                {user?.profile?.family_name || 'Участник'}
                            </h2>
                            {user?.profile?.global_name && (
                                <p className="text-violet-500 text-[10px] font-black uppercase tracking-[0.2em]">
                                    @{user.profile.global_name}
                                </p>
                            )}
                        </div>

                        {/* Gear Score Badge */}
                        <div className="mt-8 bg-violet-700 p-6 rounded-3xl text-white shadow-xl shadow-violet-900/10 relative overflow-hidden group/gs">
                            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover/gs:scale-125 transition-transform duration-700"></div>
                            <span className="text-violet-200 text-[8px] font-black uppercase tracking-[0.2em] italic">Total GS</span>
                            <div className="text-4xl font-black italic tracking-tighter mt-1">{gearScore}</div>
                            
                            <div className="mt-6 grid grid-cols-3 gap-2">
                                <div className="bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/5">
                                    <div className="text-violet-200 text-[7px] font-black uppercase mb-1">AP</div>
                                    <div className="font-black text-xs italic">{user?.profile?.attack || 0}</div>
                                </div>
                                <div className="bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/5">
                                    <div className="text-violet-200 text-[7px] font-black uppercase mb-1">AAP</div>
                                    <div className="font-black text-xs italic">{user?.profile?.awakening_attack || 0}</div>
                                </div>
                                <div className="bg-black/20 backdrop-blur-md p-2 rounded-xl border border-white/5">
                                    <div className="text-violet-200 text-[7px] font-black uppercase mb-1">DP</div>
                                    <div className="font-black text-xs italic">{user?.profile?.defense || 0}</div>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="mt-10 pt-10 border-t border-zinc-800/50 text-left">
                            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-6 italic">Привязки</h3>
                            <div className="space-y-3">
                                {['discord', 'telegram'].map(provider => {
                                    const linked = user?.linked_accounts?.find(acc => acc.provider === provider);
                                    const isDiscord = provider === 'discord';
                                    
                                    return (
                                        <div key={provider} className="flex items-center gap-3 p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 group/item">
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-xl border ${
                                                linked 
                                                    ? isDiscord ? 'bg-[#5865F2]/10 border-[#5865F2]/20 text-[#5865F2]' : 'bg-[#229ED9]/10 border-[#229ED9]/20 text-[#229ED9]'
                                                    : 'bg-zinc-900 border-zinc-800 text-zinc-700'
                                            }`}>
                                                {linked?.avatar ? (
                                                    <img src={linked.avatar} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : isDiscord ? (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 0-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/></svg>
                                                ) : (
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944 6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.832 8.328l-2.016 9.48c-.144.648-.528.816-1.08.48l-3.048-2.256-1.464 1.416c-.168.168-.312.312-.648.312l.216-3.12 5.664-5.112c.24-.216-.048-.336-.384-.12l-7 4.416-3.024-.936c-.648-.216-.672-.648.144-.96l11.856-4.56c.552-.216 1.032.12.84 1.272z"/></svg>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] font-black text-zinc-100 uppercase italic tracking-tight">{linked?.display_name || linked?.username || (isDiscord ? 'Discord' : 'Telegram')}</div>
                                                <div className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{linked ? 'Подключено' : 'Не привязано'}</div>
                                            </div>
                                            {linked ? (
                                                <button onClick={() => handleUnlink(provider)} className="p-2 text-zinc-700 hover:text-rose-500 transition-colors opacity-0 group-hover/item:opacity-100">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            ) : (
                                                <button onClick={() => handleConnectSocial(provider as any)} className="p-2 text-zinc-700 hover:text-violet-500 transition-colors">
                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Правая колонка: Динамический контент (8/12) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Tabs Navigation */}
                    <div className="flex p-1 bg-zinc-900 border border-zinc-800/50 rounded-2xl w-fit">
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${activeTab === 'settings' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            Настройки
                        </button>
                        <button
                            onClick={() => setActiveTab('gear')}
                            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${activeTab === 'gear' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                        >
                            Экипировка
                        </button>
                    </div>

                    <div className="bg-zinc-900 p-8 md:p-12 rounded-[2.5rem] border border-zinc-800/50 shadow-2xl shadow-black/20 flex-1">
                        {activeTab === 'settings' ? (
                            <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                                {/* Character Section */}
                                <section>
                                    <h3 className="text-2xl font-black text-zinc-100 mb-8 uppercase italic tracking-tight">Персонаж</h3>
                                    <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Фамилия</label>
                                            <input type="text" name="family_name" value={formData.family_name || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Глобальный ник</label>
                                            <input type="text" name="global_name" value={formData.global_name || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Класс</label>
                                            <select name="char_class" value={formData.char_class || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700 transition-all appearance-none cursor-pointer">
                                                <option value="">Выберите класс</option>
                                                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800/50">
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block ml-1 text-center">AP</label>
                                                <input type="number" name="attack" value={formData.attack || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center text-zinc-100 font-bold outline-none focus:border-violet-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block ml-1 text-center">AAP</label>
                                                <input type="number" name="awakening_attack" value={formData.awakening_attack || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center text-zinc-100 font-bold outline-none focus:border-violet-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block ml-1 text-center">DP</label>
                                                <input type="number" name="defense" value={formData.defense || ''} onChange={handleChange} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-center text-zinc-100 font-bold outline-none focus:border-violet-700" />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 mt-4">
                                            <button type="submit" disabled={isLoading} className="w-full py-4 bg-violet-700 hover:bg-violet-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] italic transition-all disabled:opacity-50">
                                                {isLoading ? 'Сохранение...' : 'Обновить персонажа'}
                                            </button>
                                        </div>
                                    </form>
                                </section>

                                {/* Account Section */}
                                <section className="pt-12 border-t border-zinc-800/50">
                                    <h3 className="text-2xl font-black text-zinc-100 mb-8 uppercase italic tracking-tight">Аккаунт</h3>
                                    <form onSubmit={handleAccountSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Email</label>
                                            <input type="email" value={accountFormData.email} onChange={e => setAccountFormData(p => ({ ...p, email: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Новый пароль</label>
                                                <input type="password" value={accountFormData.password} onChange={e => setAccountFormData(p => ({ ...p, password: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700" placeholder="••••••••" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Подтверждение</label>
                                                <input type="password" value={accountFormData.password_confirmation} onChange={e => setAccountFormData(p => ({ ...p, password_confirmation: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700" placeholder="••••••••" />
                                            </div>
                                        </div>
                                        {user?.has_password && (
                                            <div className="space-y-2 pt-4">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block ml-1">Текущий пароль (для подтверждения)</label>
                                                <input type="password" value={accountFormData.current_password} onChange={e => setAccountFormData(p => ({ ...p, current_password: e.target.value }))} className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-100 font-bold outline-none focus:border-violet-700" placeholder="••••••••" />
                                            </div>
                                        )}
                                        <button type="submit" disabled={accountLoading} className="w-full py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-xl uppercase tracking-widest text-[10px] italic transition-all disabled:opacity-50">
                                            {accountLoading ? 'Обновление...' : 'Обновить настройки'}
                                        </button>
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
