import { FC } from 'react';
import type { Post } from '../../api/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface SortablePostCardProps {
    post: Post;
    isAdmin: boolean;
    handleEditClick: (id: number) => void;
    handleDelete: (id: number) => void;
    handleRead: (id: number) => void;
}

export const SortablePostCard: FC<SortablePostCardProps> = ({ 
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
