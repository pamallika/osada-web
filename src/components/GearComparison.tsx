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
            <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">{title}</h4>
            <div className="grid grid-cols-2 gap-3">
                {media.length === 0 ? (
                    <div className="col-span-2 py-12 text-center bg-zinc-950/20 rounded-[2rem] border border-dashed border-zinc-800/50">
                        <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest italic">Нет скриншотов в этой категории</span>
                    </div>
                ) : (
                    media.map(m => (
                        <div 
                            key={m.id} 
                            onClick={() => setPreviewUrl(m.url)}
                            className="group relative aspect-video bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-800/50 shadow-lg cursor-pointer transition-transform hover:scale-[1.02] active:scale-95"
                        >
                            <img src={m.url} alt={m.label || 'Gear'} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                            <div className="absolute top-3 left-3 px-2.5 py-1 bg-zinc-900/90 backdrop-blur-md rounded-lg text-[8px] font-black text-zinc-300 uppercase tracking-[0.2em] border border-white/5 shadow-xl">
                                {m.label}
                            </div>
                            <div className="absolute inset-0 bg-violet-600/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                </svg>
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
        <div className="space-y-8 animate-in fade-in duration-300">
            {/* Tabs */}
            <div className="flex p-1.5 bg-zinc-950 rounded-[2rem] border border-zinc-800/50 shadow-inner">
                <button
                    onClick={() => setActiveTab('new')}
                    className={`flex-1 py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${
                        activeTab === 'new' 
                            ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' 
                            : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Заявка
                </button>
                <button
                    onClick={() => setActiveTab('current')}
                    className={`flex-1 py-3 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest italic transition-all ${
                        activeTab === 'current' 
                            ? 'bg-zinc-800 text-zinc-100' 
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-sm p-4 cursor-zoom-out animate-in fade-in duration-300"
        onClick={onClose}
    >
        <img 
            src={url} 
            className="max-w-full max-h-full rounded-2xl shadow-2xl border border-zinc-800/50 animate-in zoom-in-95 duration-300"
            alt="Full Preview"
            onClick={(e) => e.stopPropagation()} 
        />
        <button 
            className="absolute top-8 right-8 p-4 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-500 hover:text-white transition-all shadow-xl"
            onClick={onClose}
        >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
);
