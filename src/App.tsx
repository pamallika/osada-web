import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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
import { useSyncUser } from './hooks/useSyncUser';
import { AuthGuard } from './components/AuthGuard';
import { GuestGuard } from './components/GuestGuard';
import { MainLayout } from './components/MainLayout';

function App() {
    const { token, isInitialLoading, setInitialLoading, setAuth, logout } = useAuthStore();
    const [tmaRedirectPath, setTmaRedirectPath] = useState<string | null>(null);
    const hasInitialized = useRef(false);

    const { syncUser } = useSyncUser();

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initApp = async () => {
            const tma = (window as any).Telegram?.WebApp;

            // 1. Theme and Expansion
            if (tma) {
                tma.expand();
            }

            // 2. TMA Auth
            if (tma?.initData) {
                try {
                    const { token: tmaToken, user: tmaUser } = await authApi.verifyTelegramTMA({ initData: tma.initData });
                    setAuth(tmaToken, tmaUser);

                    const startParam = tma.initDataUnsafe?.start_param;
                    if (startParam?.startsWith('event_')) {
                        const eventId = startParam.split('_')[1];
                        setTmaRedirectPath(`/events/${eventId}`);
                    }
                } catch (error: any) {
                    if (error.response?.status === 401 || error.response?.status === 404) {
                        console.log('TMA auth failed or unlinked, logging out');
                        logout();
                    } else {
                        console.error('TMA login failed:', error);
                    }
                }
            } else if (token) {
                // 3. Regular Sync (Non-TMA)
                await syncUser();
            }

            setInitialLoading(false);
        };

        initApp();
    }, []); // Empty dependencies to prevent re-execution on token change

    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }



    return (
        <BrowserRouter>
            <div className="min-h-screen bg-zinc-950 text-zinc-300">
                <Routes>
                    {/* High-priority redirect for TMA deep links */}
                    {tmaRedirectPath && <Route path="*" element={<Navigate to={tmaRedirectPath} replace />} />}
                    
                    {/* Public Routes */}
                    <Route path="/login" element={<GuestGuard><Login /></GuestGuard>} />
                    <Route path="/register" element={<GuestGuard><RegisterPage /></GuestGuard>} />

                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/invite/:slug" element={<InviteHandler />} />

                    {/* Protected Routes WITH Global Navigation */}
                    <Route element={
                        <AuthGuard>
                            <MainLayout>
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
