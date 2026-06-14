import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import indexeddb from '@/services/indexeddb';

interface Patient {
  id: string;
  clinicId: string;
  name: string;
  email?: string;
  phone?: string;
  birthDate?: string;
  document?: string;
  address?: string;
  isActive: boolean;
}

interface UsePatientFilters {
  search?: string;
  skip?: number;
  take?: number;
}

export function usePatients(clinicId: string, filters: UsePatientFilters = {}) {
  const queryClient = useQueryClient();
  const [localPatients, setLocalPatients] = useState<Patient[]>([]);

  // Load from IndexedDB first
  useEffect(() => {
    const loadLocal = async () => {
      const cached = await indexeddb.getAllByIndex<Patient>('patients', 'clinicId', clinicId);
      setLocalPatients(cached.filter(p => p.isActive !== false));
    };
    loadLocal();
  }, [clinicId]);

  // Fetch from server
  const query = useQuery({
    queryKey: ['patients', clinicId, filters],
    queryFn: async () => {
      const params = new URLSearchParams({
        skip: String(filters.skip || 0),
        take: String(filters.take || 50),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/financial/${clinicId}/patients?${params}`);
      if (!response.ok) throw new Error('Failed to fetch patients');

      const data = await response.json();

      // Cache in IndexedDB
      await indexeddb.bulkPut('patients', data.patients);
      setLocalPatients(data.patients);

      return data;
    },
    initialData: { patients: localPatients, total: localPatients.length },
  });

  return {
    patients: query.data?.patients || localPatients,
    total: query.data?.total || 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export function usePatientById(clinicId: string, patientId: string) {
  const [localPatient, setLocalPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadLocal = async () => {
      const cached = await indexeddb.get<Patient>('patients', patientId);
      if (cached) setLocalPatient(cached);
    };
    loadLocal();
  }, [patientId]);

  const query = useQuery({
    queryKey: ['patient', clinicId, patientId],
    queryFn: async () => {
      const response = await fetch(`/api/financial/${clinicId}/patients/${patientId}`);
      if (!response.ok) throw new Error('Failed to fetch patient');

      const data = await response.json();
      await indexeddb.put('patients', data);
      setLocalPatient(data);

      return data;
    },
    enabled: !!patientId,
    initialData: localPatient,
  });

  return {
    patient: query.data || localPatient,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useCreatePatient(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData: Partial<Patient>) => {
      const response = await fetch(`/api/financial/${clinicId}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) throw new Error('Failed to create patient');
      return response.json();
    },
    onSuccess: async (data) => {
      await indexeddb.put('patients', data);
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useUpdatePatient(clinicId: string, patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientData: Partial<Patient>) => {
      const response = await fetch(`/api/financial/${clinicId}/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patientData),
      });

      if (!response.ok) throw new Error('Failed to update patient');
      return response.json();
    },
    onSuccess: async (data) => {
      await indexeddb.put('patients', data);
      queryClient.invalidateQueries({ queryKey: ['patient', clinicId, patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}

export function useDeletePatient(clinicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      const response = await fetch(`/api/financial/${clinicId}/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete patient');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });
}
