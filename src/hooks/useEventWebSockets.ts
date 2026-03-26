import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getEcho } from '../api/echo';
import type { Event, Participant, Squad } from '../api/events';

interface ParticipantUpdatedPayload {
    event_id: number;
    action: 'joined' | 'left' | 'status_changed' | 'moved';
    participant: {
        user_id: number;
        squad_id: number | null;
        status: 'confirmed' | 'declined' | 'pending';
        // Extended info might be present if the backend is generous
        family_name?: string;
        char_class?: string;
        global_name?: string;
    };
}

interface SquadUpdatedPayload {
    event_id: number;
    action: 'created' | 'updated' | 'deleted';
    squad: {
        id: number;
        title: string;
        slots_limit: number;
    };
}

interface EventUpdatedPayload {
    event_id: number;
    action: 'status_changed' | 'info_updated';
    event_patch: Partial<Event>;
}

export const useEventWebSockets = (eventId: number | undefined) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!eventId) return;

        const echo = getEcho();
        if (!echo) return;

        const channel = echo.private(`event.${eventId}`);

        channel
            .listen('ParticipantUpdated', (payload: ParticipantUpdatedPayload) => {
                console.log('WS: ParticipantUpdated', payload);
                
                queryClient.setQueryData(['event', eventId], (oldEvent: Event | undefined) => {
                    if (!oldEvent) return oldEvent;

                    const newEvent = { ...oldEvent };
                    const { action, participant } = payload;

                    // Helper to remove participant from any squad
                    const removeFromSquads = (p: Participant) => {
                        if (newEvent.squads) {
                            newEvent.squads = newEvent.squads.map(s => ({
                                ...s,
                                participants: s.participants?.filter(sp => sp.user_id !== p.user_id)
                            }));
                        }
                        if (newEvent.declined_users) {
                            newEvent.declined_users = newEvent.declined_users.filter(u => u.id !== p.user_id);
                        }
                    };

                    // Find existing participant to keep their profile info if not provided
                    let existingParticipant: Participant | undefined;
                    oldEvent.squads?.forEach(s => {
                        const found = s.participants?.find(p => p.user_id === participant.user_id);
                        if (found) existingParticipant = found;
                    });

                    const mergedParticipant: Participant = {
                        user_id: participant.user_id,
                        family_name: participant.family_name || existingParticipant?.family_name || 'Участник',
                        char_class: participant.char_class || existingParticipant?.char_class || '?',
                        global_name: participant.global_name || existingParticipant?.global_name,
                        status: participant.status === 'pending' ? 'unknown' : (participant.status as any),
                    };

                    if (action === 'left') {
                        removeFromSquads(mergedParticipant);
                    } else if (action === 'joined' || action === 'moved' || action === 'status_changed') {
                        removeFromSquads(mergedParticipant);
                        
                        if (participant.status === 'declined') {
                            newEvent.declined_users = [
                                ...(newEvent.declined_users || []),
                                { 
                                    id: participant.user_id, 
                                    profile: { 
                                        family_name: mergedParticipant.family_name,
                                        global_name: mergedParticipant.global_name 
                                    } 
                                }
                            ];
                        } else if (participant.squad_id !== null) {
                            if (newEvent.squads) {
                                newEvent.squads = newEvent.squads.map(s => {
                                    if (s.id === participant.squad_id) {
                                        return {
                                            ...s,
                                            participants: [...(s.participants || []), mergedParticipant]
                                        };
                                    }
                                    return s;
                                });
                            }
                        }
                    }

                    // For 'joined' without profile info, we might still need a refetch
                    if (action === 'joined' && !participant.family_name && !existingParticipant) {
                        setTimeout(() => queryClient.invalidateQueries({ queryKey: ['event', eventId] }), 0);
                    }

                    return newEvent;
                });
            })
            .listen('SquadUpdated', (payload: SquadUpdatedPayload) => {
                console.log('WS: SquadUpdated', payload);
                
                queryClient.setQueryData(['event', eventId], (oldEvent: Event | undefined) => {
                    if (!oldEvent) return oldEvent;

                    const newEvent = { ...oldEvent };
                    const { action, squad } = payload;

                    if (action === 'created') {
                        const newSquad: Squad = {
                            id: squad.id,
                            name: squad.title,
                            limit: squad.slots_limit,
                            participants: []
                        };
                        newEvent.squads = [...(newEvent.squads || []), newSquad];
                    } else if (action === 'updated') {
                        if (newEvent.squads) {
                            newEvent.squads = newEvent.squads.map(s => 
                                s.id === squad.id ? { ...s, name: squad.title, limit: squad.slots_limit } : s
                            );
                        }
                    } else if (action === 'deleted') {
                        if (newEvent.squads) {
                            newEvent.squads = newEvent.squads.filter(s => s.id !== squad.id);
                        }
                    }

                    return newEvent;
                });
            })
            .listen('EventUpdated', (payload: EventUpdatedPayload) => {
                console.log('WS: EventUpdated', payload);
                
                queryClient.setQueryData(['event', eventId], (oldEvent: Event | undefined) => {
                    if (!oldEvent) return oldEvent;
                    
                    return {
                        ...oldEvent,
                        ...payload.event_patch
                    };
                });
            });

        return () => {
            echo.leave(`event.${eventId}`);
        };
    }, [eventId, queryClient]);
};
