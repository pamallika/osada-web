import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AuthCallback from './pages/AuthCallback';
import { useAuthStore } from './store/useAuthStore';

function App() {
    const token = useAuthStore((state) => state.token);

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

                    {/* Редирект по умолчанию */}
                    <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;