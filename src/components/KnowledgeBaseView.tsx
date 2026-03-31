import { FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildApi } from '../api/guilds';
import type { Post } from '../api/types';
import { PostEditor } from './PostEditor';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface KnowledgeBaseViewProps {
    isAdmin: boolean;
}

export const KnowledgeBaseView: FC<KnowledgeBaseViewProps> = ({ isAdmin }) => {
    const queryClient = useQueryClient();
    const [isCreating, setIsCreating] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [readingPost, setReadingPost] = useState<Post | null>(null);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const { data: posts, isLoading, error } = useQuery({
        queryKey: ['guild-posts'],
        queryFn: () => guildApi.getPosts(),
        retry: 1
    });

    const createMutation = useMutation({
        mutationFn: (payload: { title: string, content: string }) => guildApi.createPost(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-posts'] });
            setIsCreating(false);
            setTitle('');
            setContent('');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: number, payload: { title: string, content: string } }) => 
            guildApi.updatePost(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-posts'] });
            setEditingPost(null);
            setIsCreating(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => guildApi.deletePost(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-posts'] });
        }
    });

    const handleSave = () => {
        if (!title.trim() || !content.trim()) return;
        if (editingPost) {
            updateMutation.mutate({ id: editingPost.id, payload: { title, content } });
        } else {
            createMutation.mutate({ title, content });
        }
    };

    const handleRead = async (id: number) => {
        setIsDetailLoading(true);
        try {
            const fullPost = await guildApi.getPost(id);
            setReadingPost(fullPost);
        } catch (err) {
            console.error('Failed to fetch post content:', err);
            alert('Не удалось загрузить содержимое гайда');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleEditClick = async (id: number) => {
        setIsDetailLoading(true);
        try {
            const fullPost = await guildApi.getPost(id);
            setEditingPost(fullPost);
            setTitle(fullPost.title);
            setContent(fullPost.content || '');
            setIsCreating(true);
        } catch (err) {
            console.error('Failed to fetch post for editing:', err);
            alert('Не удалось загрузить данные для редактирования');
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Вы уверены, что хотите удалить этот гайд?')) {
            deleteMutation.mutate(id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-10 h-10 border-2 border-violet-700/20 border-t-violet-700 rounded-full animate-spin"></div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Загрузка Базы Знаний</span>
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="bg-zinc-900 p-8 rounded-[2rem] border border-zinc-800/50 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">
                        {editingPost ? 'Редактировать Гайд' : 'Создать Новый Гайд'}
                    </h2>
                    <button 
                        onClick={() => { setIsCreating(false); setEditingPost(null); }}
                        className="text-zinc-500 hover:text-zinc-300 uppercase font-black text-[10px] tracking-widest italic"
                    >
                        Отмена
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic ml-2">Заголовок</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Название гайда..."
                            className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-700/50 rounded-2xl p-4 text-zinc-100 placeholder-zinc-700 transition-all outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest italic ml-2">Контент</label>
                        <PostEditor value={content} onChange={setContent} placeholder="Напишите здесь что-нибудь полезное..." />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="w-full bg-violet-700 hover:bg-violet-600 disabled:opacity-50 text-white font-black py-4 rounded-3xl transition-all shadow-xl shadow-violet-900/20 uppercase tracking-widest italic text-xs"
                    >
                        {createMutation.isPending || updateMutation.isPending ? 'Сохранение...' : 'Опубликовать'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {isDetailLoading && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/40 backdrop-blur-[2px]">
                    <div className="w-8 h-8 border-2 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-zinc-100 uppercase italic tracking-tight">База Знаний</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Обучающие материалы и гайды</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setIsCreating(true); setEditingPost(null); setTitle(''); setContent(''); }}
                        className="bg-violet-700 hover:bg-violet-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all shadow-lg shadow-violet-900/20"
                    >
                        Создать Гайд
                    </button>
                )}
            </div>

            {posts?.length === 0 ? (
                <div className="bg-zinc-900 p-20 rounded-[2.5rem] border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-zinc-950 rounded-3xl border border-zinc-800/50 flex items-center justify-center mb-6 text-2xl">
                        📚
                    </div>
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest italic">Пока здесь пусто</span>
                    {isAdmin && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-6 text-violet-500 hover:text-violet-400 font-black text-[10px] uppercase tracking-widest italic"
                        >
                            Добавить первый пост
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {posts?.map(post => (
                        <div 
                            key={post.id}
                            className="group bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800/50 hover:border-violet-700/50 transition-all flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="px-2.5 py-1 bg-zinc-950 rounded border border-zinc-800 line-clamp-1">
                                        <span className="text-[8px] font-black text-violet-500 uppercase tracking-widest italic">GUIDE</span>
                                    </div>
                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleEditClick(post.id); }}
                                                className="p-1.5 text-zinc-600 hover:text-violet-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}
                                                className="p-1.5 text-zinc-600 hover:text-rose-500 transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-lg font-black text-zinc-100 uppercase italic tracking-tight mb-2 group-hover:text-violet-400 transition-colors">{post.title}</h3>
                                <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-6">
                                    Автор: {post.author?.profile?.family_name || 'System'}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/30">
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest italic">
                                    {format(new Date(post.created_at), 'dd MMM yyyy', { locale: ru })}
                                </span>
                                <button 
                                    onClick={() => handleRead(post.id)}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest italic transition-all border border-zinc-700/50"
                                >
                                    Читать
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reading Post Overlay */}
            {readingPost && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 md:p-10 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-zinc-900 w-[95vw] md:w-full max-w-4xl max-h-[85vh] rounded-[2rem] md:rounded-[2.5rem] border border-zinc-800/50 shadow-2xl relative overflow-hidden flex flex-col">
                        <div className="p-6 md:p-8 border-b border-zinc-800/50 flex items-center justify-between shrink-0 bg-zinc-900/50 backdrop-blur-xl">
                            <div>
                                <h3 className="text-xl md:text-2xl font-black text-zinc-100 uppercase italic tracking-tight line-clamp-1">{readingPost.title}</h3>
                                <div className="flex items-center gap-2 md:gap-4 mt-1">
                                    <span className="text-zinc-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">Автор: {readingPost.author?.profile?.family_name || 'System'}</span>
                                    <div className="w-1 h-1 bg-zinc-800 rounded-full"></div>
                                    <span className="text-zinc-500 text-[8px] md:text-[9px] font-black uppercase tracking-widest italic">{format(new Date(readingPost.created_at), 'dd MMM yyyy', { locale: ru })}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setReadingPost(null)}
                                className="p-2.5 md:p-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-500 rounded-xl md:rounded-2xl border border-zinc-800 transition-all ml-4"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="p-6 md:p-10 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="prose prose-invert prose-violet prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-p:text-zinc-400 prose-img:rounded-3xl prose-img:border prose-img:border-zinc-800/50 max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: readingPost.content }} />
                            </div>
                        </div>

                        <div className="p-6 md:p-8 border-t border-zinc-800/50 bg-zinc-950/30 shrink-0 text-center">
                            <button 
                                onClick={() => setReadingPost(null)}
                                className="w-full md:w-auto px-10 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-black uppercase tracking-widest italic rounded-2xl border border-zinc-800 transition-all shadow-xl"
                            >
                                Понятно
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
