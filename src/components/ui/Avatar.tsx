import React from 'react';
import type { User } from '../../api/types';

interface AvatarProps {
    user?: Partial<User> | null;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ user, size = 'md', className = '' }) => {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[8px]',
        sm: 'w-8 h-8 text-[10px]',
        md: 'w-10 h-10 text-xs',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
        '2xl': 'w-32 h-32 text-4xl',
    };

    const avatarUrl = user?.avatar_url || 
        user?.linked_accounts?.find(a => a.provider === 'discord')?.avatar ||
        user?.linked_accounts?.find(a => a.provider === 'telegram')?.avatar;

    const displayName = user?.profile?.family_name || user?.name || 'U';
    const initial = displayName.charAt(0).toUpperCase();

    // Generate a consistent but distinct background color/gradient based on name for fallback
    const getFallbackStyle = (name: string) => {
        const colors = [
            'from-violet-600/20 to-indigo-600/20 text-violet-400',
            'from-emerald-600/20 to-teal-600/20 text-emerald-400',
            'from-rose-600/20 to-orange-600/20 text-rose-400',
            'from-sky-600/20 to-blue-600/20 text-sky-400',
            'from-amber-600/20 to-yellow-600/20 text-amber-400'
        ];
        const index = name.length % colors.length;
        return colors[index];
    };

    const fallbackColors = getFallbackStyle(displayName);

    if (avatarUrl) {
        return (
            <div className={`${sizeClasses[size]} rounded-2xl overflow-hidden border border-zinc-800/50 flex-shrink-0 bg-zinc-950 shadow-inner group-hover/avatar:border-violet-500/30 transition-colors ${className}`}>
                <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // If image fails to load, hide it to show fallback (if we had a state)
                        // For now we just let it be, but ideally we'd handle 404s
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.classList.add('bg-zinc-900');
                    }}
                />
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-2xl border border-zinc-800/50 bg-gradient-to-br ${fallbackColors} flex items-center justify-center font-black uppercase italic flex-shrink-0 shadow-sm ${className}`}>
            {initial}
        </div>
    );
};

export default Avatar;
