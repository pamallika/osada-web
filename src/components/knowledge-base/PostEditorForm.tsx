import { FC } from 'react';
import type { Post } from '../../api/types';
import { PostEditor } from '../PostEditor';

export interface PostEditorFormProps {
    editingPost: Post | null;
    title: string;
    setTitle: (title: string) => void;
    content: string;
    setContent: (content: string) => void;
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
}

export const PostEditorForm: FC<PostEditorFormProps> = ({
    editingPost,
    title,
    setTitle,
    content,
    setContent,
    onSave,
    onCancel,
    isSaving
}) => {
    return (
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 animate-in slide-in-from-bottom-2 duration-300">
            <div className="mb-8 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight text-white">
                    {editingPost ? 'Редактировать гайд' : 'Создать новый гайд'}
                </h2>
                <button 
                    onClick={onCancel}
                    className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
                >
                    Отмена
                </button>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 ml-1">Заголовок</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Название гайда..."
                        className="w-full bg-zinc-950 border border-white/[0.06] focus:border-violet-500/50 rounded-xl p-4 text-zinc-100 placeholder-zinc-700 transition-all outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-zinc-500 ml-1">Контент</label>
                    <PostEditor value={content} onChange={setContent} placeholder="Напишите здесь что-нибудь полезное..." />
                </div>

                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="w-full bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 font-semibold py-4 rounded-xl transition-all shadow-xl text-sm"
                >
                    {isSaving ? 'Сохранение...' : 'Опубликовать'}
                </button>
            </div>
        </div>
    );
};
