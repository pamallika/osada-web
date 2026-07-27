import React, { FC } from 'react';
import { BDO_CLASSES } from '../../constants/bdo';

interface ProfileSettingsFormProps {
    formData: any;
    handleChange: (e: any) => void;
    handleProfileSubmit: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    accountFormData: any;
    setAccountFormData: React.Dispatch<React.SetStateAction<any>>;
    handleAccountSubmit: (e: React.FormEvent) => Promise<void>;
    accountLoading: boolean;
    accountErrors: Record<string, string[]>;
    userHasPassword?: boolean;
}

export const ProfileSettingsForm: FC<ProfileSettingsFormProps> = ({
    formData,
    handleChange,
    handleProfileSubmit,
    isLoading,
    accountFormData,
    setAccountFormData,
    handleAccountSubmit,
    accountLoading,
    accountErrors,
    userHasPassword
}) => {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Character Form */}
            <section>
                <h3 className="text-lg font-semibold text-white mb-6 tracking-tight">Персонаж</h3>
                <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Фамилия</label>
                        <input type="text" name="family_name" value={formData.family_name || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Глобальный ник</label>
                        <input type="text" name="global_name" value={formData.global_name || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div className="space-y-1.5 overflow-hidden">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Класс</label>
                        <select name="char_class" value={formData.char_class || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all appearance-none cursor-pointer">
                            <option value="" className="bg-zinc-900">Выберите класс</option>
                            {BDO_CLASSES.map(c => (
                                <option key={c.id} value={c.id} className="bg-zinc-900">
                                    {c.nameRu} ({c.nameEn})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-white/[0.06]">
                        {[
                            { label: 'AP', name: 'attack' },
                            { label: 'AAP', name: 'awakening_attack' },
                            { label: 'DP', name: 'defense' }
                        ].map(stat => (
                            <div key={stat.name} className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1 block text-center">{stat.label}</label>
                                <input type="number" name={stat.name} value={(formData as any)[stat.name] || ''} onChange={handleChange} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 text-center focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                            </div>
                        ))}
                    </div>
                    <div className="md:col-span-2 pt-4">
                        <button type="submit" disabled={isLoading} className="bg-white text-zinc-900 hover:bg-zinc-100 px-8 py-2.5 rounded-xl font-semibold text-sm shadow-[0_0_20px_rgba(255,255,255,0.08)] transition-all duration-200 active:scale-[0.98] disabled:opacity-50">
                            {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                        </button>
                    </div>
                </form>
            </section>

            {/* Account Form */}
            <section className="pt-8 border-t border-white/[0.06]">
                <h3 className="text-lg font-semibold text-white mb-6 tracking-tight">Аккаунт</h3>
                <form onSubmit={handleAccountSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Email</label>
                        <input type="email" value={accountFormData.email} onChange={e => setAccountFormData((p: any) => ({ ...p, email: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" />
                    </div>
                    
                    <div className="pt-4 border-t border-white/[0.06]">
                        <p className="text-xs text-zinc-600 mb-4">Оставьте поля пустыми, если не хотите менять пароль</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Новый пароль</label>
                                <input type="password" value={accountFormData.password} onChange={e => setAccountFormData((p: any) => ({ ...p, password: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" placeholder="••••••••" />
                                {accountErrors.password && <p className="text-rose-500 text-[10px] mt-1">{accountErrors.password[0]}</p>}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Подтверждение</label>
                                <input type="password" value={accountFormData.password_confirmation} onChange={e => setAccountFormData((p: any) => ({ ...p, password_confirmation: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" placeholder="••••••••" />
                                {accountErrors.password_confirmation && <p className="text-rose-500 text-[10px] mt-1">{accountErrors.password_confirmation[0]}</p>}
                            </div>
                        </div>
                        {userHasPassword && (
                            <div className="mt-4 space-y-1.5">
                                <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 ml-1">Текущий пароль (для подтверждения)</label>
                                <input type="password" value={accountFormData.current_password} onChange={e => setAccountFormData((p: any) => ({ ...p, current_password: e.target.value }))} className="w-full bg-zinc-900/60 border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all" placeholder="••••••••" />
                            </div>
                        )}
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={accountLoading} className="bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 text-zinc-300 hover:text-white px-8 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50">
                            {accountLoading ? 'Обновление...' : 'Обновить настройки'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};
