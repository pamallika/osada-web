import { FC } from 'react';
import type { Post } from '../../api/types';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export interface PostReaderModalProps {
    post: Post | null;
    onClose: () => void;
}

export const PostReaderModal: FC<PostReaderModalProps> = ({ post, onClose }) => {
    if (!post) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300">
            <div 
                className="absolute inset-0" 
                onClick={onClose}
            ></div>
            
            <div className="bg-zinc-900 border border-white/[0.08] w-full max-w-4xl rounded-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between shrink-0 bg-zinc-900/60 backdrop-blur-xl z-10">
                    <div className="min-w-0 pr-10">
                        <h3 className="text-xl font-bold tracking-tight text-white mb-1 truncate">{post.title}</h3>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                                {post.author?.profile?.family_name || 'System'}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-800" />
                            <span className="text-[10px] font-semibold text-zinc-500 tabular-nums uppercase tracking-wider">
                                {format(new Date(post.created_at), 'dd MMM yyyy', { locale: ru })}
                            </span>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
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
                        <div dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                    </div>
                </div>
            </div>
        </div>
    );
};
