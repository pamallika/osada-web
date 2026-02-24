import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            setAuth(token);

            navigate('/dashboard');
        } else {
            navigate('/login?error=no_token');
        }
    }, [navigate, setAuth, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900 text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium">Завершаем авторизацию...</p>
            </div>
        </div>
    );
}