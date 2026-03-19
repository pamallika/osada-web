import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import InviteHandler from './pages/InviteHandler';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import EventListPage from './pages/EventListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import AuthCallback from './pages/AuthCallback';
import { Integrations } from './pages/Integrations';
import { useAuthStore } from './store/useAuthStore';
import { authApi } from './api/auth';
import { AuthGuard } from './components/AuthGuard';
import { GuestGuard } from './components/GuestGuard';
import { MainLayout } from './components/MainLayout';

function App() {
    const { token, isInitialLoading, setInitialLoading, setUser, setAuth, logout } = useAuthStore();

    useEffect(() => {
        const syncUser = async () => {
            // 1. Handle TMA Login
            const tma = (window as any).Telegram?.WebApp;
            if (tma?.initData && !token) {
                try {
                    const { token: tmaToken, user: tmaUser } = await authApi.loginViaTelegram({ initData: tma.initData });
                    setAuth(tmaToken, tmaUser);
                    tma.expand();
                    setInitialLoading(false);
                    return;
                } catch (error) {
                    console.error('TMA login failed:', error);
                }
            }

            // 2. Regular token sync
            if (!token) {
                setInitialLoading(false);
                return;
            }

            try {
                const userData = await authApi.getMe();
                setUser(userData);
            } catch (error: unknown) {
                console.error('Failed to sync user:', error);
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    logout();
                }
            } finally {
                setInitialLoading(false);
            }
        };

        syncUser();
    }, [token, setUser, setInitialLoading, setAuth, logout]);

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const isTMA = !!(window as any).Telegram?.WebApp?.initData;

    return (
        <BrowserRouter>
            <div className={`min-h-screen bg-zinc-950 text-zinc-300 ${isTMA ? 'safe-area-padding' : ''}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
                    <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/invite/:slug" element={<InviteHandler />} />

                    {/* Protected Routes WITH Global Navigation */}
                    <Route element={
                        <AuthGuard>
                            <MainLayout hideNav={isTMA}>
                                <Outlet />
                            </MainLayout>
                        </AuthGuard>
                    }>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/integrations" element={<Integrations />} />
                        <Route path="/events" element={<EventListPage />} />
                        <Route path="/events/:id" element={<EventDetailsPage />} />
                    </Route>

                    {/* Protected Routes WITHOUT Global Navigation */}
                    <Route path="/onboarding" element={
                        <AuthGuard>
                            <OnboardingPage />
                        </AuthGuard>
                    } />

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
