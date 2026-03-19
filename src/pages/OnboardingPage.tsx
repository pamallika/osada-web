import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';

export default function OnboardingPage() {
    const { setUser } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        family_name: '',
        global_name: '',
    });

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.family_name.trim()) {
            setError('Игровой никнейм (Фамилия) обязателен');
            return;
        }

        setLoading(true);
        try {
            const updatedUser = await authApi.updateProfile(formData as any);
            setUser(updatedUser);
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка при обновлении профиля');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4 font-sans select-none animate-in fade-in duration-700">
            <div className="bg-zinc-900 p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-zinc-800/50 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-700/10 rounded-full blur-3xl"></div>
                
                <div className="text-center mb-10 relative">
                    <div className="w-20 h-20 bg-violet-700 rounded-3xl mx-auto flex items-center justify-center shadow-lg shadow-violet-900/20 mb-6 border border-violet-600/20">
                        <span className="text-3xl italic font-black text-white">S</span>
                    </div>
                    <h1 className="text-3xl font-black text-zinc-100 mb-3 tracking-tight italic uppercase">ПОЧТИ ГОТОВО</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Введите ваш игровой никнейм (Фамилию), <br /> чтобы получить доступ к системе SAGE.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    {error && (
                        <div className="bg-rose-900/20 border border-rose-800/50 text-rose-400 p-4 rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center gap-3">
                            <span className="text-lg">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                            Игровая Фамилия
                        </label>
                        <input
                            type="text"
                            value={formData.family_name}
                            onChange={(e) => setFormData({ ...formData, family_name: e.target.value })}
                            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-800 shadow-inner"
                            placeholder="Напр. Villy"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                            Глобальный никнейм (необязательно)
                        </label>
                        <input
                            type="text"
                            value={formData.global_name}
                            onChange={(e) => setFormData({ ...formData, global_name: e.target.value })}
                            className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-2xl outline-none focus:border-violet-700 transition-all text-zinc-100 font-bold placeholder:text-zinc-800 shadow-inner"
                            placeholder="Напр. Villy_Global"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-5 px-6 rounded-2xl transition-all active:scale-[0.98] shadow-xl shadow-violet-900/20 uppercase tracking-[0.2em] text-[10px] italic"
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Загрузка...</span>
                            </div>
                        ) : 'Завершить регистрацию'}
                    </button>
                </form>
            </div>
        </div>
    );
}
