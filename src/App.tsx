import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AuthCallback from './pages/AuthCallback';
import { useAuthStore } from './store/useAuthStore';
import { authApi } from './api/auth';

function App() {
    const { token, isInitialLoading, setInitialLoading, setUser, logout } = useAuthStore();

    useEffect(() => {
        const syncUser = async () => {
            if (!token) {
                setInitialLoading(false);
                return;
            }

            try {
                const userData = await authApi.getMe();
                setUser(userData);
            } catch (error: any) {
                console.error('Failed to sync user:', error);
                if (error.response?.status === 401) {
                    logout();
                }
            } finally {
                setInitialLoading(false);
            }
        };

        syncUser();
    }, [token, setUser, setInitialLoading, logout]);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
                <Routes>
                    {/* Страница логина */}
                    <Route path="/login" element={!token ? <Login /> : <Navigate to="/dashboard" />} />

                    {/* Страница-обработчик ответа от бэкенда */}
                    <Route path="/auth/callback" element={<AuthCallback />} />

                    {/* Защищенная панель управления */}
                    <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />

                    {/* Профиль пользователя */}
                    <Route path="/profile" element={token ? <Profile /> : <Navigate to="/login" />} />

                    {/* Редирект по умолчанию */}
                    <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;