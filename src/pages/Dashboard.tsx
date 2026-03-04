import React, { useState } from 'react';
import { guildApi, type Guild } from '../api/guilds';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [guildName, setGuildName] = useState('');
    const [myGuild, setMyGuild] = useState<Guild | null>(null);
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            logout();
            navigate('/login');
        }
    };

    const handleCreateGuild = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!guildName.trim()) return;

        setLoading(true);
        try {
            const newGuild = await guildApi.create(guildName);
            setMyGuild(newGuild);
            setIsModalOpen(false);
            alert(`Гильдия "${newGuild.name}" успешно создана!`);
        } catch (error) {
            console.error(error);
            alert('Ошибка при создании гильдии. Проверь, запущен ли бэкенд и авторизован ли ты.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Управление</h1>
                    <p className="text-gray-500 mt-1">Siege Architect v1.0</p>
                </div>

                <div className="flex items-center gap-4">
                    <Link to="/profile" className="flex items-center gap-3 p-2 pr-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-indigo-500 transition-all group">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 overflow-hidden">
                            {user?.linked_accounts && user.linked_accounts.length > 0 && user.linked_accounts[0].avatar ? (
                                <img src={user.linked_accounts[0].avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <span className="font-bold">{user?.name?.charAt(0) || 'U'}</span>
                            )}
                        </div>
                        <div className="hidden sm:block">
                            <div className="text-sm font-bold group-hover:text-indigo-500 transition-colors">
                                {user?.linked_accounts && user.linked_accounts.length > 0 
                                    ? (user.linked_accounts[0].display_name || user.linked_accounts[0].username) 
                                    : user?.name || 'Профиль'}
                            </div>
                            <div className="text-xs text-gray-500">{user?.profile?.family_name || 'Данные не заполнены'}</div>
                        </div>
                    </Link>

                    <button 
                        onClick={handleLogout}
                        className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-sm"
                        title="Выйти"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Карточка гильдии */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    {myGuild ? (
                        <div>
                            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Ваша гильдия</span>
                            <h2 className="text-2xl font-bold mt-1">{myGuild.name}</h2>
                            <p className="text-gray-400 text-sm mb-4">slug: {myGuild.slug}</p>
                            <div className="flex gap-2">
                                <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 py-2 px-4 rounded-lg text-sm font-medium transition">
                                    Участники
                                </button>
                                <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition">
                                    Создать осаду
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-semibold mb-2">Создание гильдии</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">
                                Вы еще не состоите в гильдии. Создайте свою, чтобы начать.
                            </p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                            >
                                + Создать новую
                            </button>
                        </div>
                    )}
                </div>

                {/* Инвайт-ссылка (активна только если есть гильдия) */}
                <div className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 ${!myGuild && 'opacity-50'}`}>
                    <h2 className="text-xl font-semibold mb-2">Приглашение</h2>
                    <p className="text-gray-500 text-sm mb-4">
                        Генерация ссылки для вступления новых бойцов.
                    </p>
                    <button
                        disabled={!myGuild}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-xl transition-all disabled:bg-gray-300 dark:disabled:bg-gray-700"
                    >
                        Сгенерировать ссылку
                    </button>
                </div>
            </div>

            {/* Простейшее модальное окно */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <h2 className="text-2xl font-bold mb-4">Новая гильдия</h2>
                        <form onSubmit={handleCreateGuild}>
                            <input
                                autoFocus
                                type="text"
                                placeholder="Название гильдии"
                                className="w-full p-4 bg-gray-100 dark:bg-gray-900 rounded-2xl mb-4 outline-none focus:ring-2 ring-indigo-500 transition-all"
                                value={guildName}
                                onChange={(e) => setGuildName(e.target.value)}
                            />
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 text-gray-500 font-medium"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50"
                                >
                                    {loading ? 'Создание...' : 'Создать'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}