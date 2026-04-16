import { FC, useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildApi } from '../api/guilds';
import type { Post } from '../api/types';
import { PostEditor } from './PostEditor';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Skeleton } from './ui/Skeleton';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    rectSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

    const reorderMutation = useMutation({
        mutationFn: (ids: number[]) => guildApi.reorderPosts(ids),
        onMutate: async (newIds) => {
            await queryClient.cancelQueries({ queryKey: ['guild-posts'] });
            const previousPosts = queryClient.getQueryData<Post[]>(['guild-posts']);

            if (previousPosts) {
                const newPosts = [...previousPosts].sort((a, b) => {
                    return newIds.indexOf(a.id) - newIds.indexOf(b.id);
                });
                queryClient.setQueryData(['guild-posts'], newPosts);
            }

            return { previousPosts };
        },
        onError: (_err, _newIds, context) => {
            if (context?.previousPosts) {
                queryClient.setQueryData(['guild-posts'], context.previousPosts);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['guild-posts'] });
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && posts) {
            const oldIndex = posts.findIndex((p) => p.id === active.id);
            const newIndex = posts.findIndex((p) => p.id === over.id);

            const newPosts = arrayMove(posts, oldIndex, newIndex);
            reorderMutation.mutate(newPosts.map(p => p.id));
        }
    };

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl overflow-hidden">
                        <Skeleton className="h-2 w-full rounded-none" />
                        <div className="p-5 space-y-3">
                            <Skeleton className="h-5 w-16 rounded-md" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3.5 w-full" />
                            <Skeleton className="h-3.5 w-2/3" />
                            <div className="flex justify-between pt-3 border-t border-white/[0.05]">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-7 w-20 rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (isCreating) {
        return (
            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 animate-in slide-in-from-bottom-2 duration-300">
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight text-white">
                        {editingPost ? 'Редактировать гайд' : 'Создать новый гайд'}
                    </h2>
                    <button 
                        onClick={() => { setIsCreating(false); setEditingPost(null); }}
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
                        onClick={handleSave}
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="w-full bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 font-semibold py-4 rounded-xl transition-all shadow-xl text-sm"
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
                    <h2 className="text-2xl font-bold tracking-tight text-white">База знаний</h2>
                    <p className="text-sm text-zinc-500 mt-1">Обучающие материалы и гайды</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setIsCreating(true); setEditingPost(null); setTitle(''); setContent(''); }}
                        className="flex items-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 px-5 py-2.5 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98]"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Создать гайд
                    </button>
                )}
            </div>

            {!posts || posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 border border-white/[0.06] flex items-center justify-center">
                        <svg className="w-7 h-7 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18c-2.305 0-4.408.867-6 2.292m0-14.25v14.25" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-zinc-400">База знаний пуста</p>
                        <p className="text-xs text-zinc-600 mt-1">
                            {isAdmin ? 'Создайте первый гайд для участников гильдии' : 'Гайды ещё не добавлены'}
                        </p>
                    </div>
                    {isAdmin && (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-2 px-4 py-2 bg-white text-zinc-900 hover:bg-zinc-100 rounded-xl font-semibold text-sm transition-all"
                        >
                            Создать первый гайд
                        </button>
                    )}
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={posts.map(p => p.id)}
                        strategy={rectSortingStrategy}
                        disabled={!isAdmin}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {posts.map(post => (
                                <SortablePostCard 
                                    key={post.id} 
                                    post={post} 
                                    isAdmin={isAdmin}
                                    handleEditClick={handleEditClick}
                                    handleDelete={handleDelete}
                                    handleRead={handleRead}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            {readingPost && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0" 
                        onClick={() => setReadingPost(null)}
                    ></div>
                    
                    <div className="bg-zinc-900 border border-white/[0.08] w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-zinc-900/60 backdrop-blur-xl z-10">
                            <div className="min-w-0 pr-10">
                                <h3 className="text-xl font-bold tracking-tight text-white mb-1 truncate">{readingPost.title}</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                        {readingPost.author?.profile?.family_name || 'System'}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                                    <span className="text-[10px] font-semibold text-zinc-500 tabular-nums uppercase tracking-wider">
                                        {format(new Date(readingPost.created_at), 'dd MMM yyyy', { locale: ru })}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setReadingPost(null)} 
                                className="absolute top-5 right-5 p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white border border-white/5 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Content */}
                        <div className="p-6 md:p-10 overflow-y-auto flex-1 custom-scrollbar scroll-smooth">
                            <div className="prose prose-invert prose-sm md:prose-base max-w-none 
                                prose-headings:text-zinc-100 prose-headings:font-bold prose-headings:tracking-tight
                                prose-p:text-zinc-300 prose-p:leading-relaxed
                                prose-strong:text-zinc-100 prose-strong:font-bold
                                prose-code:text-violet-300 prose-code:bg-zinc-800/60 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                                prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-white/[0.06] prose-pre:rounded-xl
                                prose-img:rounded-xl prose-img:shadow-2xl
                                prose-a:text-violet-400 hover:prose-a:text-violet-300 transition-all font-inter">
                                <div dangerouslySetInnerHTML={{ __html: readingPost.content || '' }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface SortablePostCardProps {
    post: Post;
    isAdmin: boolean;
    handleEditClick: (id: number) => void;
    handleDelete: (id: number) => void;
    handleRead: (id: number) => void;
}

const SortablePostCard: FC<SortablePostCardProps> = ({ 
    post, 
    isAdmin, 
    handleEditClick, 
    handleDelete, 
    handleRead 
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: post.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className={`group bg-zinc-900/50 backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden hover:border-white/10 hover:bg-zinc-900/70 transition-all duration-300 flex flex-col shadow-lg ${isDragging ? 'opacity-50' : ''}`}
        >
            <div className="h-2 w-full bg-gradient-to-r from-violet-600 to-violet-400" />
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {isAdmin && (
                            <div 
                                {...attributes} 
                                {...listeners} 
                                className="p-1 -ml-1 cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                            </div>
                        )}
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-semibold uppercase tracking-wider">
                            Guide
                        </span>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditClick(post.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                            <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
                <h3 className="text-base font-semibold text-zinc-100 leading-snug mb-2 group-hover:text-white transition-colors">{post.title}</h3>
                <p className="text-xs text-zinc-500 leading-relaxed flex-1 line-clamp-2 mb-4">
                    {post.content?.replace(/<[^>]*>?/gm, '').substring(0, 120) || 'Нет описания...'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                    <span className="text-[10px] text-zinc-600 tabular-nums">
                        {format(new Date(post.created_at), 'dd MMM yyyy', { locale: ru })}
                    </span>
                    <button onClick={() => handleRead(post.id)} className="px-3 py-1.5 rounded-lg bg-zinc-800/60 hover:bg-zinc-700/60 border border-white/[0.06] hover:border-white/10 text-zinc-300 hover:text-white text-xs font-medium transition-all">
                        Читать →
                    </button>
                </div>
            </div>
        </div>
    );
};
