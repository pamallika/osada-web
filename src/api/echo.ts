import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// @ts-ignore
window.Pusher = Pusher;

export const initEcho = (token: string | null) => {
    if (!token) return null;

    return new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST,
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
        wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
        forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
        auth: {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });
};

let echoInstance: Echo | null = null;

export const getEcho = () => {
    if (!echoInstance) {
        const token = localStorage.getItem('siege-token');
        echoInstance = initEcho(token);
    }
    return echoInstance;
};

export const destroyEcho = () => {
    if (echoInstance) {
        echoInstance.disconnect();
        echoInstance = null;
    }
};
