import type { FC } from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chat';
import type { ChatMessage, ChatDetail } from '../api/types';
import { useAuthStore } from '../store/useAuthStore';
import { getEcho } from '../api/echo';
import { MessageBubble } from '../components/chat/MessageBubble';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatInfoDrawer } from '../components/chat/ChatInfoDrawer';
import { Skeleton } from '../components/Skeleton';
import { toast } from '../components/Toaster';

export const ChatRoomPage: FC = () => {
    const { id } = useParams<{ id: string }>();
    const chatId = Number(id);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuthStore();

    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [isLoadingOlder, setIsLoadingOlder] = useState(false);

    const [editingMessage, setEditingMessage] = useState<ChatMessage | null>(null);
    const [isInfoOpen, setIsInfoOpen] = useState(false);

    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const isAtBottomRef = useRef<boolean>(true);

    // Fetch Chat Details
    const { data: chat, isLoading: isChatLoading, isError } = useQuery<ChatDetail>({
        queryKey: ['chat', chatId],
        queryFn: () => chatApi.getChat(chatId),
        enabled: !!chatId && !isNaN(chatId),
    });

    // Check scroll position
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        isAtBottomRef.current = scrollHeight - (scrollTop + clientHeight) < 80;

        // Load older messages when scrolling to top
        if (scrollTop < 50 && hasMore && nextCursor && !isLoadingOlder) {
            loadOlderMessages();
        }
    };

    // Auto-scroll to bottom
    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTo({
                top: messagesContainerRef.current.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    };

    // Initial Messages Fetch
    useEffect(() => {
        if (!chatId || isNaN(chatId)) return;

        chatApi.getChatMessages(chatId)
            .then(res => {
                const fetchedMessages = [...res.messages].reverse(); // API returns DESC, reverse for UI ASC
                setMessages(fetchedMessages);
                setHasMore(res.has_more);
                setNextCursor(res.next_cursor);

                // Mark read for latest message
                if (fetchedMessages.length > 0) {
                    const lastId = fetchedMessages[fetchedMessages.length - 1].id;
                    chatApi.markChatRead(chatId, lastId).catch(console.error);
                }

                setTimeout(() => scrollToBottom(false), 100);
            })
            .catch(err => {
                toast.error('Не удалось загрузить сообщения');
                console.error(err);
            });
    }, [chatId]);

    // Load Older Messages (Cursor-based)
    const loadOlderMessages = async () => {
        if (!nextCursor || isLoadingOlder) return;

        setIsLoadingOlder(true);
        const container = messagesContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;

        try {
            const res = await chatApi.getChatMessages(chatId, nextCursor);
            const olderMessages = [...res.messages].reverse();
            setMessages(prev => [...olderMessages, ...prev]);
            setHasMore(res.has_more);
            setNextCursor(res.next_cursor);

            // Maintain scroll position after prepending
            setTimeout(() => {
                if (container) {
                    container.scrollTop = container.scrollHeight - previousScrollHeight;
                }
            }, 50);
        } catch (err) {
            console.error('Failed to load older messages:', err);
        } finally {
            setIsLoadingOlder(false);
        }
    };

    // WebSocket Integration
    useEffect(() => {
        if (!chatId || isNaN(chatId)) return;

        const echo = getEcho();
        if (!echo) return;

        const channel = echo.private(`chat.${chatId}`);

        // Listen for new messages
        channel.listen('.NewChatMessage', (e: { chat_id: number; message: ChatMessage }) => {
            if (e.chat_id === chatId) {
                setMessages(prev => {
                    if (prev.some(m => m.id === e.message.id)) return prev;
                    return [...prev, e.message];
                });

                // Mark read if user is viewing chat
                chatApi.markChatRead(chatId, e.message.id).catch(console.error);

                if (isAtBottomRef.current) {
                    setTimeout(() => scrollToBottom(), 100);
                }
            }
        });

        // Listen for message updates
        channel.listen('.ChatMessageUpdated', (e: { chat_id: number; message: ChatMessage }) => {
            if (e.chat_id === chatId) {
                setMessages(prev => prev.map(m => m.id === e.message.id ? { ...m, ...e.message } : m));
            }
        });

        // Listen for message deletion
        channel.listen('.ChatMessageDeleted', (e: { chat_id: number; message_id: number }) => {
            if (e.chat_id === chatId) {
                setMessages(prev => prev.map(m => m.id === e.message_id ? { ...m, is_deleted: true, content: null, media_url: null } : m));
            }
        });

        // Listen for member updates
        channel.listen('.ChatMemberUpdated', (e: { chat_id: number; action: string; user_id: number }) => {
            if (e.chat_id === chatId) {
                queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
                if (e.action === 'removed' && e.user_id === currentUser?.id) {
                    toast.error('Вы были удалены из этого чата');
                    navigate('/chats');
                }
            }
        });

        return () => {
            channel.stopListening('.NewChatMessage');
            channel.stopListening('.ChatMessageUpdated');
            channel.stopListening('.ChatMessageDeleted');
            channel.stopListening('.ChatMemberUpdated');
            echo.leave(`chat.${chatId}`);
        };
    }, [chatId, currentUser, navigate, queryClient]);

    // Send Handlers
    const handleSendMessage = async (content: string) => {
        const newMessage = await chatApi.sendMessage(chatId, content);
        setMessages(prev => [...prev, newMessage]);
        chatApi.markChatRead(chatId, newMessage.id).catch(console.error);
        setTimeout(() => scrollToBottom(), 50);
    };

    const handleSendMediaMessage = async (file: File, content?: string) => {
        const newMessage = await chatApi.sendMediaMessage(chatId, file, content);
        setMessages(prev => [...prev, newMessage]);
        chatApi.markChatRead(chatId, newMessage.id).catch(console.error);
        setTimeout(() => scrollToBottom(), 50);
    };

    const handleEditSubmit = async (messageId: number, content: string) => {
        const updated = await chatApi.editMessage(chatId, messageId, content);
        setMessages(prev => prev.map(m => m.id === messageId ? updated : m));
    };

    const handleDeleteMessage = async (messageId: number) => {
        if (confirm('Удалить сообщение?')) {
            await chatApi.deleteMessage(chatId, messageId);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_deleted: true, content: null, media_url: null } : m));
        }
    };

    if (isError) {
        return (
            <div className="max-w-3xl mx-auto p-8 text-center space-y-4">
                <p className="text-rose-400 font-bold">Чат не найден или доступ ограничен</p>
                <button
                    onClick={() => navigate('/chats')}
                    className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-xl"
                >
                    Назад к чатам
                </button>
            </div>
        );
    }

    const title = chat?.type === 'system' ? 'Общий чат' : (chat?.name || 'Чат');

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-5xl mx-auto border-x border-white/[0.04] bg-zinc-950/40 select-none">
            {/* Header */}
            <div className="h-16 px-4 border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-20">
                <div className="flex items-center gap-3 min-w-0">
                    <button
                        onClick={() => navigate('/chats')}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors shrink-0"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {isChatLoading ? (
                        <div className="space-y-1">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    ) : (
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-zinc-100 truncate">{title}</h2>
                            <p className="text-[10px] text-zinc-500 font-medium">
                                {chat?.members_count} участников
                            </p>
                        </div>
                    )}
                </div>

                {chat && (
                    <button
                        onClick={() => setIsInfoOpen(true)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors shrink-0"
                        title="Информация о чате"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Messages Area */}
            <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"
            >
                {isLoadingOlder && (
                    <p className="text-[10px] text-zinc-500 text-center py-2">Загрузка старых сообщений...</p>
                )}

                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-zinc-600 text-xs">
                        Нет сообщений. Напишите первое!
                    </div>
                ) : (
                    messages.map(msg => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.user_id === currentUser?.id}
                            onEdit={setEditingMessage}
                            onDelete={handleDeleteMessage}
                        />
                    ))
                )}
            </div>

            {/* Chat Input */}
            <ChatInput
                onSendMessage={handleSendMessage}
                onSendMediaMessage={handleSendMediaMessage}
                onEditSubmit={handleEditSubmit}
                editingMessage={editingMessage}
                onCancelEdit={() => setEditingMessage(null)}
            />

            {/* Info Drawer Modal */}
            {chat && (
                <ChatInfoDrawer
                    isOpen={isInfoOpen}
                    onClose={() => setIsInfoOpen(false)}
                    chat={chat}
                    onChatDeleted={() => navigate('/chats')}
                />
            )}
        </div>
    );
};
