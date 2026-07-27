import React, { useState, useRef } from 'react';
import { useGear } from '../hooks/useGear';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { toast } from './Toaster';
import { cn } from '../lib/utils';
import { Modal } from './ui/Modal';

const GEAR_BLOCKS = [
    { label: 'crystal', title: 'Инкрустация', example: '/images/crystal.png' },
    { label: 'relic', title: 'Реликвии', example: '/images/relic.png' },
    { label: 'zakalk', title: 'Закалка', example: '/images/zakalk.png' },
    { label: 'gear', title: 'Гир', example: '/images/gear.png' }
];

const GARMOTH_URL_REGEX = /^https:\/\/(www\.)?garmoth\.com\/character\/[a-zA-Z0-9_-]+/;

export const GearSection = () => {
    const { user, setUser } = useAuthStore();
    const { 
        media, 
        isUploading, 
        uploadMedia, 
        deleteMedia, 
        submitForVerification 
    } = useGear();

    const currentGearSource = user?.profile?.gear_source || 'manual';
    const [gearSource, setGearSource] = useState<'manual' | 'garmoth'>(currentGearSource);
    const [garmothUrl, setGarmothUrl] = useState(user?.profile?.garmoth_url || '');
    const [urlError, setUrlError] = useState<string | null>(null);
    const [isSavingGarmoth, setIsSavingGarmoth] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const [showWarningModal, setShowWarningModal] = useState(false);

    const [lightbox, setLightbox] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedLabel, setSelectedLabel] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedLabel) return;
        await uploadMedia(file, selectedLabel);
        setSelectedLabel(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const getMediaForLabel = (label: string) => media.find(m => m.label === label);
    const allUploaded = GEAR_BLOCKS.every(block => getMediaForLabel(block.label));
    
    const membership = user?.guild_memberships?.[0];
    const status = membership?.verification_status || 'incomplete';

    const isPending = status === 'pending' || status === 'updated';
    const isVerified = status === 'verified';

    const handleModeSwitch = (newMode: 'manual' | 'garmoth') => {
        if (newMode === gearSource) return;
        if (gearSource === 'garmoth' && newMode === 'manual') {
            setShowWarningModal(true);
            return;
        }
        setGearSource(newMode);
    };

    const confirmSwitchToManual = async () => {
        setShowWarningModal(false);
        setGearSource('manual');
        try {
            const updatedUser = await authApi.updateProfile({ gear_source: 'manual', garmoth_url: null });
            setUser(updatedUser);
            toast.info('Режим изменен на ручной. Garmoth-ссылка удалена.');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка при переключении режима');
        }
    };

    const handleSaveGarmoth = async () => {
        setUrlError(null);
        if (!garmothUrl.trim()) {
            setUrlError('Введите URL вашего профиля на Garmoth');
            return;
        }

        if (!GARMOTH_URL_REGEX.test(garmothUrl.trim())) {
            setUrlError('Неверный формат ссылки. Ссылка должна иметь вид https://garmoth.com/character/...');
            return;
        }

        setIsSavingGarmoth(true);
        try {
            const updatedUser = await authApi.updateProfile({
                gear_source: 'garmoth',
                garmoth_url: garmothUrl.trim()
            });
            setUser(updatedUser);
            toast.success('Garmoth профиль успешно привязан!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка при сохранении ссылки Garmoth');
        } finally {
            setIsSavingGarmoth(false);
        }
    };

    const handleRefreshGarmoth = async () => {
        setIsRefreshing(true);
        try {
            const updatedProfile = await authApi.refreshGarmothGear();
            if (user) {
                setUser({
                    ...user,
                    profile: updatedProfile
                });
            }
            toast.success('Данные гира обновлены с Garmoth!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка при обновлении гира с Garmoth');
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Status */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Верификация гира</h2>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">Выберите способ подтверждения экипировки</p>
                </div>
                <div className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider",
                    isVerified ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" :
                    isPending ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" :
                    "bg-zinc-800/40 border border-white/[0.06] text-zinc-500"
                )}>
                    {isVerified && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />}
                    {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)] animate-pulse" />}
                    {status === 'verified' ? 'Верифицировано' : isPending ? 'На проверке' : 'Не подтвержден'}
                </div>
            </div>

            {/* Mode Selector Tabs */}
            <div className="inline-flex p-1 bg-zinc-950/60 backdrop-blur-md rounded-xl border border-white/[0.06] gap-1">
                <button
                    onClick={() => handleModeSwitch('manual')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all",
                        gearSource === 'manual'
                            ? "text-white bg-violet-600/30 border border-violet-500/30 shadow-md"
                            : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                    📸 Ручная верификация
                </button>
                <button
                    onClick={() => handleModeSwitch('garmoth')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5",
                        gearSource === 'garmoth'
                            ? "text-white bg-violet-600/30 border border-violet-500/30 shadow-md"
                            : "text-zinc-400 hover:text-zinc-200"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-violet-400" />
                    ⚡ Garmoth.com
                </button>
            </div>

            {/* Garmoth Mode View */}
            {gearSource === 'garmoth' && (
                <div className="bg-zinc-950/40 border border-white/[0.06] rounded-2xl p-6 space-y-6 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center flex-wrap gap-2">
                                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">Привязка профиля Garmoth</h3>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    Авто-синхронизация
                                </span>
                            </div>
                            <p className="text-xs text-zinc-500">
                                Укажите публичную ссылку на ваш персонаж на сервере Garmoth.com. Статистика (AP, AAP, DP) подтянется автоматически.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider ml-1">
                            Ссылка на персонажа Garmoth
                        </label>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="url"
                                value={garmothUrl}
                                onChange={(e) => setGarmothUrl(e.target.value)}
                                placeholder="https://garmoth.com/character/..."
                                disabled={isPending}
                                className="flex-1 bg-zinc-900 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-700 outline-none focus:border-violet-500/50 transition-all disabled:opacity-50"
                            />
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={handleSaveGarmoth}
                                    disabled={isSavingGarmoth || isPending}
                                    className="flex-1 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-2 text-center"
                                >
                                    {isSavingGarmoth ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Сохранить'
                                    )}
                                </button>
                                {user?.profile?.garmoth_url && (
                                    <button
                                        onClick={handleRefreshGarmoth}
                                        disabled={isRefreshing || isPending}
                                        className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 text-xs font-semibold rounded-xl border border-white/5 transition-all flex items-center justify-center gap-1.5 text-center"
                                        title="Синхронизировать данные"
                                    >
                                        <svg className={cn("w-4 h-4", isRefreshing && "animate-spin")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span>Обновить</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        {urlError && (
                            <p className="text-rose-400 text-xs mt-1 ml-1">{urlError}</p>
                        )}
                    </div>

                    {/* Current Stats Overview */}
                    {user?.profile && (
                        <div className="bg-zinc-900/60 border border-white/[0.06] rounded-xl p-4">
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Текущие статы из Garmoth</p>
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="p-2 bg-zinc-950/60 rounded-lg border border-white/[0.04]">
                                    <span className="block text-[9px] text-zinc-500 uppercase font-semibold">GS</span>
                                    <span className="text-sm font-bold text-white tabular-nums">{user.profile.gear_score || 0}</span>
                                </div>
                                <div className="p-2 bg-zinc-950/60 rounded-lg border border-white/[0.04]">
                                    <span className="block text-[9px] text-zinc-500 uppercase font-semibold">AP</span>
                                    <span className="text-sm font-bold text-zinc-300 tabular-nums">{user.profile.attack || 0}</span>
                                </div>
                                <div className="p-2 bg-zinc-950/60 rounded-lg border border-white/[0.04]">
                                    <span className="block text-[9px] text-zinc-500 uppercase font-semibold">AAP</span>
                                    <span className="text-sm font-bold text-zinc-300 tabular-nums">{user.profile.awakening_attack || 0}</span>
                                </div>
                                <div className="p-2 bg-zinc-950/60 rounded-lg border border-white/[0.04]">
                                    <span className="block text-[9px] text-zinc-500 uppercase font-semibold">DP</span>
                                    <span className="text-sm font-bold text-zinc-300 tabular-nums">{user.profile.defense || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Manual Mode View */}
            {gearSource === 'manual' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {GEAR_BLOCKS.map((block) => {
                        const uploaded = getMediaForLabel(block.label);
                        return (
                            <div key={block.label} className="group relative rounded-xl overflow-hidden border border-white/[0.06] hover:border-violet-500/30 transition-all duration-300 bg-zinc-950/40 aspect-video">
                                {uploaded ? (
                                    <>
                                        <img src={uploaded.url} alt={block.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-zinc-950/90 to-transparent">
                                            <p className="text-[10px] font-semibold text-zinc-300 uppercase tracking-wider">{block.title}</p>
                                        </div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                                            <button 
                                                onClick={() => setLightbox(uploaded.url)}
                                                className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl border border-white/10 text-white transition-all scale-90 group-hover:scale-100"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            {!isPending && (
                                                <button 
                                                    onClick={() => deleteMedia(uploaded.id)}
                                                    className="p-2.5 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl border border-rose-500/20 text-rose-400 transition-all scale-90 group-hover:scale-100"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center gap-3">
                                        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">{block.title}</p>
                                        <button 
                                            onClick={() => { setSelectedLabel(block.label); fileInputRef.current?.click(); }}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:border-white/10 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                                            Загрузить
                                        </button>
                                        <button 
                                            onClick={() => setLightbox(block.example)}
                                            className="inline-flex items-center gap-1.5 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            Посмотреть пример
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Submit for Verification Button */}
            <div className="mt-8 w-full">
                {isPending ? (
                    <div className="bg-zinc-950/40 border border-white/[0.06] rounded-xl p-4 flex items-center gap-3 text-zinc-400 w-full justify-center">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 shrink-0">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-xs">
                            Ваша заявка находится на рассмотрении модераторами. Редактирование приостановлено.
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={submitForVerification}
                        disabled={isUploading || (gearSource === 'manual' ? !allUploaded : !user?.profile?.garmoth_url)}
                        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-violet-900/30 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed text-center"
                    >
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        )}
                        <span>{isVerified ? 'Подать на перепроверку' : 'Подать на верификацию'}</span>
                    </button>
                )}
            </div>

            {/* Warning Modal when switching to Manual */}
            <Modal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                title="Переключение режима"
                maxWidth="sm"
            >
                <div className="space-y-4">
                    <p className="text-xs text-zinc-300 leading-relaxed">
                        Вы переключаетесь на ручной режим верификации. Ссылка на ваш профиль в Garmoth.com будет отвязана и удалена.
                    </p>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={confirmSwitchToManual}
                            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
                        >
                            Продолжить
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Lightbox */}
            {lightbox && (
                <div 
                    className="fixed inset-0 z-[300] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300"
                    onClick={() => setLightbox(null)}
                >
                    <div className="relative max-w-full max-h-full">
                        <img src={lightbox} alt="" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl ring-1 ring-white/10 overflow-hidden select-none animate-in zoom-in-95 duration-300" />
                        <button className="absolute -top-12 -right-4 md:-right-12 p-2 text-zinc-500 hover:text-white transition-colors" onClick={() => setLightbox(null)}>
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>
            )}

            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
    );
};
