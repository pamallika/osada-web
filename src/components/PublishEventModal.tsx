import { type FC, useState, useEffect } from 'react';
import { guildApi } from '../api/guilds';
import type { GuildIntegration } from '../api/types';

interface PublishEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPublish: (options: { platforms: string[], roles: string[] }) => void;
    isProcessing: boolean;
}

export const PublishEventModal: FC<PublishEventModalProps> = ({ isOpen, onClose, onPublish, isProcessing }) => {
    const [platforms, setPlatforms] = useState<string[]>([]);
    const [roles, setRoles] = useState<string[]>([]);
    const [newRole, setNewRole] = useState('');
    const [integrations, setIntegrations] = useState<GuildIntegration[]>([]);
    const [isLoadingIntegrations, setIsLoadingIntegrations] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchIntegrations();
        }
    }, [isOpen]);

    const fetchIntegrations = async () => {
        setIsLoadingIntegrations(true);
        try {
            const data = await guildApi.getIntegrations();
            setIntegrations(data);
            
            // Auto-select available platforms
            const available = data
                .filter(i => i.platform_id)
                .map(i => i.provider);
            setPlatforms(available);
        } catch (error) {
            console.error('Failed to fetch integrations:', error);
        } finally {
            setIsLoadingIntegrations(false);
        }
    };

    if (!isOpen) return null;

    const handleTogglePlatform = (platform: string) => {
        setPlatforms(prev => 
            prev.includes(platform) 
                ? prev.filter(p => p !== platform) 
                : [...prev, platform]
        );
    };

    const handleAddRole = () => {
        if (newRole && !roles.includes(newRole)) {
            setRoles([...roles, newRole]);
            setNewRole('');
        }
    };

    const handleRemoveRole = (role: string) => {
        setRoles(roles.filter(r => r !== role));
    };

    const isDiscordIntegrated = integrations.some(i => i.provider === 'discord' && i.platform_id);
    const isTelegramIntegrated = integrations.some(i => i.provider === 'telegram' && i.platform_id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-8 border-b border-zinc-800/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tighter">Публикация события</h2>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Выберите платформы и уведомления</p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-zinc-100 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Platforms */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Платформы</label>
                        {isLoadingIntegrations ? (
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-600 uppercase animate-pulse italic">
                                <div className="w-3 h-3 border border-zinc-700 border-t-zinc-500 rounded-full animate-spin"></div>
                                Проверка интеграций...
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <button 
                                        type="button"
                                        disabled={!isDiscordIntegrated}
                                        onClick={() => handleTogglePlatform('discord')}
                                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 relative overflow-hidden group ${
                                            platforms.includes('discord') 
                                                ? 'bg-[#5865F2]/10 border-[#5865F2]/50 text-white shadow-lg shadow-[#5865F2]/5' 
                                                : isDiscordIntegrated 
                                                    ? 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700' 
                                                    : 'bg-zinc-950/50 border-zinc-900 text-zinc-800 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            platforms.includes('discord') 
                                                ? 'bg-[#5865F2] text-white' 
                                                : isDiscordIntegrated ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-950 text-zinc-800'
                                        }`}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Discord</span>
                                    </button>
                                    {!isDiscordIntegrated && (
                                        <p className="text-[8px] font-black text-rose-900 uppercase tracking-tighter ml-1 italic">Не подключено</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <button 
                                        type="button"
                                        disabled={!isTelegramIntegrated}
                                        onClick={() => handleTogglePlatform('telegram')}
                                        className={`w-full p-4 rounded-2xl border transition-all flex items-center gap-3 relative overflow-hidden group ${
                                            platforms.includes('telegram') 
                                                ? 'bg-[#229ED9]/10 border-[#229ED9]/50 text-white shadow-lg shadow-[#229ED9]/5' 
                                                : isTelegramIntegrated 
                                                    ? 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700' 
                                                    : 'bg-zinc-950/50 border-zinc-900 text-zinc-800 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                            platforms.includes('telegram') 
                                                ? 'bg-[#229ED9] text-white' 
                                                : isTelegramIntegrated ? 'bg-zinc-900 text-zinc-600' : 'bg-zinc-950 text-zinc-800'
                                        }`}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944 6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.832 8.328l-2.016 9.48c-.144.648-.528.816-1.08.48l-3.048-2.256-1.464 1.416c-.168.168-.312.312-.648.312l.216-3.12 5.664-5.112c.24-.216-.048-.336-.384-.12l-7 4.416-3.024-.936c-.648-.216-.672-.648.144-.96l11.856-4.56c.552-.216 1.032.12.84 1.272z"/>
                                            </svg>
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">Telegram</span>
                                    </button>
                                    {!isTelegramIntegrated && (
                                        <p className="text-[8px] font-black text-rose-900 uppercase tracking-tighter ml-1 italic">Не подключено</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Roles to Ping */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Роли для упоминания (Discord ID)</label>
                        <div className="flex gap-2">
                            <input 
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="flex-1 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-800" 
                                placeholder="8812345678..."
                            />
                            <button 
                                type="button"
                                onClick={handleAddRole}
                                className="bg-zinc-800 hover:bg-zinc-700 text-white p-4 rounded-2xl transition-all"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {roles.map(role => (
                                <div key={role} className="bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-xl flex items-center gap-2 group">
                                    <span className="text-[10px] font-bold text-zinc-400 font-mono tracking-tighter">{role}</span>
                                    <button type="button" onClick={() => handleRemoveRole(role)} className="text-zinc-600 hover:text-rose-500 transition-colors">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                            {roles.length === 0 && <p className="text-[10px] text-zinc-600 italic px-1">Роли не выбраны (пинга не будет)</p>}
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-zinc-950/50 flex gap-4">
                    <button 
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 font-black py-4 rounded-2xl transition-all uppercase tracking-widest text-[10px] italic border border-zinc-800"
                    >
                        Отмена
                    </button>
                    <button 
                        onClick={() => onPublish({ platforms, roles })}
                        disabled={isProcessing}
                        className="flex-[2] bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-violet-900/20 uppercase tracking-widest text-[10px] italic flex items-center justify-center gap-3"
                    >
                        {isProcessing ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            platforms.length === 0 ? '🌐 Опубликовать только на SAGE' : '🚀 Опубликовать везде'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
