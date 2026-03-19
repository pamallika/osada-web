import { type FC, useState } from 'react';
import { guildApi } from '../api/guilds';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const Integrations: FC = () => {
    const queryClient = useQueryClient();
    const [telegramToken, setTelegramToken] = useState<string | null>(null);

    const { data: integrations, isLoading } = useQuery({
        queryKey: ['integrations'],
        queryFn: () => guildApi.getIntegrations(),
    });

    const updateMutation = useMutation({
        mutationFn: ({ provider, settings }: { provider: string, settings: any }) => 
            guildApi.updateIntegration(provider, settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (provider: string) => guildApi.deleteIntegration(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['integrations'] });
        }
    });

    const discordIntegration = integrations?.find(i => i.provider === 'discord');
    const telegramIntegration = integrations?.find(i => i.provider === 'telegram');

    const handleDiscordBind = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/v1/auth/redirect/discord`;
    };

    const handleUnbind = (provider: string) => {
        if (confirm(`Вы уверены, что хотите удалить интеграцию с ${provider}?`)) {
            deleteMutation.mutate(provider);
        }
    };

    const handleGenerateTelegramToken = async () => {
        const { token } = await guildApi.getTelegramBindToken();
        setTelegramToken(token);
    };

    const handleSaveDiscordSettings = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateMutation.mutate({
            provider: 'discord',
            settings: {
                announcement_channel_id: formData.get('channel_id'),
                settings: {
                    ping_roles: formData.get('roles')?.toString().split(',').map(s => s.trim()) || []
                }
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-black text-zinc-100 uppercase italic tracking-tighter">Интеграции</h1>
                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-2">Свяжите вашу гильдию с Discord и Telegram</p>
            </div>

            <div className="grid gap-6">
                {/* Discord Integration */}
                <div className="bg-zinc-900 border border-zinc-800/50 rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#5865F2]/10 rounded-2xl flex items-center justify-center text-[#5865F2] border border-[#5865F2]/20">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.947 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.086 2.157 2.419c0 1.334-.946 2.419-2.157 2.419z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-100 uppercase italic tracking-tight">Discord</h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Анонсы и пинги в Discord каналах</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {discordIntegration ? (
                                <>
                                    <span className="bg-emerald-900/20 text-emerald-400 text-[10px] font-black px-4 py-2 rounded-xl border border-emerald-800/30 uppercase tracking-widest italic">Подключено</span>
                                    <button 
                                        onClick={() => handleUnbind('discord')}
                                        className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleDiscordBind}
                                    className="bg-[#5865F2] hover:bg-[#4752C4] text-white text-[10px] font-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest italic shadow-lg shadow-[#5865F2]/20"
                                >
                                    Привязать Discord
                                </button>
                            )}
                        </div>
                    </div>
                    {discordIntegration && (
                        <div className="p-8">
                            <form onSubmit={handleSaveDiscordSettings} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Сервер</label>
                                        <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl text-zinc-100 font-bold">
                                            {discordIntegration.platform_title || 'Сервер не найден'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">ID Канала Анонсов</label>
                                        <input 
                                            name="channel_id"
                                            defaultValue={discordIntegration.announcement_channel_id}
                                            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-800" 
                                            placeholder="1234567890..."
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">ID Ролей для пинга (через запятую)</label>
                                        <input 
                                            name="roles"
                                            defaultValue={discordIntegration.settings?.ping_roles?.join(', ')}
                                            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-800" 
                                            placeholder="8812345, 9912345..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button 
                                        type="submit"
                                        disabled={updateMutation.isPending}
                                        className="bg-violet-700 hover:bg-violet-600 text-white text-[10px] font-black px-8 py-3 rounded-xl transition-all uppercase tracking-widest italic disabled:opacity-50"
                                    >
                                        {updateMutation.isPending ? 'Сохранение...' : 'Сохранить настройки'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                {/* Telegram Integration */}
                <div className="bg-zinc-900 border border-zinc-800/50 rounded-3xl overflow-hidden">
                    <div className="p-8 border-b border-zinc-800/50 flex items-center justify-between bg-zinc-950/30">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#229ED9]/10 rounded-2xl flex items-center justify-center text-[#229ED9] border border-[#229ED9]/20">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M11.944 0C5.352 0 0 5.352 0 11.944c0 6.592 5.352 11.944 11.944 11.944 6.592 0 11.944-5.352 11.944-11.944C23.888 5.352 18.536 0 11.944 0zm5.832 8.328l-2.016 9.48c-.144.648-.528.816-1.08.48l-3.048-2.256-1.464 1.416c-.168.168-.312.312-.648.312l.216-3.12 5.664-5.112c.24-.216-.048-.336-.384-.12l-7 4.416-3.024-.936c-.648-.216-.672-.648.144-.96l11.856-4.56c.552-.216 1.032.12.84 1.272z"/>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-zinc-100 uppercase italic tracking-tight">Telegram</h2>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Анонсы в Telegram каналах и Mini App</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {telegramIntegration ? (
                                <>
                                    <span className={`text-[10px] font-black px-4 py-2 rounded-xl border uppercase tracking-widest italic ${
                                        telegramIntegration.is_valid === false 
                                            ? 'bg-rose-900/20 text-rose-400 border-rose-800/30'
                                            : 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30'
                                    }`}>
                                        {telegramIntegration.is_valid === false ? 'Ошибка доступа' : 'Подключено'}
                                    </span>
                                    <button 
                                        onClick={() => handleUnbind('telegram')}
                                        className="p-2 text-zinc-600 hover:text-rose-500 transition-colors"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <button 
                                    onClick={handleGenerateTelegramToken}
                                    className="bg-[#229ED9] hover:bg-[#1C82B3] text-white text-[10px] font-black px-6 py-2.5 rounded-xl transition-all uppercase tracking-widest italic shadow-lg shadow-[#229ED9]/20"
                                >
                                    Привязать Telegram
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="p-8">
                        {telegramToken ? (
                            <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/50 space-y-4">
                                <h3 className="text-[10px] font-black text-violet-400 uppercase tracking-widest italic">Инструкция по привязке</h3>
                                <p className="text-sm text-zinc-400">
                                    Отправьте команду ниже нашему боту <span className="text-zinc-100 font-bold">@SAGE_Event_Bot</span> в том <span className="text-violet-400 font-black">КАНАЛЕ</span>, куда хотите получать уведомления:
                                </p>
                                <div className="bg-black/50 p-4 rounded-xl border border-zinc-800 font-mono text-zinc-100 text-sm break-all select-all cursor-pointer hover:border-violet-700 transition-colors">
                                    /bind {telegramToken}
                                </div>
                                <div className="p-3 bg-amber-900/10 border border-amber-800/30 rounded-xl">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-wider leading-relaxed italic">
                                        ⚠️ Привязка личных чатов запрещена. Бот должен быть администратором канала.
                                    </p>
                                </div>
                                <p className="text-[10px] text-zinc-500 italic">Токен действителен 24 часа.</p>
                            </div>
                        ) : !telegramIntegration && (
                            <p className="text-sm text-zinc-500 text-center py-4 italic">Нажмите кнопку выше, чтобы получить токен привязки</p>
                        )}

                        {telegramIntegration && (
                             <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800/50 flex items-center justify-between">
                                <div>
                                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Канал</div>
                                    <div className="text-sm font-bold text-zinc-100">{telegramIntegration.platform_title || telegramIntegration.platform_id}</div>
                                </div>
                                <button 
                                    onClick={handleGenerateTelegramToken}
                                    className="text-[10px] font-black text-zinc-500 hover:text-violet-400 uppercase tracking-widest transition-colors"
                                >
                                    Изменить канал
                                </button>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
