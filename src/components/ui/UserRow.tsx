import type { FC, ReactNode, DragEvent } from 'react';
import Avatar from './Avatar';
import { cn } from '../../lib/utils';
import { getBdoClassName } from '../../constants/bdo';

export interface UserLike {
    id?: number;
    user_id?: number;
    avatar_url?: string | null;
    family_name?: string | null;
    global_name?: string | null;
    char_class?: string | null;
    verification_status?: string | null;
    gear_source?: 'manual' | 'garmoth' | null;
    profile?: {
        avatar_url?: string | null;
        family_name?: string | null;
        global_name?: string | null;
        char_class?: string | null;
        verification_status?: string | null;
        gear_source?: 'manual' | 'garmoth' | null;
    } | null;
}

export interface UserRowProps {
    user: UserLike;
    size?: 'xs' | 'sm' | 'md';
    showAvatar?: boolean;
    showClass?: boolean;
    showVerification?: boolean;
    isLineThrough?: boolean;
    action?: ReactNode;
    draggable?: boolean;
    onDragStart?: (e: DragEvent) => void;
    onClick?: () => void;
    className?: string;
}

export const UserRow: FC<UserRowProps> = ({
    user,
    size = 'sm',
    showAvatar = true,
    showClass = true,
    showVerification = true,
    isLineThrough = false,
    action,
    draggable = false,
    onDragStart,
    onClick,
    className
}) => {
    const avatarUrl = user.avatar_url || user.profile?.avatar_url;
    const familyName = user.family_name || user.profile?.family_name;
    const globalName = user.global_name || user.profile?.global_name;
    const charClass = user.char_class || user.profile?.char_class;
    const verificationStatus = user.verification_status || user.profile?.verification_status;
    const gearSource = user.gear_source || user.profile?.gear_source;

    const displayName = familyName || globalName || 'Участник';
    const hasGlobalSubtitle = familyName && globalName && familyName !== globalName;
    const isVerified = showVerification && verificationStatus === 'verified';

    const sizeClasses = {
        xs: {
            padding: 'p-1.5 rounded-lg',
            title: 'text-xs',
            subtitle: 'text-[9px]',
            classTag: 'text-[10px]'
        },
        sm: {
            padding: 'p-2 rounded-xl',
            title: 'text-xs font-semibold',
            subtitle: 'text-[10px]',
            classTag: 'text-xs'
        },
        md: {
            padding: 'p-3 rounded-2xl',
            title: 'text-sm font-semibold',
            subtitle: 'text-xs',
            classTag: 'text-xs font-medium'
        }
    }[size];

    return (
        <div
            draggable={draggable}
            onDragStart={onDragStart}
            onClick={onClick}
            className={cn(
                "flex items-center justify-between gap-3 group transition-all border border-transparent",
                sizeClasses.padding,
                onClick && "cursor-pointer hover:bg-white/[0.04] hover:border-white/[0.06]",
                draggable && "cursor-grab active:cursor-grabbing",
                isLineThrough && "opacity-60",
                className
            )}
        >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {showAvatar && (
                    <Avatar
                        user={{
                            avatar_url: avatarUrl,
                            name: displayName,
                            profile: {
                                family_name: displayName,
                                global_name: globalName,
                                char_class: charClass
                            } as any
                        }}
                        size={size}
                        className={cn(
                            "shrink-0 ring-1 ring-white/10 group-hover:ring-violet-500/30 transition-colors",
                            isLineThrough && "grayscale-[0.5] group-hover:grayscale-0"
                        )}
                    />
                )}

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span
                            className={cn(
                                "truncate text-zinc-200 uppercase tracking-tight group-hover:text-violet-400 transition-colors",
                                sizeClasses.title,
                                isLineThrough && "line-through decoration-rose-900/50 text-zinc-400"
                            )}
                        >
                            {displayName}
                        </span>

                        {showClass && charClass && charClass !== 'Unknown' && (
                            <span className={cn("text-zinc-500 shrink-0 font-normal", sizeClasses.classTag)}>
                                ({getBdoClassName(charClass)})
                            </span>
                        )}

                        {gearSource === 'garmoth' && (
                            <span className="px-1 py-0.2 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[8px] font-bold uppercase tracking-wider shrink-0" title="Гир через Garmoth">
                                Garmoth
                            </span>
                        )}

                        {isVerified && (
                            <svg className="w-3 h-3 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>

                    {hasGlobalSubtitle && (
                        <span className={cn("text-zinc-500 truncate font-mono", sizeClasses.subtitle)}>
                            @{globalName}
                        </span>
                    )}
                </div>
            </div>

            {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>
    );
};
