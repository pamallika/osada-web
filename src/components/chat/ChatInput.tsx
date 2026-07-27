import type { FC, ChangeEvent, KeyboardEvent, ClipboardEvent } from 'react';
import { useState, useRef } from 'react';
import type { ChatMessage } from '../../api/types';

interface FileWithPreview {
    id: string;
    file: File;
    previewUrl: string;
}

interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    onSendMediaMessage: (files: File[], content?: string) => Promise<void>;
    onEditSubmit: (messageId: number, content: string) => Promise<void>;
    editingMessage: ChatMessage | null;
    onCancelEdit: () => void;
    disabled?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({
    onSendMessage,
    onSendMediaMessage,
    onEditSubmit,
    editingMessage,
    onCancelEdit,
    disabled = false,
}) => {
    const [content, setContent] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync content when editingMessage changes
    if (editingMessage && content === '' && !isSending) {
        setContent(editingMessage.content || '');
    }

    const addFiles = (filesToAdd: File[]) => {
        if (filesToAdd.length === 0) return;
        const validImages = filesToAdd.filter(f => f.type.startsWith('image/'));
        if (validImages.length === 0) return;

        setSelectedFiles(prev => {
            const spaceLeft = 5 - prev.length;
            if (spaceLeft <= 0) return prev;
            const newSlice = validImages.slice(0, spaceLeft);
            const wrapped: FileWithPreview[] = newSlice.map(file => ({
                id: `${file.name}-${file.size}-${Math.random()}`,
                file,
                previewUrl: URL.createObjectURL(file)
            }));
            return [...prev, ...wrapped];
        });
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        addFiles(files);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
        if (editingMessage) return;
        const items = e.clipboardData?.items;
        if (!items) return;

        const pastedFiles: File[] = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) pastedFiles.push(file);
            }
        }

        if (pastedFiles.length > 0) {
            e.preventDefault();
            addFiles(pastedFiles);
        }
    };

    const removeFile = (id: string) => {
        setSelectedFiles(prev => {
            const target = prev.find(item => item.id === id);
            if (target) {
                URL.revokeObjectURL(target.previewUrl);
            }
            return prev.filter(item => item.id !== id);
        });
    };

    const clearAllFiles = () => {
        selectedFiles.forEach(item => URL.revokeObjectURL(item.previewUrl));
        setSelectedFiles([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if ((!trimmed && selectedFiles.length === 0) || isSending || disabled) return;

        setIsSending(true);
        try {
            if (editingMessage) {
                await onEditSubmit(editingMessage.id, trimmed);
                onCancelEdit();
            } else if (selectedFiles.length > 0) {
                const rawFiles = selectedFiles.map(f => f.file);
                await onSendMediaMessage(rawFiles, trimmed || undefined);
                clearAllFiles();
            } else {
                await onSendMessage(trimmed);
            }
            setContent('');
        } catch (err) {
            console.error('Failed to send message:', err);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="border-t border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl p-2 sm:p-3 space-y-2 shrink-0">
            {/* Edit mode banner */}
            {editingMessage && (
                <div className="flex items-center justify-between px-3 py-1.5 bg-violet-950/40 border border-violet-500/20 rounded-xl text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-violet-400 font-bold uppercase text-[9px] tracking-wider shrink-0">Редактирование</span>
                        <span className="text-zinc-300 truncate">{editingMessage.content}</span>
                    </div>
                    <button
                        onClick={() => {
                            onCancelEdit();
                            setContent('');
                        }}
                        className="text-zinc-400 hover:text-white p-1"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Multi-File Preview list */}
            {selectedFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-zinc-900/60 border border-white/[0.06] rounded-2xl max-h-36 overflow-y-auto">
                    {selectedFiles.map((item) => (
                        <div key={item.id} className="relative group border border-white/10 rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                            <img src={item.previewUrl} alt="Preview" className="h-16 w-16 object-cover" />
                            <button
                                type="button"
                                onClick={() => removeFile(item.id)}
                                className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-colors"
                                title="Удалить файл"
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {selectedFiles.length < 5 && (
                        <div className="flex items-center justify-center h-16 px-3 border border-dashed border-white/10 rounded-xl text-[10px] text-zinc-500 font-medium">
                            {selectedFiles.length}/5 файлов
                        </div>
                    )}
                </div>
            )}

            {/* Input Row */}
            <div className="flex items-center gap-1.5">
                {/* File Attachment Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending || !!editingMessage || selectedFiles.length >= 5}
                    className="p-2.5 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors disabled:opacity-40 shrink-0"
                    title={selectedFiles.length >= 5 ? 'Достигнут лимит в 5 файлов' : 'Прикрепить изображения (до 5)'}
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                </button>

                {/* Textarea */}
                <div className="flex-1 min-w-0 bg-zinc-900/60 border border-white/[0.08] rounded-2xl focus-within:border-violet-500/50 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all">
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        placeholder={editingMessage ? 'Новый текст...' : 'Написать сообщение...'}
                        rows={1}
                        disabled={disabled || isSending}
                        className="w-full bg-transparent px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-32 min-h-[40px]"
                    />
                </div>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={(!content.trim() && selectedFiles.length === 0) || isSending || disabled}
                    className="p-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-95 shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
