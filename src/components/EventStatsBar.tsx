import type { FC } from 'react';
import type { Event } from '../api/events';

interface EventStatsBarProps {
    event: Event;
}

export const EventStatsBar: FC<EventStatsBarProps> = ({ event }) => {
    const stats = event.stats || {
        total_confirmed: 0,
        total_declined: 0,
        total_pending: 0,
        total_slots: 0
    };

    const occupancyRate = stats.total_slots > 0 
        ? Math.round((stats.total_confirmed / stats.total_slots) * 100) 
        : 0;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Всего участников</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_confirmed}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Занято слотов</p>
                <div className="flex items-end">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{occupancyRate}%</p>
                    <span className="ml-2 mb-1 text-xs text-gray-400 font-medium">от {stats.total_slots}</span>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Отказов</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.total_declined}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Молчунов</p>
                <p className="text-2xl font-bold text-orange-500 dark:text-orange-400">{stats.total_pending}</p>
            </div>
        </div>
    );
};
