import React, { useState } from 'react';
import type { UserGearMedia } from '../api/types';

interface GearComparisonProps {
    currentMedia: UserGearMedia[];
    draftMedia: UserGearMedia[];
}

export const GearComparison: React.FC<GearComparisonProps> = ({ 
    currentMedia, 
    draftMedia 
}) => {
    const [activeTab, setActiveTab] = useState<'current' | 'new'>(draftMedia.length > 0 ? 'new' : 'current');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const hasDraft = draftMedia.length > 0;

    const MediaGallery = ({ media, title }: { media: UserGearMedia[], title: string }) => (
        <div className="space-y-4">
            <h4 className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider ml-1">{title}</h4>
            <div className="grid grid-cols-2 gap-4">
                {media.length === 0 ? (
                    <div className="col-span-2 py-12 text-center bg-zinc-950/20 rounded-2xl border border-dashed border-zinc-800/50">
                        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">Нет скриншотов</span>
                    </div>
                ) : (
                    media.map(m => (
                        <div 
                            key={m.id} 
                            onClick={() => setPreviewUrl(m.url)}
                            className="group relative aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-white/[0.06] shadow-lg cursor-pointer transition-all duration-300 hover:border-white/20 active:scale-95"
                        >
                            <img src={m.url} alt={m.label || 'Gear'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <div className="absolute top-3 left-3 px-2 py-1 bg-zinc-900/90 backdrop-blur-md rounded-lg text-[9px] font-semibold text-zinc-300 uppercase tracking-wider border border-white/5 shadow-xl">
                                {m.label}
                            </div>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    if (!hasDraft) {
        return (
            <div className="animate-in fade-in duration-300">
                <MediaGallery media={currentMedia} title="Текущий альбом" />
                {previewUrl && <ImageLightbox url={previewUrl} onClose={() => setPreviewUrl(null)} />}
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Tabs */}
            <div className="flex p-1 bg-zinc-950 rounded-2xl border border-white/[0.04] shadow-inner">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        activeTab === 'new' 
                            ? 'bg-zinc-800 text-white shadow-xl ring-1 ring-white/10' 
                            : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Заявка
                </button>
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        activeTab === 'current' 
                            ? 'bg-zinc-800 text-white shadow-xl ring-1 ring-white/10' 
                            : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Текущее
                </button>
            </div>

            <div className="animate-in slide-in-from-right-4 duration-300">
                {activeTab === 'new' ? (
                    <MediaGallery media={draftMedia} title="Новые скриншоты" />
                ) : (
                    <MediaGallery media={currentMedia} title="Текущий альбом" />
                )}
            </div>

            {previewUrl && <ImageLightbox url={previewUrl} onClose={() => setPreviewUrl(null)} />}
        </div>
    );
};

const ImageLightbox = ({ url, onClose }: { url: string, onClose: () => void }) => (
    <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-md p-4 cursor-zoom-out animate-in fade-in duration-300"
        onClick={onClose}
    >
        <img 
            src={url} 
            className="max-w-full max-h-full rounded-2xl shadow-2xl border border-white/[0.08] animate-in zoom-in-95 duration-300"
            alt="Full Preview"
            onClick={(e) => e.stopPropagation()} 
        />
        <button 
            className="absolute top-8 right-8 p-3 bg-zinc-900 rounded-2xl border border-white/5 text-zinc-500 hover:text-white transition-all shadow-xl"
            onClick={onClose}
        >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);
