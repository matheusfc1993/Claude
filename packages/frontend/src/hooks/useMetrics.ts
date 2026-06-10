import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuthStore } from '@/stores/authStore';

export function useDashboardMetrics() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id);

  return useQuery({
    queryKey: ['metrics', 'dashboard', clinicId],
    queryFn: async () => {
      const response = await api.get(`/metrics/${clinicId}/dashboard`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMonthlyTrend(months: number = 12) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id);

  return useQuery({
    queryKey: ['metrics', 'trend', clinicId, months],
    queryFn: async () => {
      const response = await api.get(`/metrics/${clinicId}/trend?months=${months}`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRevenueByService(days: number = 30) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id);

  return useQuery({
    queryKey: ['metrics', 'revenue-by-service', clinicId, days],
    queryFn: async () => {
      const response = await api.get(`/metrics/${clinicId}/revenue-by-service?days=${days}`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useProfessionalMetrics(days: number = 30) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id);

  return useQuery({
    queryKey: ['metrics', 'professionals', clinicId, days],
    queryFn: async () => {
      const response = await api.get(`/metrics/${clinicId}/professionals?days=${days}`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useExpenseBreakdown(days: number = 30) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id);

  return useQuery({
    queryKey: ['metrics', 'expenses', clinicId, days],
    queryFn: async () => {
      const response = await api.get(`/metrics/${clinicId}/expenses?days=${days}`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useKPISummary(days: number = 30) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id);

  return useQuery({
    queryKey: ['metrics', 'summary', clinicId, days],
    queryFn: async () => {
      const response = await api.get(`/metrics/${clinicId}/summary?days=${days}`);
      return response.data;
    },
    enabled: !!clinicId,
    staleTime: 5 * 60 * 1000,
  });
}
