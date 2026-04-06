import React, { useRef, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/auth';
import { toast } from '../Toaster';
import { getMediaUrl } from '../../lib/utils';

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
            className="relative group w-full aspect-square rounded-xl overflow-hidden mb-4 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
        >
            {getMediaUrl(user?.avatar_url) ? (
                <img 
                    src={getMediaUrl(user.avatar_url)!} 
                    alt={user.profile?.family_name || 'Avatar'} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
            ) : (
                <div className="w-full h-full bg-zinc-800/80 border border-white/[0.08] rounded-xl flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] text-zinc-600 text-center px-4 font-medium">Нажми чтобы загрузить фото</span>
                </div>
            )}
            
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl backdrop-blur-[2px]">
                <span className="text-xs text-white font-medium">Изменить фото</span>
            </div>

            {isUploading && (
                <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center rounded-xl">
                    <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

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
