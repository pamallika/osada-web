import type { FC } from 'react';
import { useState, useEffect } from 'react';
import type { Squad, Event, Participant } from '../api/events';
import { useAuthStore } from '../store/useAuthStore';
import { PlayerProfileModal } from './PlayerProfileModal';
import { SquadParticipantsModal } from './SquadParticipantsModal';
import { SquadFormModal } from './SquadFormModal';
import Avatar from './ui/Avatar';
import { UserRow } from './ui/UserRow';
import { cn, getMediaUrl } from '../lib/utils';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SquadSlotGridProps {
    event: Event;
    onJoin: (squadId: number | null) => Promise<void>;
    onKick?: (userId: number) => Promise<void>;
    onDecline?: () => Promise<void>;
    onMoveUser?: (userId: number, squadId: number | null) => Promise<void>;
    onAddSquad?: (name: string, limit: number) => Promise<void>;
    onUpdateSquad?: (squadId: number, data: { name?: string; limit?: number }) => Promise<void>;
    onDeleteSquad?: (squadId: number) => Promise<void>;
    onReorderSquads?: (ids: number[]) => Promise<void>;
    isOfficer?: boolean;
    isAdmin?: boolean;
}

import { SquadCardBase } from './squads/SquadCardBase';
import { SortableSquadCard } from './squads/SortableSquadCard';
export const SquadSlotGrid: FC<SquadSlotGridProps> = ({
    event, onJoin, onKick, onMoveUser,
    onAddSquad, onUpdateSquad, onDeleteSquad, onReorderSquads,
    isOfficer, isAdmin
}) => {
    const { user } = useAuthStore();
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [viewingSquad, setViewingSquad] = useState<Squad | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isSquadModalOpen, setIsSquadModalOpen] = useState(false);
    const [editingSquad, setEditingSquad] = useState<Squad | null>(null);
    const [activeId, setActiveId] = useState<number | null>(null);

    const initialSquads = event.squads?.filter(s => !s.is_system) || [];
    const [localSquads, setLocalSquads] = useState<Squad[]>(initialSquads);

    useEffect(() => {
        setLocalSquads(event.squads?.filter(s => !s.is_system) || []);
    }, [event.squads]);

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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (e: DragStartEvent) => {
        setActiveId(e.active.id as number);
        setOpenMenuId(null);
    }

    const handleDragCancel = () => {
        setActiveId(null);
    }

    const handleDragEnd = async (e: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = e;

        if (active.id !== over?.id && over) {
            const oldIndex = localSquads.findIndex((s) => s.id === active.id);
            const newIndex = localSquads.findIndex((s) => s.id === over.id);

            const newOrder = arrayMove(localSquads, oldIndex, newIndex);
            setLocalSquads(newOrder);

            if (onReorderSquads) {
                try {
                    await onReorderSquads(newOrder.map(s => s.id));
                } catch (err) {
                    setLocalSquads(event.squads?.filter(s => !s.is_system) || []);
                }
            }
        }
    };
    
    const activeSquad = activeId ? localSquads.find((s) => s.id === activeId) : null;
    
    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 select-none relative">
                <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter} 
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragCancel={handleDragCancel}
                >
                    <SortableContext items={localSquads.map((s) => s.id)} strategy={rectSortingStrategy}>
                        {localSquads.map((squad) => (
                            <SortableSquadCard
                                key={squad.id}
                                squad={squad}
                                event={event}
                                user={user}
                                isOfficer={isOfficer || false}
                                isAdmin={isAdmin || false}
                                onJoin={onJoin}
                                onMoveUser={onMoveUser}
                                handleSquadAction={handleSquadAction}
                                setViewingSquad={setViewingSquad}
                                setSelectedUserId={setSelectedUserId}
                                dropTargetId={dropTargetId}
                                setDropTargetId={setDropTargetId}
                                openMenuId={openMenuId}
                                setOpenMenuId={setOpenMenuId}
                            />
                        ))}
                    </SortableContext>
                    
                    <DragOverlay dropAnimation={dropAnimation}>
                        {activeSquad ? (
                            <SquadCardBase
                                squad={activeSquad}
                                event={event}
                                user={user}
                                isOfficer={isOfficer || false}
                                isAdmin={isAdmin || false}
                                isOverlay={true}
                                onJoin={onJoin}
                                onMoveUser={onMoveUser}
                                handleSquadAction={handleSquadAction}
                                setViewingSquad={setViewingSquad}
                                setSelectedUserId={setSelectedUserId}
                                dropTargetId={dropTargetId}
                                setDropTargetId={setDropTargetId}
                                openMenuId={openMenuId}
                                setOpenMenuId={setOpenMenuId}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>

                {isAdmin && (
                    <button
                        onClick={() => {
                            setEditingSquad(null);
                            setIsSquadModalOpen(true);
                        }}
                        className="flex flex-col items-center justify-center gap-2 min-h-[120px] w-full rounded-2xl border border-dashed border-white/10 hover:border-violet-500/30 hover:bg-violet-500/5 text-zinc-600 hover:text-violet-400 transition-all duration-300 group"
                    >
                        <div className="w-8 h-8 rounded-xl bg-zinc-800/50 group-hover:bg-violet-500/10 border border-white/[0.06] group-hover:border-violet-500/20 flex items-center justify-center transition-all">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <span className="text-xs font-semibold">Добавить отряд</span>
                    </button>
                )}
            </div>

            <PlayerProfileModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
            <SquadParticipantsModal 
                squad={viewingSquad} 
                onClose={() => setViewingSquad(null)} 
                onKick={onKick} 
                isOfficer={isOfficer || isAdmin}
                event={event}
                onMoveUser={onMoveUser}
            />

            <SquadFormModal
                isOpen={isSquadModalOpen}
                onClose={() => setIsSquadModalOpen(false)}
                onSubmit={handleSquadModalSubmit}
                squad={editingSquad || undefined}
            />
        </>
    );
};
