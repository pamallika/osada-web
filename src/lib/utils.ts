import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getMediaUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    
    const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1')
        .replace('/api/v1', '');
    
    return `${API_BASE}${url}`;
}
