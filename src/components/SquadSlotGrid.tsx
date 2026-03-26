import type { FC } from 'react';
import { useState } from 'react';
import type { Squad, Event, Participant, EventUser } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { SquadParticipantsModal } from './SquadParticipantsModal';
import { SquadFormModal } from './SquadFormModal';

interface SquadSlotGridProps {
    event: Event;
    onJoin: (squadId: number | null) => Promise<void>;
    onKick?: (userId: number) => Promise<void>;
    onDecline?: () => Promise<void>;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
    onAddSquad?: (name: string, limit: number) => Promise<void>;
    onUpdateSquad?: (squadId: number, data: { name?: string, limit?: number }) => Promise<void>;
    onDeleteSquad?: (squadId: number) => Promise<void>;
    isOfficer?: boolean;
    isAdmin?: boolean;
}

export const SquadSlotGrid: FC<SquadSlotGridProps> = ({ 
    event, onJoin, onKick, onDecline, onMoveUser, 
    onAddSquad, onUpdateSquad, onDeleteSquad,
    isOfficer, isAdmin 
}) => {
    const { user } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [viewingSquad, setViewingSquad] = useState<Squad | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
    const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
    
    // Sort squads: standard squads first, then system ones
    const regularSquads = event.squads?.filter(s => !s.is_system) || [];
    const systemSquads = event.squads?.filter(s => s.is_system) || [];

    const isUserInSquad = (squad: Squad) => {
        return squad.participants?.some((p: Participant) => p.user_id === user?.id);
    };

    const isUserDeclined = event.declined_users?.some((u: EventUser) => u.id === user?.id);

    const handleSquadAction = (squad: Squad, action: 'edit' | 'delete') => {
        setOpenMenuId(null);
        if (action === 'edit') {
            setEditingSquad(squad);
            setIsSquadModalOpen(true);
        } else if (action === 'delete') {
            onDeleteSquad?.(squad.id);
        }
    };

    const handleSquadModalSubmit = async (data: { name: string; limit: number }) => {
        if (editingSquad) {
            await onUpdateSquad?.(editingSquad.id, data);
        } else {
            await onAddSquad?.(data.name, data.limit);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 select-none">
            {regularSquads.map((squad: Squad) => {
                const isUnlimited = squad.limit === 0;
                const isFull = !isUnlimited && (squad.participants?.length || 0) >= squad.limit;
                const amIInThisSquad = isUserInSquad(squad);
                const canJoin = !amIInThisSquad && !isFull && event.status === 'published';

                return (
                    <div 
                        key={squad.id}
                        onDragOver={(e) => {
                            if (!isAdmin) return;
                            e.preventDefault();
                            setDropTargetId(squad.id);
                        }}
                        onDragLeave={() => setDropTargetId(null)}
                        onDrop={(e) => {
                            if (!isAdmin) return;
                            e.preventDefault();
                            setDropTargetId(null);
                            const userId = parseInt(e.dataTransfer.getData('userId') || '0');
                            if (userId && onMoveUser) {
                                onMoveUser(userId, squad.id);
                            }
                        }}
                        className={`bg-zinc-900 p-6 rounded-[2rem] border transition-all relative group/card ${
                            amIInThisSquad 
                            ? 'ring-1 ring-violet-700 border-violet-700/50 bg-violet-900/5 shadow-lg shadow-violet-900/10' 
                            : 'border-zinc-800/50'
                        } ${
                            dropTargetId === squad.id ? 'border-amber-500 bg-amber-900/10 scale-[1.02] shadow-xl shadow-amber-900/20' : ''
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="min-w-0 cursor-pointer flex-1" onClick={() => setViewingSquad(squad)}>
                                <h3 className="text-lg font-black text-zinc-100 uppercase italic tracking-tight flex items-center gap-2 truncate">
                                    {squad.name}
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                    Слотов: {squad.participants?.length || 0} / {isUnlimited ? '∞' : squad.limit}
                                </p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                {isAdmin && (
                                    <div className="relative">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === squad.id ? null : squad.id);
                                            }}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-600 hover:text-white transition-all outline-none"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                            </svg>
                                        </button>
                                        
                                        {openMenuId === squad.id && (
                                            <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in duration-200">
                                                <button onClick={() => handleSquadAction(squad, 'edit')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase italic text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">⚙️ Настроить отряд</button>
                                                <div className="h-px bg-zinc-800 mx-2 my-1"></div>
                                                <button onClick={() => handleSquadAction(squad, 'delete')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase italic text-rose-500 hover:bg-rose-900/20 transition-colors">🗑️ Удалить отряд</button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {amIInThisSquad && (
                                    <span className="bg-emerald-900/20 text-emerald-400 text-[8px] px-2 py-1 rounded border border-emerald-800/50 font-black uppercase tracking-widest shadow-lg shadow-emerald-900/10">
                                        В отряде
                                    </span>
                                )}
                                {canJoin && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onJoin(squad.id); }}
                                        className="h-7 px-3 bg-violet-700 hover:bg-violet-600 text-white text-[9px] font-black uppercase tracking-widest italic rounded-lg border border-violet-600/50 transition-all flex items-center justify-center"
                                    >
                                        Вступить
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5 mb-6">
                            {squad.participants?.map((p: Participant, idx: number) => (
                                <div 
                                    key={idx} 
                                    draggable={isAdmin}
                                    onDragStart={(e) => {
                                        if (!isAdmin) return;
                                        e.dataTransfer.setData('userId', p.user_id.toString());
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                    onClick={(e) => { e.stopPropagation(); setSelectedUserId(p.user_id); }}
                                    className={`flex items-center text-sm p-1.5 bg-zinc-950/50 rounded-xl border border-zinc-800/30 group/p cursor-pointer hover:border-violet-700/50 transition-all ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                >
                                    <div className={`w-1 h-1 rounded-full mr-3 ${p.user_id === user?.id ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-700'}`}></div>
                                    <span className={`font-semibold text-[11px] uppercase tracking-tight truncate flex-1 ${p.user_id === user?.id ? 'text-emerald-400' : 'text-zinc-100 group-hover/p:text-violet-400 transition-colors'}`}>
                                        {p.family_name || p.global_name || 'Участник'}
                                    </span>
                                    {p.char_class && (
                                        <span className="text-[7px] text-zinc-600 font-black uppercase tracking-widest bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800/50 shrink-0">
                                            {p.char_class}
                                        </span>
                                    )}
                                </div>
                            ))}
                            {squad.participants?.length === 0 && (
                                <div className="text-[9px] text-center text-zinc-600 font-bold uppercase tracking-widest italic py-4 bg-zinc-950/20 rounded-xl border border-dashed border-zinc-800/30">
                                    Отряд пуст
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center cursor-pointer" onClick={() => setViewingSquad(squad)}>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic group-hover/card:text-zinc-400 transition-colors">
                                Посмотреть состав
                            </span>
                            <svg className="w-4 h-4 text-zinc-700 group-hover/card:text-violet-500 transition-all group-hover/card:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </div>
                );
            })}

            {/* Кнопка создания отряда (Plus Card) */}
            {isAdmin && (
                <button 
                    onClick={() => {
                        setEditingSquad(null);
                        setIsSquadModalOpen(true);
                    }}
                    className="bg-zinc-900/40 p-10 rounded-[2rem] border-2 border-dashed border-zinc-800/50 hover:border-violet-700/50 hover:bg-violet-900/5 transition-all group flex flex-col items-center justify-center gap-4 min-h-[200px]"
                >
                    <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:text-violet-400 group-hover:border-violet-700/50 group-hover:scale-110 transition-all">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 group-hover:text-violet-400 italic">Добавить отряд</span>
                </button>
            )}

            {/* Системные отряды (Запас и т.д.) */}
            {systemSquads.map((squad: Squad) => {
                 const amIInThisSquad = isUserInSquad(squad);
                 return (
                    <div 
                        key={squad.id}
                        onDragOver={(e) => { if (isAdmin) { e.preventDefault(); setDropTargetId(squad.id); } }}
                        onDragLeave={() => setDropTargetId(null)}
                        onDrop={(e) => {
                            if (!isAdmin) return;
                            e.preventDefault();
                            setDropTargetId(null);
                            const userId = parseInt(e.dataTransfer.getData('userId') || '0');
                            if (userId && onMoveUser) onMoveUser(userId, squad.id);
                        }}
                        className={`bg-zinc-900 p-6 rounded-[2rem] border transition-all relative group/card ${amIInThisSquad ? 'ring-1 ring-violet-700 border-violet-700/50 bg-violet-900/5' : 'border-zinc-800/50'} ${dropTargetId === squad.id ? 'border-amber-500 bg-amber-900/10 scale-[1.02]' : ''}`}
                    >
                         <div className="flex justify-between items-start mb-6">
                            <div className="min-w-0 cursor-pointer flex-1" onClick={() => setViewingSquad(squad)}>
                                <h3 className="text-lg font-black text-zinc-100 uppercase italic tracking-tight flex items-center gap-2 truncate">
                                    {squad.name}
                                    <span className="bg-zinc-800 text-[8px] px-2 py-0.5 rounded text-zinc-400 font-black tracking-widest uppercase border border-zinc-700/50">Запас</span>
                                </h3>
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                                    Участников: {squad.participants?.length || 0}
                                </p>
                            </div>
                        </div>
                        <div className="space-y-1.5 mb-6">
                            {squad.participants?.slice(0, 5).map((p: Participant, idx: number) => (
                                <div key={idx} draggable={isAdmin} onDragStart={(e) => { if(isAdmin){e.dataTransfer.setData('userId', p.user_id.toString()); e.dataTransfer.effectAllowed='move';}}} 
                                    onClick={(e) => { e.stopPropagation(); setSelectedUserId(p.user_id); }}
                                    className={`flex items-center text-sm p-1.5 bg-zinc-950/50 rounded-xl border border-zinc-800/30 group/p cursor-pointer hover:border-violet-700/50 transition-all ${isAdmin ? 'cursor-grab active:cursor-grabbing' : ''}`}>
                                     <div className={`w-1 h-1 rounded-full mr-3 ${p.user_id === user?.id ? 'bg-emerald-500' : 'bg-zinc-700'}`}></div>
                                     <span className="text-[11px] font-bold uppercase truncate text-zinc-400 flex-1">{p.family_name || 'Участник'}</span>
                                </div>
                            ))}
                            {squad.participants && squad.participants.length > 5 && (
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center py-2">
                                    + еще {squad.participants.length - 5} участников
                                </div>
                            )}
                        </div>
                        <div className="pt-4 border-t border-zinc-800/50 flex justify-between items-center cursor-pointer" onClick={() => setViewingSquad(squad)}>
                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest italic group-hover/card:text-zinc-400 transition-colors">Состав</span>
                            <svg className="w-4 h-4 text-zinc-700 group-hover:text-violet-500 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </div>
                    </div>
                 );
            })}

            {/* Блок ПРОПУСТЯТ */}
            <div 
                className={`bg-rose-900/5 p-6 rounded-[2rem] border transition-all relative group/card ${isUserDeclined ? 'ring-1 ring-rose-800 border-rose-800/50' : 'border-zinc-800/50'}`}
            >
                <div className="flex justify-between items-start mb-6 cursor-pointer" onClick={() => setViewingSquad({ id: -2, name: 'Пропустят', limit: 0, is_system: true, participants: (event.declined_users || []).map(u => ({ user_id: u.id, family_name: u.profile?.family_name || u.profile?.global_name || 'Участник', global_name: u.profile?.global_name || null, char_class: (u.profile as any)?.char_class || 'Unknown', status: 'declined'}))})}>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-black text-zinc-100 uppercase italic tracking-tight">Пропустят</h3>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Всего: {event.declined_users?.length || 0}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        {!isUserDeclined && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
                                className="h-7 px-3 bg-rose-700 hover:bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest italic rounded-lg transition-all flex items-center justify-center border border-rose-600/50 shadow-lg shadow-rose-900/20"
                            >
                                Я не приду
                            </button>
                        )}
                        {isUserDeclined && (
                            <span className="text-[8px] text-rose-400 font-black uppercase tracking-widest px-2 py-1 rounded bg-rose-900/20 border border-rose-800/50">
                                Пропускаю
                            </span>
                        )}
                    </div>
                </div>
                <div className="space-y-1.5 mb-6">
                    {event.declined_users?.slice(0, 5).map((u, idx) => (
                        <div key={idx} className="flex items-center text-sm p-1.5 bg-zinc-950/20 rounded-xl border border-zinc-800/30">
                            <div className={`w-1 h-1 rounded-full mr-3 ${u.id === user?.id ? 'bg-rose-500' : 'bg-zinc-800'}`}></div>
                            <span className="text-[11px] font-bold uppercase text-zinc-500">{u.profile?.family_name || 'Участник'}</span>
                        </div>
                    ))}
                    {event.declined_users && event.declined_users.length > 5 && (
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest text-center py-2">
                            + еще {event.declined_users.length - 5}
                        </div>
                    )}
                </div>
                <div className="pt-4 border-t border-rose-800/20 flex justify-between items-center cursor-pointer" onClick={() => setViewingSquad({ id: -2, name: 'Пропустят', limit: 0, is_system: true, participants: (event.declined_users || []).map(u => ({ user_id: u.id, family_name: u.profile?.family_name || u.profile?.global_name || 'Участник', global_name: u.profile?.global_name || null, char_class: (u.profile as any)?.char_class || 'Unknown', status: 'declined'}) ) })}>
                    <span className="text-[10px] font-black text-rose-800 uppercase tracking-widest italic group-hover/card:text-rose-600 transition-colors">Список</span>
                    <svg className="w-4 h-4 text-rose-900 group-hover:text-rose-600 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>

            <PlayerProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            <SquadParticipantsModal squad={viewingSquad} onClose={() => setViewingSquad(null)} onKick={(viewingSquad?.id === -2 || viewingSquad?.is_system) ? undefined : onKick} isOfficer={isOfficer} />
            
            <SquadFormModal 
                isOpen={isSquadModalOpen} 
                onClose={() => setIsSquadModalOpen(false)} 
                onSubmit={handleSquadModalSubmit}
                squad={editingSquad || undefined}
            />
        </div>
    );
};
