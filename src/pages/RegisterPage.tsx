import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { useTelegramAuth } from '../hooks/useTelegramAuth';

const RegisterPage = () => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const { setAuth } = useAuthStore();
    const { startDeepLinkAuth, isLoading: isTgAppLoading, error: tgAppError } = useTelegramAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        password_confirmation: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const displayError = tgAppError || error;

    const handleDiscordLogin = () => {
        window.location.href = `${API_URL}/auth/redirect/discord`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.password_confirmation) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        try {
            const data = await authApi.register({
                email: formData.email,
                password: formData.password,
                password_confirmation: formData.password_confirmation
            });
            setAuth(data.token, data.user);
            navigate('/onboarding');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden select-none">
            {/* Ambient glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-[400px] h-[300px] bg-indigo-600/8 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-zinc-900/60 backdrop-blur-2xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl shadow-black/50">
                    <div className="text-center mb-8">
                        <div className="inline-flex w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/20 items-center justify-center mb-5 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                            <span className="text-2xl">🏰</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-400">
                            SAGE
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1.5">Регистрация нового профиля</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {displayError && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-medium flex items-center gap-3 animate-shake">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                {displayError}
                            </div>
                        )}

                        <div>
                            <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
                            />
                        </div>

                        <div className="pt-2 space-y-3">
                            <p className="text-[10px] text-zinc-700 uppercase tracking-wider ml-1">Создайте пароль</p>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Пароль</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Минимум 8 символов"
                                    className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 ml-1">Подтверждение</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password_confirmation}
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    placeholder="Повторите пароль"
                                    className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-3 rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-zinc-400/30 border-t-zinc-900 rounded-full animate-spin" />
                                    Создание...
                                </div>
                            ) : 'Создать аккаунт'}
                        </button>
                    </form>

                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-white/[0.06]" />
                        <span className="text-[11px] text-zinc-600 whitespace-nowrap px-1">или зарегистрироваться через</span>
                        <div className="flex-1 h-px bg-white/[0.06]" />
                    </div>

                    <div className="space-y-2.5">
                        <button
                            onClick={handleDiscordLogin}
                            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 hover:text-indigo-200 text-sm font-medium transition-all duration-200"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                            </svg>
                            Discord
                        </button>

                        <button
                            onClick={startDeepLinkAuth}
                            disabled={isTgAppLoading || loading}
                            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/30 hover:border-sky-500/50 text-sky-300 hover:text-sky-200 text-sm font-medium transition-all duration-200"
                        >
                            {isTgAppLoading ? (
                                <div className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.17 13.5l-2.965-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.983.059z"/>
                                    </svg>
                                    Telegram App
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-zinc-600">
                            Уже есть аккаунт?{' '}
                            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
                                Войти в систему
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
