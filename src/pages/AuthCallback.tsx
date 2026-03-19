import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            const error = searchParams.get('error');

            if (error) {
                console.error('Auth error:', error);
                navigate(`/login?error=${error}`, { replace: true });
                return;
            }

            if (token) {
                try {
                    localStorage.setItem('siege-token', token);
                    let userData;

                    const tmaLinkDiscord = localStorage.getItem('siege-tma-link-discord');
                    const tmaInitData = localStorage.getItem('siege-tma-init-data');

                    if (tmaLinkDiscord === 'true' && tmaInitData) {
                        userData = await authApi.linkTelegramTMA({ initData: tmaInitData });
                        
                        localStorage.removeItem('siege-tma-link-discord');
                        localStorage.removeItem('siege-tma-init-data');
                    } else {
                        userData = await authApi.getMe();
                    }
                    
                    setAuth(token, userData);

                    // Check for start parameters redirect (Deep link)
                    const eventRedirect = localStorage.getItem('siege-tma-start-redirect');
                    if (eventRedirect) {
                        localStorage.removeItem('siege-tma-start-redirect');
                        navigate(eventRedirect, { replace: true });
                    } else if (userData.profile?.family_name) {
                        navigate('/dashboard', { replace: true });
                    } else {
                        navigate('/profile', { replace: true });
                    }
                } catch (err) {
                    console.error('Failed to fetch user data in callback:', err);
                    navigate('/login?error=fetch_user_failed', { replace: true });
                }
            } else {
                navigate('/login?error=no_token', { replace: true });
            }
        };

        handleCallback();
    }, [navigate, setAuth, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white font-sans">
            <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 border-4 border-violet-700 border-t-transparent rounded-2xl animate-spin shadow-xl shadow-violet-900/20"></div>
                <div className="text-center">
                    <p className="text-xl font-black uppercase italic tracking-widest text-zinc-100">Синхронизация...</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mt-2">Завершаем процесс авторизации</p>
                </div>
            </div>
        </div>
    );
}
