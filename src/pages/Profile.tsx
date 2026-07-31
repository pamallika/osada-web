import React, { useEffect, useState, useRef, FC } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { GearSection } from '../components/GearSection';
import { ProfileAvatar } from '../components/Profile/ProfileAvatar';
import { toast } from '../components/Toaster';
import { cn } from '../lib/utils';
import { Skeleton } from '../components/ui/Skeleton';

type MainTab = 'account' | 'gear';

const AccountTab: FC<{
    user: any;
    setUser: (user: any) => void;
    accountFormData: any;
    setAccountFormData: React.Dispatch<React.SetStateAction<any>>;
    handleAccountSubmit: (e: React.FormEvent) => Promise<void>;
    accountLoading: boolean;
    accountErrors: Record<string, string[]>;
}> = ({ user, setUser, accountFormData, setAccountFormData, handleAccountSubmit, accountLoading, accountErrors }) => {
    const [familyName, setFamilyName] = useState(user?.profile?.family_name || '');
    const [isEditingFamily, setIsEditingFamily] = useState(false);
    const [isSavingFamily, setIsSavingFamily] = useState(false);
    const familyInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFamilyName(user?.profile?.family_name || '');
    }, [user?.profile?.family_name]);

    const handleSaveFamilyName = async () => {
        setIsEditingFamily(false);
        const trimmed = familyName.trim();
        if (trimmed === (user?.profile?.family_name || '')) return;

        setIsSavingFamily(true);
        try {
            const updatedUser = await authApi.updateProfile({ family_name: trimmed });
            setUser(updatedUser);
            toast.success('Фамилия успешно обновлена');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка при обновлении фамилии');
            setFamilyName(user?.profile?.family_name || '');
        } finally {
            setIsSavingFamily(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Profile Fields Section */}
            <section>
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Персональная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Family Name Field with Inline Editing */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
                            Фамилия в игре (Family Name)
                        </label>
                        <div className="relative flex items-center">
                            <input
                                ref={familyInputRef}
                                type="text"
                                value={familyName}
                                onChange={(e) => setFamilyName(e.target.value)}
                                readOnly={!isEditingFamily}
                                onBlur={handleSaveFamilyName}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSaveFamilyName();
                                    }
                                }}
                                className={cn(
                                    "w-full bg-zinc-900 border rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all pr-10",
                                    isEditingFamily
                                        ? "border-violet-500/80 ring-1 ring-violet-500/30 bg-zinc-900/90"
                                        : "border-white/[0.08] cursor-pointer hover:border-white/[0.15]"
                                )}
                                onClick={() => {
                                    if (!isEditingFamily) {
                                        setIsEditingFamily(true);
                                        setTimeout(() => familyInputRef.current?.focus(), 50);
                                    }
                                }}
                            />
                            <div className="absolute right-3.5 flex items-center gap-1.5 pointer-events-none text-zinc-400">
                                {isSavingFamily ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <button
                                        type="button"
                                        className="pointer-events-auto p-1 hover:text-white transition-colors"
                                        onClick={() => {
                                            setIsEditingFamily(true);
                                            setTimeout(() => familyInputRef.current?.focus(), 50);
                                        }}
                                        title="Редактировать фамилию"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 ml-1">Кликните по полю или иконке карандаша для редактирования</p>
                    </div>

                    {/* Global Nickname (Readonly) */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">
                            Глобальный никнейм (Global Nickname)
                        </label>
                        <input
                            type="text"
                            value={user?.profile?.global_name || ''}
                            readOnly
                            disabled
                            className="w-full bg-zinc-950/60 border border-white/[0.04] rounded-xl px-4 py-3 text-sm text-zinc-400 cursor-not-allowed select-none opacity-80"
                        />
                        <p className="text-[10px] text-zinc-600 ml-1">Нередактируемый параметр системной идентификации</p>
                    </div>
                </div>
            </section>

            {/* Email and Password Settings Form */}
            <section className="pt-8 border-t border-white/[0.06]">
                <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Безопасность аккаунта</h3>
                <form onSubmit={handleAccountSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Электронная почта (Email)</label>
                        <input
                            type="email"
                            value={accountFormData.email}
                            onChange={e => setAccountFormData((p: any) => ({ ...p, email: e.target.value }))}
                            className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                        />
                    </div>

                    <div className="pt-4 border-t border-white/[0.06]">
                        <p className="text-xs text-zinc-500 mb-4">Заполните поля ниже только если хотите изменить пароль</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Новый пароль</label>
                                <input
                                    type="password"
                                    value={accountFormData.password}
                                    onChange={e => setAccountFormData((p: any) => ({ ...p, password: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                                {accountErrors.password && <p className="text-rose-500 text-[10px] mt-1">{accountErrors.password[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Подтверждение пароля</label>
                                <input
                                    type="password"
                                    value={accountFormData.password_confirmation}
                                    onChange={e => setAccountFormData((p: any) => ({ ...p, password_confirmation: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                                {accountErrors.password_confirmation && <p className="text-rose-500 text-[10px] mt-1">{accountErrors.password_confirmation[0]}</p>}
                            </div>
                        </div>
                        {user.has_password && (
                            <div className="mt-4 space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 ml-1">Текущий пароль</label>
                                <input
                                    type="password"
                                    value={accountFormData.current_password}
                                    onChange={e => setAccountFormData((p: any) => ({ ...p, current_password: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-violet-500/50 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={accountLoading}
                            className="w-full md:w-auto bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-zinc-200 hover:text-white px-8 py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 text-center flex items-center justify-center cursor-pointer"
                        >
                            {accountLoading ? 'Обновление...' : 'Обновить настройки аккаунта'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default function Profile() {
    const { user, setUser } = useAuthStore();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState<MainTab>('account');

    const [accountFormData, setAccountFormData] = useState({
        email: user?.email || '',
        current_password: '',
        password: '',
        password_confirmation: ''
    });
    const [accountLoading, setAccountLoading] = useState(false);
    const [accountErrors, setAccountErrors] = useState<Record<string, string[]>>({});

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
        }
    }, [user]);

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
                    </div>
                    <div className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-6 space-y-6">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                        <Skeleton className="h-6 w-32" />
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
                        </div>
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
                {/* Левая колонка: Аватарка + Соцсети (Блок GS удален) */}
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

                    {/* Social Connections */}
                    <div className="mt-6 space-y-3">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Привязанные аккаунты</p>
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
                                                title="Отвязать"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleConnectSocial(provider as any)}
                                            className="p-1 text-zinc-600 hover:text-violet-400 transition-colors"
                                            title="Привязать"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Правая колонка: Две основные вкладки "Аккаунт" и "GEAR SCORE" */}
                <div className="space-y-6">
                    {/* Main Tabs Header */}
                    <div className="inline-flex p-1 bg-zinc-900/40 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1">
                        <button
                            onClick={() => setActiveTab('account')}
                            className={cn(
                                "px-5 py-2.5 rounded-lg text-sm font-bold transition-all transition-colors cursor-pointer",
                                activeTab === 'account'
                                    ? "text-white bg-violet-600/30 border border-violet-500/30 shadow-lg"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Аккаунт
                        </button>
                        <button
                            onClick={() => setActiveTab('gear')}
                            className={cn(
                                "px-5 py-2.5 rounded-lg text-sm font-bold transition-all transition-colors cursor-pointer",
                                activeTab === 'gear'
                                    ? "text-white bg-violet-600/30 border border-violet-500/30 shadow-lg"
                                    : "text-zinc-500 hover:text-zinc-300"
                            )}
                        >
                            Экипировка
                        </button>
                    </div>

                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20">
                        {activeTab === 'account' ? (
                            <AccountTab
                                user={user}
                                setUser={setUser}
                                accountFormData={accountFormData}
                                setAccountFormData={setAccountFormData}
                                handleAccountSubmit={handleAccountSubmit}
                                accountLoading={accountLoading}
                                accountErrors={accountErrors}
                            />
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
