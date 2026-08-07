import { FC, useState } from 'react';
import { useNotificationStore } from '../store/useNotificationStore';

interface GuildInviteBarProps {
    inviteSlug?: string;
    canManage?: boolean;
    onUpdateSlug?: (newSlug: string) => Promise<void>;
}

export const GuildInviteBar: FC<GuildInviteBarProps> = ({
    inviteSlug,
    canManage = false,
    onUpdateSlug,
}) => {
    const { addNotification } = useNotificationStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editSlug, setEditSlug] = useState(inviteSlug || '');
    const [isSaving, setIsSaving] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    if (!inviteSlug) return null;

    const fullUrl = `${window.location.origin}/invite/${inviteSlug}`;

    const handleCopy = async () => {
        if (isEditing) return;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(fullUrl);
            } else {
                const textArea = document.createElement('textarea');
                textArea.value = fullUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
            }
            setCopySuccess(true);
            addNotification({
                title: 'Скопировано',
                message: 'Инвайт-ссылка сохранена в буфер обмена',
                type: 'success',
            });
            setTimeout(() => setCopySuccess(false), 2500);
        } catch {
            addNotification({
                title: 'Ошибка',
                message: 'Не удалось скопировать ссылку',
                type: 'error',
            });
        }
    };

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const cleanedSlug = editSlug.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        if (cleanedSlug.length < 3 || cleanedSlug.length > 32) {
            addNotification({
                title: 'Ошибка',
                message: 'Ссылка должна содержать от 3 до 32 символов',
                type: 'error',
            });
            return;
        }

        setIsSaving(true);
        try {
            if (onUpdateSlug) {
                await onUpdateSlug(cleanedSlug);
            }
            setIsEditing(false);
        } catch {
            // Handled upstream
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditSlug(inviteSlug);
        setIsEditing(true);
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
    };

    return (
        <div
            onClick={handleCopy}
            className={`bg-zinc-950/60 border border-white/[0.06] rounded-xl p-2 min-h-[56px] flex items-center justify-between gap-2 select-none transition-all ${
                !isEditing ? 'cursor-pointer hover:border-white/10 hover:bg-zinc-950/80 active:scale-[0.99]' : ''
            }`}
        >
            {isEditing ? (
                <div className="flex items-center gap-2 w-full">
                    <input
                        type="text"
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-zinc-100 font-mono outline-none focus:border-violet-500/50 transition-all min-h-[44px]"
                        placeholder="slug"
                        autoFocus
                    />
                    {(() => {
                        const isChanged = editSlug.trim().toLowerCase() !== (inviteSlug || '').trim().toLowerCase();
                        const isSaveDisabled = !isChanged || isSaving || editSlug.length < 3 || editSlug.length > 32;
                        return (
                            <button
                                onClick={handleSave}
                                disabled={isSaveDisabled}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[44px] flex items-center justify-center shrink-0 ${
                                    isSaveDisabled
                                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                                        : 'bg-violet-600 hover:bg-violet-500 text-white shadow-lg'
                                }`}
                            >
                                {isSaving ? '...' : 'Сохранить'}
                            </button>
                        );
                    })()}
                    <button
                        onClick={handleCancelEdit}
                        className="px-3 py-2 text-zinc-400 hover:text-white rounded-lg text-xs min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <>
                    {/* Link Info Box - Entire block is clickable */}
                    <div className="flex items-center gap-2.5 px-2.5 py-1.5 overflow-hidden flex-1">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-400 shrink-0">
                            <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Приглашение</p>
                            <p className="text-xs font-mono text-zinc-300 truncate">
                                ...invite/{inviteSlug}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Copy Link Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy();
                            }}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border min-h-[44px] ${
                                copySuccess
                                    ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800/40'
                                    : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/5'
                            }`}
                            title="Скопировать ссылку"
                        >
                            {copySuccess ? (
                                <>
                                    <span className="text-sm font-bold">✓</span>
                                    <span>Скопировано</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <span>Копировать</span>
                                </>
                            )}
                        </button>

                        {/* Edit Button for Managers */}
                        {canManage && (
                            <button
                                onClick={handleStartEdit}
                                title="Редактировать ссылку"
                                className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-white/5 min-h-[44px] min-w-[44px] flex items-center justify-center"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};
