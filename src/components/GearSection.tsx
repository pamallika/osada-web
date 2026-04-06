import React, { useState, useRef } from 'react';
import { useGear } from '../hooks/useGear';
import { useAuthStore } from '../store/useAuthStore';
import { cn } from '../lib/utils';

const GEAR_BLOCKS = [
    { label: 'crystal', title: 'Инкрустация', example: '/images/crystal.png' },
    { label: 'relic', title: 'Реликвии', example: '/images/relic.png' },
    { label: 'zakalk', title: 'Закалка', example: '/images/zakalk.png' },
    { label: 'gear', title: 'Гир', example: '/images/gear.png' }
];

export const GearSection = () => {
    const { user } = useAuthStore();
    const { 
        media, 
        isLoading, 
        isUploading, 
        uploadMedia, 
        deleteMedia, 
        submitForVerification 
    } = useGear();

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

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Верификация гира</h2>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">Добавьте обязательные скриншоты для подтверждения</p>
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
                                    {/* Кнопка примера — НЕ overlay, а обычный элемент под кнопкой загрузки */}
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

            <div className="mt-8 flex justify-end">
                {isPending ? (
                    <div className="bg-zinc-950/40 border border-white/[0.06] rounded-xl p-4 flex items-center gap-3 text-zinc-400">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-xs">
                            Ваша заявка находится на рассмотрении модераторами. Редактирование приостановлено.
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={submitForVerification}
                        disabled={isUploading || !allUploaded}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-violet-900/30 transition-all duration-200 active:scale-[0.98]"
                    >
                        {isUploading ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        )}
                        {isVerified ? 'Подать на перепроверку' : 'Подать на верификацию'}
                    </button>
                )}
            </div>

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
