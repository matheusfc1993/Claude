import { useQuery } from '@tanstack/react-query';
import indexeddb from '@/services/indexeddb';

export interface PatientMetricsData {
  patientInfo: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    lastVisit?: Date;
  };
  revenue: {
    totalSpent: number;
    visitCount: number;
    averagePerVisit: number;
    totalByService: Array<{
      serviceName: string;
      total: number;
      count: number;
    }>;
    monthlyTrend: Array<{
      month: string;
      total: number;
      count: number;
    }>;
  };
  expenses: {
    attributable: number;
    totalInvested: number;
  };
  profitMargin: number;
  appointmentHistory: Array<{
    id: string;
    date: Date;
    serviceName?: string;
    professionalName: string;
    amount: number;
    status: string;
  }>;
}

export function usePatientMetrics(clinicId: string, patientId: string) {
  return useQuery<PatientMetricsData>({
    queryKey: ['patientMetrics', clinicId, patientId],
    queryFn: async () => {
      try {
        // Try to fetch from server
        const response = await fetch(`/api/metrics/${clinicId}/patient-metrics/patients/${patientId}`);

        if (!response.ok) {
          // If failed, try to get from cache
          const cached = await indexeddb.get<PatientMetricsData>(
            'cachedMetrics',
            `patient-${patientId}`
          );
          if (cached) return cached;
          throw new Error('Failed to fetch patient metrics');
        }

        const data = await response.json();

        // Cache the result
        await indexeddb.put('cachedMetrics', {
          key: `patient-${patientId}`,
          data,
          timestamp: Date.now(),
        });

        return data;
      } catch (error) {
        // Fallback to cached data if available
        const cached = await indexeddb.get<PatientMetricsData>(
          'cachedMetrics',
          `patient-${patientId}`
        );
        if (cached) return cached;
        throw error;
      }
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAllPatientMetrics(clinicId: string, sortBy: 'revenue' | 'visits' | 'profitMargin' = 'revenue') {
  return useQuery<Array<{
    patientId: string;
    name: string;
    email?: string;
    phone?: string;
    totalRevenue: number;
    visitCount: number;
    averagePerVisit: number;
    profitMargin: number;
    lastVisit?: Date;
  }>>({
    queryKey: ['allPatientMetrics', clinicId, sortBy],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/metrics/${clinicId}/patient-metrics/patients?sortBy=${sortBy}`
        );

        if (!response.ok) {
          const cached = await indexeddb.get(
            'cachedMetrics',
            `all-patients-${sortBy}`
          );
          if (cached) return cached;
          throw new Error('Failed to fetch all patient metrics');
        }

        const data = await response.json();

        // Cache
        await indexeddb.put('cachedMetrics', {
          key: `all-patients-${sortBy}`,
          data,
          timestamp: Date.now(),
        });

        return data;
      } catch (error) {
        const cached = await indexeddb.get('cachedMetrics', `all-patients-${sortBy}`);
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePatientSegments(clinicId: string) {
  return useQuery<Array<{
    segment: string;
    count: number;
    percentOfTotal: number;
    avgRevenuePerPatient: number;
  }>>({
    queryKey: ['patientSegments', clinicId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/metrics/${clinicId}/patient-metrics/segments`);

        if (!response.ok) {
          const cached = await indexeddb.get('cachedMetrics', `patient-segments`);
          if (cached) return cached;
          throw new Error('Failed to fetch patient segments');
        }

        const data = await response.json();

        // Cache
        await indexeddb.put('cachedMetrics', {
          key: 'patient-segments',
          data,
          timestamp: Date.now(),
        });

        return data;
      } catch (error) {
        const cached = await indexeddb.get('cachedMetrics', 'patient-segments');
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRetentionMetrics(clinicId: string) {
  return useQuery<{
    activeLastMonth: number;
    churnRisk: number;
    newPatients: number;
    churnRate: number;
  }>({
    queryKey: ['retentionMetrics', clinicId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/metrics/${clinicId}/patient-metrics/retention`);

        if (!response.ok) {
          const cached = await indexeddb.get('cachedMetrics', 'retention-metrics');
          if (cached) return cached;
          throw new Error('Failed to fetch retention metrics');
        }

        const data = await response.json();

        // Cache
        await indexeddb.put('cachedMetrics', {
          key: 'retention-metrics',
          data,
          timestamp: Date.now(),
        });

        return data;
      } catch (error) {
        const cached = await indexeddb.get('cachedMetrics', 'retention-metrics');
        if (cached) return cached;
        throw error;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
