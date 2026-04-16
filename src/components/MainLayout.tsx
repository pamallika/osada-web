import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useSyncUser } from '../hooks/useSyncUser';
import { usePresence } from '../hooks/usePresence';
import { useUserWebSockets } from '../hooks/useUserWebSockets';
import Avatar from './ui/Avatar';
import { Toaster } from './Toaster';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    const { user, logout, isTMA, pendingApplicationsCount } = useAuthStore();
    const { syncUser } = useSyncUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { onlineCount } = usePresence();

    useUserWebSockets();

    const activeMembership = user?.guild_memberships?.find(m => m.status === 'active');
    const activeGuild = activeMembership?.guild;

    const navLinks: Array<{ to: string; label: string; icon: ReactNode; badge?: ReactNode }> = [
        {
            to: '/guilds', label: 'Гильдии', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            )
        }
    ];

    if (user) {
        navLinks.push({
            to: '/dashboard', label: 'Дашборд', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            ), badge: (activeMembership && ['creator', 'admin'].includes(activeMembership.role) && pendingApplicationsCount > 0) ? pendingApplicationsCount : null
        });

        if (activeMembership && ['creator', 'admin', 'officer'].includes(activeMembership.role)) {
            navLinks.push({
                to: '/integrations', label: 'Интеграции', icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v1a2 2 0 11-4 0v-1a1 1 0 00-1-1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                )
            });
            navLinks.push({
                to: '/verifications', label: 'Верификация', icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                )
            });
        }

        navLinks.push({
            to: '/events', label: 'События', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        });

        navLinks.push({
            to: '/profile', label: 'Профиль', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        });
    }

    return (
        <div className="min-h-screen bg-[#09090b] text-zinc-300 font-sans flex flex-col pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] overflow-x-hidden">
            {/* Ambient Glow */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-violet-600/8 blur-[140px] rounded-full pointer-events-none z-0" />
            <div className="fixed bottom-0 right-0 w-[500px] h-[300px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-[100] bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo and Brand */}
                        <div className="flex items-center gap-10">
                            <Link
                                to="/dashboard"
                                onClick={() => syncUser()}
                                className="flex items-center group"
                            >
                                <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-violet-300 uppercase italic">SAGE</span>
                            </Link>

                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center gap-6">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        className={({ isActive }) => `
                                                flex items-center gap-2 py-1.5 text-sm font-semibold transition-all relative
                                                ${isActive
                                                ? 'text-white after:absolute after:-bottom-[28px] after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-violet-500'
                                                : 'text-zinc-400 hover:text-zinc-200'}
                                            `}
                                    >
                                        {link.label}
                                        {link.badge && (
                                            <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-rose-600 text-[8px] font-black text-white rounded-full border-2 border-zinc-950 shadow-lg not-italic">
                                                {link.badge}
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>

                        {/* Right side: Guild and Profile */}
                        <div className="flex items-center gap-4">
                            {activeGuild && (
                                <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-zinc-900/50 rounded-lg border border-white/[0.04]">
                                    {activeGuild.logo_url && (
                                        <img src={activeGuild.logo_url} alt="" className="w-5 h-5 rounded object-cover" />
                                    )}
                                    <span className="text-xs font-semibold text-zinc-100 truncate max-w-[120px]">
                                        {activeGuild.name}
                                    </span>
                                    <div className="flex items-center gap-2 pl-2 border-l border-white/[0.06]">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                        <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-tighter italic">
                                            LIVE: {onlineCount}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {user ? (
                                <>
                                    <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-zinc-900/50 rounded-xl border border-white/[0.04] hover:bg-zinc-900 transition-all group">
                                        <Avatar user={user} size="md" className="group-hover:scale-105 transition-transform" />
                                        <div className="hidden sm:block">
                                            <div className="text-[14px] font-semibold text-zinc-200 group-hover:text-white transition-colors tracking-tight leading-none">
                                                {user?.profile?.family_name || user?.profile?.global_name || 'Участник'}
                                            </div>
                                        </div>
                                    </Link>

                                    {!isTMA && (
                                        <button
                                            onClick={logout}
                                            className="p-2.5 bg-zinc-900/50 rounded-lg border border-white/[0.04] text-zinc-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                                            title="Выйти"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </button>
                                    )}
                                </>
                            ) : (
                                <Link to="/login" className="px-4 py-2 bg-white text-zinc-900 text-xs font-bold rounded-lg uppercase tracking-widest hover:bg-zinc-200 transition-colors">
                                    Войти
                                </Link>
                            )}

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-3 bg-zinc-900 rounded-lg border border-zinc-800/50 text-zinc-500"
                            >
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-zinc-900 border-b border-zinc-800/50 p-4 space-y-2 animate-in slide-in-from-top duration-300">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                        flex items-center justify-between p-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all
                                        ${isActive
                                        ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20'
                                        : 'text-zinc-500 bg-zinc-950/50 border border-zinc-800/50'}
                                    `}
                            >
                                <div className="flex items-center gap-3">
                                    {link.icon}
                                    {link.label}
                                </div>
                                {link.badge && (
                                    <span className="min-w-[18px] h-[18px] flex items-center justify-center bg-rose-600 text-[8px] font-black text-white rounded-full border-2 border-zinc-950 not-italic">
                                        {link.badge}
                                    </span>
                                )}
                            </NavLink>
                        ))}
                    </div>
                )}
            </nav>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto relative">
                {children}
            </main>
            <Toaster />
        </div>
    );
};
