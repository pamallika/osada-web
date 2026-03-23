import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { NoGuildView } from '../components/NoGuildView';
import { PendingApprovalView } from '../components/PendingApprovalView';
import { GuildApplicationsList } from '../components/GuildApplicationsList';
import { GuildMembersList } from '../components/GuildMembersList';

export default function Dashboard() {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'applications'>('overview');
    const [copySuccess, setCopySuccess] = useState(false);
    const [leaveLoading, setLeaveLoading] = useState(false);
    const [editingSlug, setEditingSlug] = useState(false);
    const [newSlug, setNewSlug] = useState('');
    const [slugLoading, setSlugLoading] = useState(false);

    // Invite Context Recovery
    useEffect(() => {
        const pendingInvite = localStorage.getItem('pending_invite');
        if (pendingInvite) {
            // Check if user is already in a guild
            const memberships = user?.guild_memberships || [];
            const activeMembership = memberships.find(m => m.status === 'active');
            const pendingMembership = memberships.find(m => m.status === 'pending');

            if (!activeMembership && !pendingMembership) {
                navigate(`/invite/${pendingInvite}`);
            } else {
                // If user is already in a guild or has a pending app, we clear the recovery slug
                localStorage.removeItem('pending_invite');
            }
        }
    }, [user, navigate]);

    // Проверка членства в гильдии
    const memberships = user?.guild_memberships || [];
    const activeMembership = memberships.find(m => m.status === 'active');
    const pendingMembership = memberships.find(m => m.status === 'pending');

    const isManagement = activeMembership && ['creator', 'admin', 'officer'].includes(activeMembership.role);
    const isCreator = activeMembership?.role === 'creator';
    const canSeeApplications = activeMembership && ['creator', 'admin'].includes(activeMembership.role);

    useEffect(() => {
        if (activeMembership?.guild?.invite_slug) {
            setNewSlug(activeMembership.guild.invite_slug);
        }
    }, [activeMembership]);

    const copyToClipboard = () => {
        if (activeMembership?.guild?.invite_slug) {
            const fullUrl = `${window.location.origin}/invite/${activeMembership.guild.invite_slug}`;
            navigator.clipboard.writeText(fullUrl);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handleLeaveGuild = async () => {
        const message = isCreator 
            ? "Внимание! Вы являетесь создателем гильдии. Ваш выход приведет к ДЕАКТИВАЦИИ гильдии для всех участников. Вы уверены?"
            : "Вы уверены, что хотите покинуть гильдию?";
        
        if (!confirm(message)) return;

        setLeaveLoading(true);
        try {
            const updatedUser = await guildApi.leaveGuild();
            setUser(updatedUser);
            navigate('/dashboard');
        } catch (error) {
            console.error('Failed to leave guild:', error);
            alert('Ошибка при выходе из гильдии');
        } finally {
            setLeaveLoading(false);
        }
    };

    const handleUpdateSlug = async () => {
        if (!newSlug.trim() || newSlug === activeMembership?.guild.invite_slug) {
            setEditingSlug(false);
            return;
        }

        setSlugLoading(true);
        try {
            await guildApi.updateInviteSlug(newSlug);
            const updatedUser = await authApi.getMe();
            setUser(updatedUser);
            setEditingSlug(false);
        } catch (error: any) {
            console.error('Failed to update slug:', error);
            alert(error.response?.data?.message || 'Ошибка при обновлении ссылки');
        } finally {
            setSlugLoading(false);
        }
    };

    const renderContent = () => {
        if (!activeMembership) {
            if (pendingMembership) {
                return <PendingApprovalView guildName={pendingMembership.guild.name} />;
            }
            return <NoGuildView />;
        }

        const inviteLink = activeMembership.guild.invite_slug 
            ? `${window.location.origin}/invite/${activeMembership.guild.invite_slug}`
            : 'Ссылка не настроена';

        return (
            <div className="space-y-6 select-none animate-in fade-in duration-500">
                {/* Tabs & Top Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex gap-2 p-1 bg-zinc-900 rounded-xl border border-zinc-800/50 w-fit shadow-inner">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                                activeTab === 'overview' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                            }`}
                        >
                            Обзор
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                                activeTab === 'members' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                            }`}
                        >
                            Состав
                        </button>
                        {canSeeApplications && (
                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                                    activeTab === 'applications' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                }`}
                            >
                                Заявки
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={handleLeaveGuild}
                        disabled={leaveLoading}
                        className="bg-zinc-900 hover:bg-rose-900/20 hover:text-rose-500 border border-zinc-800/50 text-zinc-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center justify-center gap-2"
                    >
                        {leaveLoading ? 'Выход...' : isCreator ? 'Деактивировать Гильдию' : 'Выйти из Гильдии'}
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Карточка гильдии */}
                        <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <span className="text-8xl font-black italic uppercase tracking-tighter text-zinc-100">SAGE</span>
                            </div>
                            <div className="relative z-10">
                                <span className="text-[10px] font-black text-violet-500 uppercase tracking-[0.3em] italic">Гильдия</span>
                                <h2 className="text-4xl font-black mt-2 text-zinc-100 uppercase italic tracking-tighter">{activeMembership.guild.name}</h2>
                                <div className="mt-4 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Ваш Ранг: <span className="text-zinc-300 italic">{activeMembership.role}</span></p>
                                </div>
                                <div className="flex gap-3 mt-10">
                                    <button 
                                        onClick={() => setActiveTab('members')}
                                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border border-zinc-700/50"
                                    >
                                        Список состава
                                    </button>
                                    {isManagement && (
                                        <button 
                                            onClick={() => navigate('/events', { state: { openCreateModal: true } })}
                                            className="bg-violet-700 hover:bg-violet-600 text-white py-3.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-xl shadow-violet-900/20"
                                        >
                                            Создать событие
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Инвайт-ссылка (Теперь видна всем) */}
                        <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">Приглашение</h2>
                                    {isCreator && !editingSlug && (
                                        <button 
                                            onClick={() => setEditingSlug(true)}
                                            className="text-[10px] font-black text-violet-500 uppercase tracking-widest hover:text-violet-400 transition-colors"
                                        >
                                            Изменить ссылку
                                        </button>
                                    )}
                                </div>
                                <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                    {isCreator 
                                        ? "Настройте уникальный ID для вашей гильдии и делитесь ссылкой."
                                        : "Используйте эту ссылку, чтобы пригласить новых участников."}
                                </p>
                            </div>
                            
                            <div className="mt-8 space-y-4">
                                {editingSlug ? (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 font-bold text-[10px] uppercase">ID:</span>
                                            <input 
                                                type="text"
                                                value={newSlug}
                                                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-4 pl-10 pr-4 text-zinc-100 font-bold outline-none focus:border-violet-700 transition-all"
                                                placeholder="my-guild-name"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={handleUpdateSlug}
                                                disabled={slugLoading}
                                                className="flex-1 bg-violet-700 hover:bg-violet-600 text-white font-black py-3 rounded-xl text-[10px] uppercase italic transition-all disabled:opacity-50"
                                            >
                                                {slugLoading ? '...' : 'Сохранить'}
                                            </button>
                                            <button 
                                                onClick={() => setEditingSlug(false)}
                                                className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-500 font-black py-3 rounded-xl text-[10px] uppercase italic transition-all"
                                            >
                                                Отмена
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <div 
                                            onClick={copyToClipboard}
                                            className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 text-sm md:text-base font-bold text-zinc-400 break-all font-mono cursor-pointer hover:border-zinc-700 transition-all group/link relative"
                                        >
                                            {inviteLink}
                                            <div className="absolute top-2 right-2 opacity-0 group-hover/link:opacity-100 transition-opacity">
                                                <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button
                                            onClick={copyToClipboard}
                                            disabled={!activeMembership.guild.invite_slug}
                                            className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center justify-center gap-2 ${
                                                copySuccess ? 'bg-emerald-800 text-white shadow-lg shadow-emerald-900/20' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed'
                                            }`}
                                        >
                                            {copySuccess ? (
                                                <>
                                                    <span className="text-base">✅</span>
                                                    Ссылка скопирована!
                                                </>
                                            ) : 'Копировать ссылку'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'members' && (
                    <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">Состав Гильдии</h2>
                            <div className="bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800/50">
                                <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Live Status</span>
                            </div>
                        </div>
                        <GuildMembersList currentUserId={user!.id} currentUserRole={activeMembership.role} />
                    </div>
                )}

                {activeTab === 'applications' && canSeeApplications && (
                    <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">Входящие Заявки</h2>
                            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Ожидают вашего решения</p>
                        </div>
                        <GuildApplicationsList />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10 font-sans">
            {renderContent()}
        </div>
    );
}
