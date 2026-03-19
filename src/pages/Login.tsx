import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { useTelegramAuth } from '../hooks/useTelegramAuth';

export default function Login() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    const { setAuth } = useAuthStore();
    const { startDeepLinkAuth, isLoading: isTgAppLoading, error: tgAppError } = useTelegramAuth();
    const navigate = useNavigate();

    const tma = (window as any).Telegram?.WebApp;

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [tgLoading, setTgLoading] = useState(false);

    const handleTelegramClick = async () => {
        if (tma?.initData) {
            setTgLoading(true);
            setError(null);
            try {
                // Прямая авторизация через TMA
                const data = await authApi.verifyTelegramTMA({ initData: tma.initData });
                setAuth(data.token, data.user);
                navigate('/dashboard');
            } catch (err: any) {
                if (err.response?.status === 404) {
                    // ЕСЛИ аккаунт не найден — авто-регистрация
                    try {
                        const regData = await authApi.registerTelegramTMA({ initData: tma.initData });
                        setAuth(regData.token, regData.user);
                        navigate('/dashboard');
                    } catch (regErr: any) {
                        setError(regErr.response?.data?.message || 'Ошибка автоматической регистрации');
                    }
                } else {
                    setError(err.response?.data?.message || 'Ошибка входа через Telegram');
                }
            } finally {
                setTgLoading(false);
            }
        } else {
            // Веб-версия: Диплинк
            startDeepLinkAuth();
        }
    };

    const displayError = tgAppError || error;

    const handleDiscordLogin = () => {
        window.location.href = `${API_URL}/auth/redirect/discord`;
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const data = await authApi.login(formData);
            setAuth(data.token, data.user);
            navigate('/dashboard');
        } catch (err: unknown) {
            console.error(err);
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || 'Ошибка входа' 
                : 'Неверный email или пароль';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4 md:p-6 select-none">
            <div className="bg-zinc-900 p-8 md:p-10 rounded-[2rem] shadow-2xl w-full max-w-md border border-zinc-800/50 text-center relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-700/5 rounded-full blur-3xl"></div>
                
                <div className="mb-10 relative">
                    <div className="w-16 h-16 bg-violet-700/20 border border-violet-700/30 rounded-2xl mx-auto flex items-center justify-center mb-4">
                        <span className="text-2xl text-violet-400">🏰</span>
                    </div>
                    <h1 className="text-3xl font-black text-zinc-100 tracking-tighter uppercase italic">SAGE</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Система управления событиями</p>
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-5 text-left mb-8 relative">
                    {displayError && (
                        <div className="bg-rose-900/20 border border-rose-800/50 text-rose-100 p-4 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                            <span className="text-base">⚠️</span>
                            {displayError}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-zinc-100 font-bold focus:outline-none focus:border-violet-700 transition-all placeholder:text-zinc-700"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Пароль</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-5 py-3 text-zinc-100 font-bold focus:outline-none focus:border-violet-700 transition-all placeholder:text-zinc-700"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-4 px-6 rounded-xl transition-all uppercase tracking-widest text-[10px] italic shadow-lg shadow-violet-900/10"
                    >
                        {loading ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                        ) : 'Войти в систему'}
                    </button>
                </form>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-800/50"></div>
                    </div>
                    <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                        <span className="px-3 bg-zinc-900 text-zinc-600">Или авторизация через</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={handleDiscordLogin}
                        className="bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30 font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] italic w-full"
                    >
                        Вход через Discord
                    </button>

                    <button
                        onClick={handleTelegramClick}
                        disabled={isTgAppLoading || loading || tgLoading}
                        className="bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 font-black py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] italic w-full"
                    >
                        {(isTgAppLoading || tgLoading) ? (
                            <div className="w-4 h-4 border-2 border-[#229ED9]/30 border-t-[#229ED9] rounded-full animate-spin"></div>
                        ) : (
                            <>Вход через Telegram</>
                        )}
                    </button>
                </div>

                <div className="mt-10">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="text-violet-400 hover:text-violet-300 transition-colors">
                            Создать профиль
                        </Link>
                    </p>
                </div>

                <p className="mt-8 text-[9px] text-zinc-600 font-medium leading-relaxed uppercase tracking-tighter max-w-[280px] mx-auto opacity-50">
                    Авторизуясь, вы соглашаетесь с обработкой ID для синхронизации состава гильдии.
                </p>
            </div>
        </div>
    );
}
