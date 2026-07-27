import { FC, useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Skeleton } from './Skeleton';

interface AuthImageProps {
    src: string;
    alt?: string;
    className?: string;
    onClick?: () => void;
}

export const AuthImage: FC<AuthImageProps> = ({
    src,
    alt = 'Attachment',
    className = '',
    onClick,
}) => {
    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        if (!src) {
            setIsLoading(false);
            setIsError(true);
            return;
        }

        let isMounted = true;
        let createdUrl: string | null = null;
        setIsLoading(true);
        setIsError(false);

        apiClient.get(src, { responseType: 'blob' })
            .then((response) => {
                if (!isMounted) return;
                const blob = new Blob([response.data], { type: response.headers['content-type'] || 'image/webp' });
                createdUrl = URL.createObjectURL(blob);
                setObjectUrl(createdUrl);
                setIsLoading(false);
            })
            .catch((err) => {
                if (!isMounted) return;
                console.error('Failed to load authenticated image:', err);
                setIsError(true);
                setIsLoading(false);
            });

        return () => {
            isMounted = false;
            if (createdUrl) {
                URL.revokeObjectURL(createdUrl);
            }
        };
    }, [src]);

    if (isLoading) {
        return <Skeleton className={className} />;
    }

    if (isError || !objectUrl) {
        return (
            <div className={`bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 text-xs ${className}`}>
                <span>⚠️ Не удалось загрузить</span>
            </div>
        );
    }

    return (
        <img
            src={objectUrl}
            alt={alt}
            className={className}
            onClick={onClick}
        />
    );
};
