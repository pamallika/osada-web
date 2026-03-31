import React, { useRef, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';
import { toast } from '../Toaster';
import Avatar from '../ui/Avatar';

export const ProfileAvatar = () => {
    const { user, setUser } = useAuthStore();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Можно загружать только изображения');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Максимальный размер файла - 2MB');
            return;
        }

        setIsUploading(true);
        try {
            const updatedUser = await authApi.uploadAvatar(file);
            setUser(updatedUser);
            toast.success('Аватар обновлен');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Ошибка при загрузке аватара');
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleUpload(file);
    };

    return (
        <div 
            className="relative group cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            tabIndex={0}
        >
            <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-900 rounded-[2.5rem] mx-auto flex items-center justify-center text-zinc-700 overflow-hidden border border-zinc-800 transition-all duration-500 group-hover:scale-105 group-hover:border-violet-700/50 shadow-2xl shadow-black/50 relative">
                <Avatar 
                    user={user} 
                    size="2xl" 
                    className="w-full h-full border-none rounded-none transition-transform duration-700 group-hover:scale-110" 
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-violet-700/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <div className="bg-zinc-950/80 p-3 rounded-2xl border border-white/10 scale-90 group-hover:scale-100 transition-transform">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                </div>

                {isUploading && (
                    <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-violet-700 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
            
            <div className="mt-4 text-center">
                <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] group-hover:text-violet-500 transition-colors">
                    Нажми для смены фото
                </p>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
    );
};
