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
import VerificationPage from './pages/VerificationPage';
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

    const [initError, setInitError] = useState<string | null>(null);
    const { syncUser } = useSyncUser();

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initApp = async () => {
            const tma = (window as any).Telegram?.WebApp;

            try {
                // 1. Theme and Expansion & Synchronous TMA Deep Link Check
                if (tma) {
                    tma.expand();

                    const startParam = tma.initDataUnsafe?.start_param;
                    if (startParam?.startsWith('event_')) {
                        const eventId = startParam.split('_')[1];
                        setTmaRedirectPath(`/events/${eventId}`);
                    } else {
                        setTmaRedirectPath('/dashboard');
                    }
                }

                // 2. TMA Silent Auth
                if (tma?.initData) {
                    try {
                        let authData;
                        try {
                            authData = await authApi.verifyTelegramTMA({ initData: tma.initData });
                        } catch (error: any) {
                            if (error.response?.status === 404) {
                                authData = await authApi.registerTelegramTMA({ initData: tma.initData });
                            } else {
                                throw error;
                            }
                        }

                        if (authData) {
                            setAuth(authData.token, authData.user);
                        }
                    } catch (error: any) {
                        console.error('TMA Silent Auth Failed:', error);
                        setInitError('Не удалось войти через Telegram. Попробуйте перезагрузить приложение.');
                    }
                } else if (token) {
                    // 3. Regular Sync (Non-TMA or linked accounts)
                    try {
                        await syncUser();
                    } catch (error) {
                        console.error('Profile sync failed:', error);
                        logout();
                    }
                }
            } catch (err) {
                console.error('Initial boot error:', err);
            } finally {
                setInitialLoading(false);
            }
        };

        initApp();
    }, []); // Empty dependencies to prevent re-execution on token change

    if (initError) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-rose-900/20 border border-rose-800/50 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚠️</span>
                </div>
                <h1 className="text-xl font-black text-zinc-100 uppercase tracking-tighter mb-2">Ошибка авторизации</h1>
                <p className="text-zinc-400 text-sm max-w-xs">{initError}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold py-3 px-8 rounded-xl border border-zinc-800 transition-all uppercase tracking-widest text-[10px]"
                >
                    Перезагрузить
                </button>
            </div>
        );
    }

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
                    {/* High-priority redirect for TMA deep links - only for root entry */}
                    {tmaRedirectPath && <Route path="/" element={<Navigate to={tmaRedirectPath} replace />} />}

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
                        <Route path="/verifications" element={<VerificationPage />} />
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
                    <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
