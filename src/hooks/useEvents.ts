import { useState, useCallback } from 'react';
import axios from 'axios';
import { eventsApi, type CreateEventRequest } from '../api/events';

export const useEvents = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createEvent = useCallback(async (data: CreateEventRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            const event = await eventsApi.createEvent(data);
            return event;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при создании события';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateEvent = useCallback(async (id: number, data: Partial<CreateEventRequest>) => {
        setIsLoading(true);
        setError(null);
        try {
            const event = await eventsApi.updateEvent(id, data);
            return event;
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при обновлении события';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const joinEvent = useCallback(async (eventId: number, squadId: number | null) => {
        setIsLoading(true);
        setError(null);
        try {
            return await eventsApi.joinEvent(eventId, squadId);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при записи на событие';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const declineEvent = useCallback(async (eventId: number) => {
        setIsLoading(true);
        setError(null);
        try {
            return await eventsApi.declineEvent(eventId);
        } catch (err: unknown) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Ошибка при отклонении участия';
            setError(message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isLoading,
        error,
        createEvent,
        updateEvent,
        joinEvent,
        declineEvent,
        setError
    };
};
