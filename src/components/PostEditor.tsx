import { FC, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { guildApi } from '../api/guilds';

interface PostEditorProps {
    value: string;
    onChange: (content: string) => void;
    placeholder?: string;
}

export const PostEditor: FC<PostEditorProps> = ({ value, onChange, placeholder }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-2xl border border-zinc-800 shadow-xl max-w-full my-6 mx-auto block',
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-violet-500 hover:text-violet-400 font-bold underline transition-colors cursor-pointer',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-violet prose-headings:font-black prose-headings:italic prose-headings:uppercase prose-p:text-zinc-400 max-w-none focus:outline-none min-h-[300px] p-6',
            },
        },
    });

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            try {
                const { url } = await guildApi.uploadPostMedia(file);
                if (editor) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            } catch (error) {
                console.error('Failed to upload image:', error);
                alert('Не удалось загрузить изображение');
            }
        };
    }, [editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="flex flex-col bg-zinc-950 rounded-2xl border border-zinc-800/80 shadow-2xl overflow-hidden focus-within:border-zinc-700/50 transition-colors">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-zinc-900 border-b border-zinc-800 overflow-x-auto scroller-hide select-none">
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleBold().run()} 
                    active={editor.isActive('bold')} 
                    icon="B" 
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleItalic().run()} 
                    active={editor.isActive('italic')} 
                    icon={<span className="italic">I</span>} 
                />
                <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
                    active={editor.isActive('heading', { level: 1 })} 
                    icon="H1" 
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
                    active={editor.isActive('heading', { level: 2 })} 
                    icon="H2" 
                />
                <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleBulletList().run()} 
                    active={editor.isActive('bulletList')} 
                    icon="•" 
                />
                <MenuButton 
                    onClick={() => editor.chain().focus().toggleOrderedList().run()} 
                    active={editor.isActive('orderedList')} 
                    icon="1." 
                />
                <div className="w-px h-4 bg-zinc-800 mx-1"></div>
                <MenuButton 
                    onClick={addImage} 
                    icon={(
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    )} 
                />
            </div>

            {/* Editor Content */}
            <div className="relative">
                <EditorContent editor={editor} />
                {!editor.getText() && (
                    <div className="absolute top-6 left-6 text-zinc-700 pointer-events-none italic font-bold text-sm tracking-widest uppercase">
                        {placeholder}
                    </div>
                )}
            </div>
        </div>
    );
};

const MenuButton = ({ onClick, active, icon }: { onClick: () => void, active?: boolean, icon: any }) => (
    <button
        type="button"
        onClick={onClick}
        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all font-black text-xs ${
            active 
                ? 'bg-violet-700 text-white shadow-lg shadow-violet-900/10' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
        }`}
    >
        {icon}
    </button>
);
