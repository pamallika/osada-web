import type { FC } from 'react';
import { useState } from 'react';
import type { Event, Squad } from '../api/events';
import { eventsApi } from '../api/events';
import { SquadFormModal } from './SquadFormModal';

interface SquadBuilderProps {
    event: Event;
    onUpdate: () => void;
}

export const SquadBuilder: FC<SquadBuilderProps> = ({ event, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSquad, setEditingSquad] = useState<Squad | undefined>(undefined);

    const handleAddSquad = () => {
        setEditingSquad(undefined);
        setIsModalOpen(true);
    };

    const handleEditSquad = (squad: Squad) => {
        setEditingSquad(squad);
        setIsModalOpen(true);
    };

    const handleDeleteSquad = async (squadId: number) => {
        if (!confirm('Вы уверены, что хотите расформировать этот отряд?')) return;
        
        try {
            await eventsApi.deleteSquad(event.id, squadId);
            onUpdate();
        } catch (error) {
            console.error('Failed to delete squad:', error);
            alert('Ошибка при удалении отряда');
        }
    };

    const handleSubmitSquad = async (data: { name: string; limit: number }) => {
        if (editingSquad) {
            await eventsApi.updateSquad(event.id, editingSquad.id, data);
        } else {
            await eventsApi.addSquad(event.id, data);
        }
        onUpdate();
    };

    // Sort squads: system first, then by ID
    const sortedSquads = [...(event.squads || [])].sort((a: Squad, b: Squad) => {
        if (a.is_system && !b.is_system) return -1;
        if (!a.is_system && b.is_system) return 1;
        return a.id - b.id;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Конструктор Рейда</h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 ml-1 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                        Формирование структуры групп
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAddSquad}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase tracking-widest text-[10px] italic flex items-center gap-2 active:scale-[0.98]"
                    >
                        <span>➕ Добавить отряд</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedSquads.map((squad: Squad) => (
                    <div 
                        key={squad.id}
                        className={`bg-slate-800 p-6 rounded-[2rem] border relative overflow-hidden transition-all group ${
                            squad.is_system 
                            ? 'border-indigo-500/30 bg-indigo-500/5 shadow-[0_0_20px_rgba(99,102,241,0.05)]' 
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                    >
                        {squad.is_system && (
                            <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        )}

                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Группа</span>
                                <h3 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                    {squad.name}
                                    {squad.is_system && (
                                        <span className="bg-indigo-600 text-[8px] px-2 py-0.5 rounded-lg text-white not-italic tracking-widest uppercase">Система</span>
                                    )}
                                </h3>
                            </div>
                            
                            {!squad.is_system && (
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleEditSquad(squad)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all border border-slate-600/30"
                                        title="Редактировать"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteSquad(squad.id)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                        title="Удалить"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 relative z-10">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-500">Занято слотов</span>
                                <span className="text-white">
                                    {squad.participants?.length || 0} <span className="text-slate-500">/</span> {squad.limit}
                                </span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-700/50">
                                <div 
                                    className={`h-full rounded-full transition-all duration-700 ${squad.is_system ? 'bg-indigo-500' : 'bg-slate-500'}`}
                                    style={{ width: `${Math.min(100, ((squad.participants?.length || 0) / squad.limit) * 100)}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}

                {(event.squads?.length || 0) === 0 && (
                    <div className="col-span-full py-20 text-center bg-slate-800/50 rounded-[2.5rem] border-2 border-dashed border-slate-700 relative overflow-hidden group">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-700 bg-gradient-to-br from-indigo-500 to-purple-500 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-xl border border-slate-700/50">
                                <span className="text-2xl opacity-50">👥</span>
                            </div>
                            <h3 className="text-xl font-black text-white/50 uppercase italic tracking-tighter">Рейд не укомплектован</h3>
                            <button 
                                onClick={handleAddSquad}
                                className="mt-6 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-indigo-300 transition-colors italic"
                            >
                                ➕ Сформировать первую группу
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <SquadFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitSquad}
                squad={editingSquad}
            />
        </div>
    );
};
