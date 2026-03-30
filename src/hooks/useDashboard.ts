import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard';

export const useMemberDashboard = () => {
    return useQuery({
        queryKey: ['dashboard', 'member'],
        queryFn: async () => {
            const response = await dashboardApi.getMemberDashboard();
            if (response.status === 'error') {
                throw new Error(response.message || 'Ошибка загрузки дашборда');
            }
            return response.data;
        },
        retry: 1,
    });
};

export const useAnalyticsDashboard = (period: number = 7) => {
    return useQuery({
        queryKey: ['dashboard', 'analytics', period],
        queryFn: async () => {
            const response = await dashboardApi.getAnalyticsDashboard(period);
            if (response.status === 'error') {
                throw new Error(response.message || 'Ошибка загрузки аналитики');
            }
            return response.data;
        },
        retry: 1,
    });
};
