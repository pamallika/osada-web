import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { guildApi } from '../api/guilds';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { NoGuildView } from '../components/NoGuildView';
import { PendingApprovalView } from '../components/PendingApprovalView';
import { GuildApplicationsList } from '../components/GuildApplicationsList';
import { GuildMembersTab } from '../components/GuildMembersTab';
import { MemberDashboardView } from '../components/MemberDashboardView';
import { AnalyticsDashboardView } from '../components/AnalyticsDashboardView';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';

export default function Dashboard() {
    const { user, setUser } = useAuthStore();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'knowledge' | 'applications' | 'analytics' >('overview');
    const [leaveLoading, setLeaveLoading] = useState(false);

    // Invite Context Recovery
    useEffect(() => {
        const pendingInvite = localStorage.getItem('pending_invite');
        if (pendingInvite) {
            const memberships = user?.guild_memberships || [];
            const activeMembership = memberships.find(m => m.status === 'active');
            const pendingMembership = memberships.find(m => m.status === 'pending');

            if (!activeMembership && !pendingMembership) {
                navigate(`/invite/${pendingInvite}`);
            } else {
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

    const renderContent = () => {
        if (!activeMembership) {
            if (pendingMembership) {
                return <PendingApprovalView guildName={pendingMembership.guild?.name || 'Гильдия'} />;
            }
            return <NoGuildView />;
        }

        if (!activeMembership.guild) {
            return (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <div className="w-10 h-10 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin"></div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic animate-pulse">Загрузка данных гильдии</span>
                </div>
            );
        }

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
                        <button
                            onClick={() => setActiveTab('knowledge')}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                                activeTab === 'knowledge' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                            }`}
                        >
                            База знаний
                        </button>
                        {isManagement && (
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all ${
                                    activeTab === 'analytics' ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30'
                                }`}
                            >
                                Аналитика
                            </button>
                        )}
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
                    <MemberDashboardView />
                )}

                {activeTab === 'analytics' && isManagement && (
                    <AnalyticsDashboardView isAdmin={activeMembership.role === 'creator' || activeMembership.role === 'admin'} />
                )}

                {activeTab === 'members' && (
                    <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">Состав Гильдии</h2>
                            <div className="bg-zinc-950 px-4 py-2 rounded-lg border border-zinc-800/50">
                                <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest italic">Live Status</span>
                            </div>
                        </div>
                        <GuildMembersTab currentUserId={user!.id} currentUserRole={activeMembership.role as any} />
                    </div>
                )}

                {activeTab === 'knowledge' && (
                    <KnowledgeBaseView isAdmin={!!isManagement} />
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
