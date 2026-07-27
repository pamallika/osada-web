import type { FC } from 'react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatDetail } from '../../api/types';
import { chatApi } from '../../api/chat';
import { guildApi } from '../../api/guilds';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../ui/Modal';
import { UserRow } from '../ui/UserRow';
import { toast } from '../Toaster';

interface ChatInfoDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    chat: ChatDetail;
    onChatDeleted?: () => void;
}

export const ChatInfoDrawer: FC<ChatInfoDrawerProps> = ({
    isOpen,
    onClose,
    chat,
    onChatDeleted,
}) => {
    const { user: currentUser } = useAuthStore();
    const queryClient = useQueryClient();

    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [selectedUserIdsToAdd, setSelectedUserIdsToAdd] = useState<number[]>([]);

    const isSystemChat = chat.type === 'system';
    const isOwner = chat.creator_id === currentUser?.id;

    // Guild members for Add Member selector
    const { data: guildMembers } = useQuery({
        queryKey: ['guild-members'],
        queryFn: () => guildApi.getMembers(),
        enabled: isAddMemberOpen,
    });

    const addMembersMutation = useMutation({
        mutationFn: () => chatApi.addChatMembers(chat.id, selectedUserIdsToAdd),
        onSuccess: () => {
            toast.success('Участники добавлены');
            setSelectedUserIdsToAdd([]);
            setIsAddMemberOpen(false);
            queryClient.invalidateQueries({ queryKey: ['chat', chat.id] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Ошибка добавления');
        }
    });

    const removeMemberMutation = useMutation({
        mutationFn: (userId: number) => chatApi.removeChatMember(chat.id, userId),
        onSuccess: (_, userId) => {
            toast.success('Участник удален');
            queryClient.invalidateQueries({ queryKey: ['chat', chat.id] });
            if (userId === currentUser?.id) {
                onClose();
                onChatDeleted?.();
            }
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Ошибка');
        }
    });

    const deleteChatMutation = useMutation({
        mutationFn: () => chatApi.deleteChat(chat.id),
        onSuccess: () => {
            toast.success('Чат удален');
            onClose();
            onChatDeleted?.();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Ошибка удаления');
        }
    });

    const existingMemberIds = chat.members?.map(m => m.user_id) || [];
    const availableMembers = guildMembers?.filter(m => m.user && !existingMemberIds.includes(m.user.id)) || [];

    const toggleUserToAdd = (userId: number) => {
        setSelectedUserIdsToAdd(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={chat.name || (isSystemChat ? 'Общий чат' : 'Информация о чате')}
            subtitle={`${chat.members_count} участников`}
            maxWidth="md"
            footer={
                <div className="flex items-center justify-between w-full">
                    {!isSystemChat && !isOwner && (
                        <button
                            type="button"
                            onClick={() => removeMemberMutation.mutate(currentUser!.id)}
                            disabled={removeMemberMutation.isPending}
                            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-xl transition-colors"
                        >
                            Покинуть чат
                        </button>
                    )}
                    {!isSystemChat && isOwner && (
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm('Вы уверены, что хотите удалить чат?')) {
                                    deleteChatMutation.mutate();
                                }
                            }}
                            disabled={deleteChatMutation.isPending}
                            className="px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 text-xs font-semibold rounded-xl transition-colors"
                        >
                            Удалить чат
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs rounded-xl border border-zinc-800 transition-colors ml-auto"
                    >
                        Закрыть
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Header Actions for Owner */}
                {!isSystemChat && isOwner && (
                    <div>
                        {!isAddMemberOpen ? (
                            <button
                                type="button"
                                onClick={() => setIsAddMemberOpen(true)}
                                className="w-full py-2.5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Добавить участников
                            </button>
                        ) : (
                            <div className="space-y-3 bg-zinc-900/60 border border-white/[0.06] p-3 rounded-2xl">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-bold text-zinc-200">Выберите участников</span>
                                    <button
                                        onClick={() => setIsAddMemberOpen(false)}
                                        className="text-zinc-500 hover:text-white text-xs"
                                    >
                                        Отмена
                                    </button>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                                    {availableMembers.length === 0 ? (
                                        <p className="text-xs text-zinc-500 py-2 text-center">Все участники гильдии уже в чате</p>
                                    ) : (
                                        availableMembers.map(m => {
                                            const isSelected = selectedUserIdsToAdd.includes(m.user.id);
                                            return (
                                                <UserRow
                                                    key={m.user.id}
                                                    user={m.user}
                                                    size="xs"
                                                    onClick={() => toggleUserToAdd(m.user.id)}
                                                    className={`rounded-lg px-2 ${isSelected ? 'bg-violet-950/40 border-violet-500/30' : 'hover:bg-zinc-900/40'}`}
                                                    action={
                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-700 bg-zinc-900'}`}>
                                                            {isSelected && <span className="text-[10px]">✓</span>}
                                                        </div>
                                                    }
                                                />
                                            );
                                        })
                                    )}
                                </div>
                                {availableMembers.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => addMembersMutation.mutate()}
                                        disabled={selectedUserIdsToAdd.length === 0 || addMembersMutation.isPending}
                                        className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition-colors"
                                    >
                                        Добавить ({selectedUserIdsToAdd.length})
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Members List */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        Состав участников ({chat.members?.length || 0})
                    </h4>
                    <div className="space-y-1.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                        {chat.members?.map(member => (
                            <UserRow
                                key={member.user_id}
                                user={member.user}
                                size="sm"
                                action={
                                    <div className="flex items-center gap-2">
                                        {member.role === 'owner' && (
                                            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-bold uppercase">
                                                Создатель
                                            </span>
                                        )}
                                        {!isSystemChat && isOwner && member.user_id !== currentUser?.id && (
                                            <button
                                                type="button"
                                                onClick={() => removeMemberMutation.mutate(member.user_id)}
                                                className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                                                title="Исключить из чата"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Modal>
    );
};
