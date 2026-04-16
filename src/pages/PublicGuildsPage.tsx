import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../api/public';
import { Link, useNavigate } from 'react-router-dom';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuthStore } from '../store/useAuthStore';

const PublicGuildsPage: FC = () => {
    const navigate = useNavigate();
    const { token } = useAuthStore();
    const { data: guilds, isLoading, error } = useQuery({
        queryKey: ['public-guilds'],
        queryFn: publicApi.getGuilds
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-20 animate-in fade-in duration-700">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Список Гильдий</h1>
                    <p className="text-zinc-400 text-sm mt-1">Публичные гильдии, зарегистрированные на платформе</p>
                </div>
                {!token && (
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-white text-zinc-900 rounded-xl text-sm font-bold shadow-lg shadow-white/10 hover:shadow-white/20 transition-all font-mono uppercase tracking-widest"
                    >
                        Войти
                    </button>
                )}
            </div>

            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
            )}

            {error && (
                <div className="p-8 text-center bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                    <p className="text-rose-400 font-medium">Не удалось загрузить список гильдий</p>
                </div>
            )}

            {guilds && guilds.length === 0 && (
                <div className="py-20 text-center">
                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <p className="text-zinc-500 font-medium">Пока нет публичных гильдий</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guilds?.map(guild => (
                    <Link
                        key={guild.id}
                        to={`/guilds/${guild.invite_slug}`}
                        className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 ring-1 ring-white/[0.04] hover:border-violet-500/30 hover:bg-zinc-900/80 transition-all duration-300 group flex items-start gap-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform shadow-xl">
                            {guild.logo_url ? (
                                <img src={guild.logo_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <span className="text-2xl font-black text-zinc-500">{guild.name[0]}</span>
                            )}
                        </div>
                        <div className="overflow-hidden">
                            <h3 className="text-lg font-bold text-white tracking-tight truncate group-hover:text-violet-300 transition-colors">
                                {guild.name}
                            </h3>
                            <div className="mt-2 flex items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950/50 border border-white/5 text-[10px] font-semibold text-zinc-400">
                                    <svg className="w-3.5 h-3.5 text-zinc-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                    {guild.members_count} УЧАСТНИКОВ
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default PublicGuildsPage;
