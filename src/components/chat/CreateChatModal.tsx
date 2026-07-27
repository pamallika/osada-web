import type { FC } from 'react';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { guildApi } from '../../api/guilds';
import { chatApi } from '../../api/chat';
import { useAuthStore } from '../../store/useAuthStore';
import Modal from '../ui/Modal';
import { UserRow } from '../ui/UserRow';
import { toast } from '../Toaster';

interface CreateChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (chatId: number) => void;
}

export const CreateChatModal: FC<CreateChatModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const { user: currentUser } = useAuthStore();
    const [name, setName] = useState('');
    const [search, setSearch] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

    const { data: members, isLoading } = useQuery({
        queryKey: ['guild-members'],
        queryFn: () => guildApi.getMembers(),
        enabled: isOpen,
    });

    const createMutation = useMutation({
        mutationFn: () => chatApi.createChat(name.trim() || null, selectedUserIds),
        onSuccess: (newChat) => {
            toast.success('Чат создан');
            setName('');
            setSelectedUserIds([]);
            setSearch('');
            onClose();
            onSuccess(newChat.id);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Ошибка создания чата');
        }
    });

    const candidateMembers = members?.filter(m => {
        if (!m.user || m.user.id === currentUser?.id) return false;
        if (!search) return true;
        const nameMatch = m.user.name?.toLowerCase().includes(search.toLowerCase());
        const familyMatch = m.user.profile?.family_name?.toLowerCase().includes(search.toLowerCase());
        const globalMatch = m.user.profile?.global_name?.toLowerCase().includes(search.toLowerCase());
        return nameMatch || familyMatch || globalMatch;
    }) || [];

    const toggleUser = (userId: number) => {
        setSelectedUserIds(prev => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Новый чат"
            subtitle="Создайте приватный диалог или группу"
            maxWidth="md"
            footer={
                <div className="flex items-center justify-end gap-3 w-full">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        type="button"
                        onClick={() => createMutation.mutate()}
                        disabled={selectedUserIds.length === 0 || createMutation.isPending}
                        className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-95"
                    >
                        {createMutation.isPending ? 'Создание...' : `Создать (${selectedUserIds.length})`}
                    </button>
                </div>
            }
        >
            <div className="space-y-5">
                {/* Chat Name */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Название чата <span className="text-zinc-600 font-normal">(опционально)</span>
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="например, Осадники или Стратегия"
                        className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                </div>

                {/* Member Search */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Участники
                    </label>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Поиск по имени или никнейму..."
                        className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
                    />
                </div>

                {/* Member List */}
                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {isLoading ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">Загрузка участников...</p>
                    ) : candidateMembers.length === 0 ? (
                        <p className="text-xs text-zinc-500 py-4 text-center">Участники не найдены</p>
                    ) : (
                        candidateMembers.map((member) => {
                            const isSelected = selectedUserIds.includes(member.user.id);
                            return (
                                <UserRow
                                    key={member.user.id}
                                    user={member.user}
                                    size="sm"
                                    onClick={() => toggleUser(member.user.id)}
                                    className={`rounded-xl px-3 transition-colors ${isSelected ? 'bg-violet-950/40 border-violet-500/30' : 'hover:bg-zinc-900/40'}`}
                                    action={
                                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${isSelected ? 'bg-violet-600 border-violet-500 text-white' : 'border-zinc-700 bg-zinc-900/50'}`}>
                                            {isSelected && (
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    }
                                />
                            );
                        })
                    )}
                </div>
            </div>
        </Modal>
    );
};
