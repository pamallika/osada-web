import type { FC } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import type { Chat } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';
import { CreateChatModal } from '../components/chat/CreateChatModal';
import { Skeleton } from '../components/Skeleton';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const ChatListPage: FC = () => {
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: chats, isLoading, refetch } = useQuery({
        queryKey: ['chats'],
        queryFn: () => chatApi.getChats(),
        refetchInterval: 15000,
    });

    const getChatTitle = (chat: Chat) => {
        if (chat.type === 'system') return 'Общий чат';
        if (chat.name) return chat.name;
        return 'Приватный чат';
    };

    const getFormattedTime = (dateStr?: string | null) => {
        if (!dateStr) return '';
        try {
            return format(new Date(dateStr), 'HH:mm', { locale: ru });
        } catch {
            return '';
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6 select-none animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white font-inter">Чаты</h1>
                    <p className="text-xs md:text-sm text-zinc-500 mt-1 font-inter">Системные анонсы и приватные обсуждения</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-95 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Создать чат</span>
                </button>
            </div>

            {/* Chat List Card */}
            <div className="bg-zinc-900/40 backdrop-blur-xl rounded-2xl border border-white/[0.06] overflow-hidden shadow-2xl ring-1 ring-white/[0.04]">
                {isLoading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex items-center gap-4 p-3">
                                <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-36" />
                                    <Skeleton className="h-3 w-48" />
                                </div>
                                <Skeleton className="h-4 w-12" />
                            </div>
                        ))}
                    </div>
                ) : !chats || chats.length === 0 ? (
                    <div className="py-16 text-center text-zinc-500 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-xl">💬</div>
                        <p className="text-sm font-medium">Чатов пока нет</p>
                        <p className="text-xs text-zinc-600">Создайте диалог с участниками гильдии</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {chats.map(chat => {
                            const title = getChatTitle(chat);
                            const lastMessageTime = getFormattedTime(chat.last_message?.created_at || chat.updated_at);
                            const isSystem = chat.type === 'system';

                            return (
                                <div
                                    key={chat.id}
                                    onClick={() => navigate(`/chats/${chat.id}`)}
                                    className="flex items-center justify-between gap-4 p-4 hover:bg-white/[0.025] transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                                        {/* Avatar / Icon */}
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${
                                            isSystem
                                                ? 'bg-violet-950/60 border-violet-500/30 text-violet-400'
                                                : 'bg-zinc-950 border-white/10 text-zinc-300'
                                        }`}>
                                            {isSystem ? (
                                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                                </svg>
                                            ) : (
                                                <span className="text-base font-black uppercase">
                                                    {title[0]}
                                                </span>
                                            )}
                                        </div>

                                        {/* Title & Preview */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm font-bold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                                                    {title}
                                                </h3>
                                                {lastMessageTime && (
                                                    <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                                                        {lastMessageTime}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-1">
                                                <p className="text-xs text-zinc-500 truncate">
                                                    {chat.last_message ? (
                                                        <>
                                                            <span className="text-zinc-400 font-medium">
                                                                {chat.last_message.user_id === currentUser?.id ? 'Вы: ' : `${chat.last_message.user?.family_name || 'Участник'}: `}
                                                            </span>
                                                            {chat.last_message.is_deleted ? (
                                                                <span className="italic text-zinc-600">Сообщение удалено</span>
                                                            ) : (
                                                                chat.last_message.content || (chat.last_message.media_url ? '📷 Изображение' : '')
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="italic text-zinc-600">Нет сообщений</span>
                                                    )}
                                                </p>
                                                {chat.unread_count > 0 && (
                                                    <span className="min-w-[20px] h-[20px] px-1.5 flex items-center justify-center bg-violet-600 text-[10px] font-black text-white rounded-full border border-violet-400/30 shrink-0">
                                                        {chat.unread_count}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create Chat Modal */}
            <CreateChatModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={(chatId) => {
                    refetch();
                    navigate(`/chats/${chatId}`);
                }}
            />
        </div>
    );
};
