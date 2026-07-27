import type { FC } from 'react';
import { useState } from 'react';
import type { ChatMessage } from '../../api/types';
import Avatar from '../ui/Avatar';
import { AuthImage } from '../ui/AuthImage';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
    onEdit?: (message: ChatMessage) => void;
    onDelete?: (messageId: number) => void;
}

export const MessageBubble: FC<MessageBubbleProps> = ({
    message,
    isOwn,
    onEdit,
    onDelete,
}) => {
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const [showMenu, setShowMenu] = useState(false);

    const formattedTime = message.created_at
        ? format(new Date(message.created_at), 'HH:mm', { locale: ru })
        : '';

    const mediaList = message.media_urls && message.media_urls.length > 0
        ? message.media_urls
        : (message.media_url ? [message.media_url] : []);

    const handleCopy = () => {
        if (message.content) {
            navigator.clipboard.writeText(message.content);
            setShowMenu(false);
        }
    };

    if (message.is_deleted) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} my-1`}>
                <div className="max-w-[75%] px-4 py-2 rounded-2xl bg-zinc-900/40 border border-white/[0.04] text-zinc-500 text-xs italic">
                    Сообщение удалено
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-end gap-2.5 my-1.5 group/bubble ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar for non-own messages */}
            {!isOwn && (
                <Avatar
                    user={{
                        avatar_url: message.user?.avatar_url,
                        name: message.user?.family_name || message.user?.name || 'Участник',
                        profile: { family_name: message.user?.family_name } as any
                    }}
                    size="xs"
                    className="shrink-0 mb-1 ring-1 ring-white/10"
                />
            )}

            <div className={`relative max-w-[85%] sm:max-w-[75%] group/item ${isOwn ? 'items-end' : 'items-start'}`}>
                {/* Author Name */}
                {!isOwn && (
                    <span className="text-[10px] font-semibold text-zinc-400 mb-1 block px-1">
                        {message.user?.family_name || message.user?.name || 'Участник'}
                    </span>
                )}

                {/* Bubble Container */}
                <div
                    className={`relative p-3 rounded-2xl border transition-all ${
                        isOwn
                            ? 'bg-violet-950/50 border-violet-500/30 text-zinc-100 rounded-br-xs'
                            : 'bg-zinc-900/80 border-white/[0.08] text-zinc-200 rounded-bl-xs'
                    }`}
                >
                    {/* Media Grid Content */}
                    {mediaList.length > 0 && (
                        <div className={`mb-2 grid gap-1.5 ${
                            mediaList.length === 1
                                ? 'grid-cols-1'
                                : mediaList.length === 2
                                ? 'grid-cols-2'
                                : 'grid-cols-2 sm:grid-cols-3'
                        }`}>
                            {mediaList.map((url, idx) => (
                                <div key={idx} className="overflow-hidden rounded-xl border border-white/10 bg-black/40">
                                    <AuthImage
                                        src={url}
                                        alt={`Attachment ${idx + 1}`}
                                        className={`w-full object-cover cursor-pointer hover:scale-[1.02] transition-transform ${
                                            mediaList.length === 1 ? 'max-h-72' : 'h-28 sm:h-36'
                                        }`}
                                        onClick={() => setLightboxUrl(url)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Text Content */}
                    {message.content && (
                        <p className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                            {message.content}
                        </p>
                    )}

                    {/* Footer: Time & Edited tag & Menu button */}
                    <div className={`flex items-center gap-1.5 mt-1 text-[9px] text-zinc-400 select-none ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        {message.is_edited && <span className="italic">(изменено)</span>}
                        <span>{formattedTime}</span>

                        {/* Action Dots */}
                        <div className="relative ml-1">
                            <button
                                type="button"
                                onClick={() => setShowMenu(!showMenu)}
                                className="opacity-0 group-hover/bubble:opacity-100 p-0.5 hover:text-white transition-opacity"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {showMenu && (
                                <div
                                    className={`absolute bottom-full mb-1 z-30 w-32 py-1 bg-zinc-950 border border-zinc-800 rounded-xl shadow-xl backdrop-blur-xl ${
                                        isOwn ? 'right-0' : 'left-0'
                                    }`}
                                >
                                    {message.content && (
                                        <button
                                            onClick={handleCopy}
                                            className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                        >
                                            Копировать
                                        </button>
                                    )}
                                    {isOwn && onEdit && message.type !== 'image' && (
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                onEdit(message);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs text-zinc-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                        >
                                            Редактировать
                                        </button>
                                    )}
                                    {isOwn && onDelete && (
                                        <button
                                            onClick={() => {
                                                setShowMenu(false);
                                                onDelete(message.id);
                                            }}
                                            className="w-full px-3 py-1.5 text-left text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                                        >
                                            Удалить
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800"
                        onClick={() => setLightboxUrl(null)}
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <AuthImage
                        src={lightboxUrl}
                        alt="Enlarged"
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
                    />
                </div>
            )}
        </div>
    );
};
