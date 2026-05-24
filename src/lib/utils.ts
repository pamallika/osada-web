import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getMediaUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    return url;
}
