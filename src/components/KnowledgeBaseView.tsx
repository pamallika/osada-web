import { FC, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { guildApi } from '../api/guilds';
import type { Post } from '../api/types';
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
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortablePostCard } from './knowledge-base/SortablePostCard';
import { PostEditorForm } from './knowledge-base/PostEditorForm';
import { PostReaderModal } from './knowledge-base/PostReaderModal';

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
            <PostEditorForm
                editingPost={editingPost}
                title={title}
                setTitle={setTitle}
                content={content}
                setContent={setContent}
                onSave={handleSave}
                onCancel={() => { setIsCreating(false); setEditingPost(null); }}
                isSaving={createMutation.isPending || updateMutation.isPending}
            />
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

            <PostReaderModal 
                post={readingPost} 
                onClose={() => setReadingPost(null)} 
            />
        </div>
    );
};
