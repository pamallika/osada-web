import React, { useEffect, useRef } from 'react';

interface Props {
    botName: string;
    onAuth: (user: any) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: string;
    showUserPhoto?: boolean;
}

declare global {
    interface Window {
        onTelegramAuth: (user: any) => void;
    }
}

export const TelegramLoginButton: React.FC<Props> = ({ 
    botName, 
    onAuth, 
    buttonSize = 'large',
    cornerRadius,
    requestAccess = 'write',
    showUserPhoto = true
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Define global callback
        window.onTelegramAuth = (user: any) => {
            onAuth(user);
        };

        // Create script element
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', buttonSize);
        if (cornerRadius !== undefined) {
            script.setAttribute('data-radius', cornerRadius.toString());
        }
        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        script.setAttribute('data-request-access', requestAccess);
        if (!showUserPhoto) {
            script.setAttribute('data-userpic', 'false');
        }
        script.async = true;

        // Append to container
        if (containerRef.current) {
            containerRef.current.innerHTML = ''; // Ensure container is empty
            containerRef.current.appendChild(script);
        }

        return () => {
            // Cleanup
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            delete (window as any).onTelegramAuth;
        };
    }, [botName, onAuth, buttonSize, cornerRadius, requestAccess, showUserPhoto]);

    return <div ref={containerRef} className="flex justify-center" />;
};
