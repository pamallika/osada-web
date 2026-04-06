import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { guildApi } from '../api/guilds';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { NoGuildView } from '../components/NoGuildView';
import { PendingApprovalView } from '../components/PendingApprovalView';
import { GuildApplicationsList } from '../components/GuildApplicationsList';
import { GuildMembersTab } from '../components/GuildMembersTab';
import { MemberDashboardView } from '../components/MemberDashboardView';
import { AnalyticsDashboardView } from '../components/AnalyticsDashboardView';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { Skeleton } from '../components/ui/Skeleton';

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

    // Fetch applications count for badge
    const { data: applications } = useQuery({
        queryKey: ['guild-applications-count'],
        queryFn: () => guildApi.getApplications(),
        enabled: !!canSeeApplications,
        refetchInterval: 60000 // Refresh every minute
    });

    const pendingApplicationsCount = applications?.length || 0;

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
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-12 w-48 rounded-xl" />
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>
            );
        }

        return (
            <div className="space-y-6 select-none animate-in fade-in duration-500">
                {/* Tabs & Top Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex gap-1 p-1 bg-zinc-900/60 backdrop-blur-xl border border-white/[0.06] rounded-xl w-fit shadow-xl ring-1 ring-white/[0.04]">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'overview' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Обзор
                        </button>
                        <button
                            onClick={() => setActiveTab('members')}
                            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'members' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            Состав
                        </button>
                        <button
                            onClick={() => setActiveTab('knowledge')}
                            className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                activeTab === 'knowledge' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            База знаний
                        </button>
                        {isManagement && (
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
                                    activeTab === 'analytics' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                Аналитика
                            </button>
                        )}
                        {canSeeApplications && (
                            <button
                                onClick={() => setActiveTab('applications')}
                                className={`px-5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    activeTab === 'applications' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                Заявки
                                {pendingApplicationsCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-[9px] font-bold tabular-nums">
                                        {pendingApplicationsCount}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>

                    <button 
                        onClick={handleLeaveGuild}
                        disabled={leaveLoading}
                        className="bg-zinc-900/60 hover:bg-rose-500/10 hover:text-rose-400 border border-white/5 text-zinc-500 px-5 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2"
                    >
                        {leaveLoading ? '...' : isCreator ? 'Деактивировать Гильдию' : 'Покинуть Гильдию'}
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <MemberDashboardView />
                )}

                {activeTab === 'analytics' && isManagement && (
                    <AnalyticsDashboardView isAdmin={activeMembership.role === 'creator' || activeMembership.role === 'admin'} />
                )}

                {activeTab === 'members' && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <GuildMembersTab currentUserId={user!.id} currentUserRole={activeMembership.role as any} />
                    </div>
                )}

                {activeTab === 'knowledge' && (
                    <KnowledgeBaseView isAdmin={!!isManagement} />
                )}

                {activeTab === 'applications' && canSeeApplications && (
                    <div className="animate-in slide-in-from-bottom-2 duration-300">
                        <GuildApplicationsList />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-10">
            {renderContent()}
        </div>
    );
}
