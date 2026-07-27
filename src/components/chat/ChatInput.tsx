import type { FC, ChangeEvent, KeyboardEvent } from 'react';
import { useState, useRef } from 'react';
import type { ChatMessage } from '../../api/types';

interface ChatInputProps {
    onSendMessage: (content: string) => Promise<void>;
    onSendMediaMessage: (file: File, content?: string) => Promise<void>;
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync content when editingMessage changes
    if (editingMessage && content === '' && !isSending) {
        setContent(editingMessage.content || '');
    }

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setFilePreview(url);
        }
    };

    const clearFile = () => {
        setSelectedFile(null);
        if (filePreview) {
            URL.revokeObjectURL(filePreview);
            setFilePreview(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if ((!trimmed && !selectedFile) || isSending || disabled) return;

        setIsSending(true);
        try {
            if (editingMessage) {
                await onEditSubmit(editingMessage.id, trimmed);
                onCancelEdit();
            } else if (selectedFile) {
                await onSendMediaMessage(selectedFile, trimmed || undefined);
                clearFile();
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
        <div className="border-t border-white/[0.06] bg-zinc-950/80 backdrop-blur-xl p-3 md:p-4 space-y-2">
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

            {/* File Preview */}
            {filePreview && (
                <div className="relative inline-block border border-white/10 rounded-xl overflow-hidden bg-zinc-900">
                    <img src={filePreview} alt="Preview" className="h-20 w-20 object-cover" />
                    <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Input Row */}
            <div className="flex items-end gap-2">
                {/* File Attachment Button */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isSending || !!editingMessage}
                    className="p-3 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl transition-colors disabled:opacity-40 shrink-0"
                    title="Прикрепить изображение"
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
                        placeholder={editingMessage ? 'Введите новый текст...' : 'Написать сообщение...'}
                        rows={1}
                        disabled={disabled || isSending}
                        className="w-full bg-transparent px-4 py-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none max-h-32 min-h-[44px]"
                    />
                </div>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={(!content.trim() && !selectedFile) || isSending || disabled}
                    className="p-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white rounded-xl shadow-lg shadow-violet-900/30 transition-all active:scale-95 shrink-0"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9-7-9-7-9 7 9 7zm0 0v-8" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
