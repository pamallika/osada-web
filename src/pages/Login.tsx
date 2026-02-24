import React from 'react';

export default function Login() {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

    const handleDiscordLogin = () => {
        window.location.href = `${API_URL}/auth/redirect/discord`;
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
            <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 text-center">
                <div className="mb-8">
                    <div className="w-20 h-20 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-4">
                        <span className="text-3xl">🏰</span>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Siege Architect</h1>
                    <p className="text-slate-400 mt-2">Система управления осадами</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={handleDiscordLogin}
                        className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <span>Войти через Discord</span>
                    </button>

                    <button
                        disabled
                        className="w-full bg-blue-500 opacity-50 text-white font-bold py-4 px-6 rounded-2xl cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        <span>Войти через Telegram</span>
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-500 leading-relaxed">
                    Авторизуясь, вы соглашаетесь с тем, что мы получим доступ к вашему ID и имени пользователя для синхронизации состава гильдии.
                </p>
            </div>
        </div>
    );
}