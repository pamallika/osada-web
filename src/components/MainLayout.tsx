import type { FC, ReactNode } from 'react';
import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useSyncUser } from '../hooks/useSyncUser';
import { usePresence } from '../hooks/usePresence';
import { Toaster } from './Toaster';

interface MainLayoutProps {
    children: ReactNode;
}

export const MainLayout: FC<MainLayoutProps> = ({ children }) => {
    const { user, logout, isTMA } = useAuthStore();
    const { syncUser } = useSyncUser();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { onlineCount } = usePresence();

    const activeMembership = user?.guild_memberships?.find(m => m.status === 'active');
    const activeGuild = activeMembership?.guild;

    const navLinks = [
        { to: '/dashboard', label: 'Дашборд', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )},
        { to: '/events', label: 'События', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        )},
        { to: '/profile', label: 'Профиль', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        )},
    ];

    if (activeMembership && ['creator', 'admin', 'officer'].includes(activeMembership.role)) {
        navLinks.splice(2, 0, { to: '/integrations', label: 'Интеграции', icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 00-1 1v1a2 2 0 11-4 0v-1a1 1 0 00-1-1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            </svg>
        )});
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans flex flex-col select-none pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-[90] bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50 shadow-2xl">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex items-center justify-between h-20">
                            {/* Logo and Brand */}
                            <div className="flex items-center gap-10">
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => syncUser()}
                                    className="flex items-center group"
                                >
                                    <span className="text-3xl font-black tracking-tighter uppercase italic group-hover:text-violet-500 transition-colors text-zinc-100">SAGE</span>
                                </Link>

                                {/* Desktop Menu */}
                                <div className="hidden md:flex items-center gap-1 p-1 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                                    {navLinks.map((link) => (
                                        <NavLink
                                            key={link.to}
                                            to={link.to}
                                            className={({ isActive }) => `
                                                flex items-center gap-2 px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] italic transition-all
                                                ${isActive 
                                                    ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' 
                                                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
                                            `}
                                        >
                                            {link.label}
                                        </NavLink>
                                    ))}
                                </div>
                            </div>

                            {/* Right side: Guild and Profile */}
                            <div className="flex items-center gap-4">
                                {activeGuild && (
                                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-zinc-950/50 rounded-lg border border-zinc-800/50">
                                        {activeGuild.logo_url && (
                                            <img src={activeGuild.logo_url} alt="" className="w-5 h-5 rounded-md object-cover" />
                                        )}
                                        <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest truncate max-w-[120px]">
                                            {activeGuild.name}
                                        </span>
                                        <div className="flex items-center gap-2 pl-2 border-l border-zinc-800">
                                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                                            <span className="text-[9px] font-black text-emerald-500/80 uppercase tracking-tighter italic">
                                                LIVE: {onlineCount}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <Link to="/profile" className="flex items-center gap-3 p-1.5 pr-4 bg-zinc-900 rounded-xl border border-zinc-800/50 hover:border-violet-700 transition-all group">
                                    <div className="w-9 h-9 rounded-lg bg-violet-700/20 border border-violet-700/30 flex items-center justify-center text-violet-400 overflow-hidden group-hover:scale-105 transition-transform">
                                        {user?.linked_accounts?.find(acc => acc.avatar)?.avatar ? (
                                            <img src={user.linked_accounts.find(acc => acc.avatar)!.avatar!} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="font-black text-sm italic uppercase">
                                                {(user?.profile?.family_name || user?.profile?.global_name || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="hidden sm:block">
                                        <div className="text-[10px] font-black text-zinc-100 group-hover:text-violet-400 transition-colors uppercase italic tracking-tight leading-none">
                                            {user?.profile?.family_name || user?.profile?.global_name || 'Участник'}
                                        </div>
                                    </div>
                                </Link>

                                {!isTMA && (
                                    <button 
                                        onClick={logout}
                                        className="p-3 bg-zinc-900 rounded-lg border border-zinc-800/50 text-rose-800 hover:bg-rose-800 hover:text-rose-100 transition-all group"
                                        title="Выйти"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
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
                                        flex items-center gap-3 p-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] italic transition-all
                                        ${isActive 
                                            ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/20' 
                                            : 'text-zinc-500 bg-zinc-950/50 border border-zinc-800/50'}
                                    `}
                                >
                                    {link.icon}
                                    {link.label}
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
