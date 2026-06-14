import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import indexeddb from '@/services/indexeddb';
import SyncManager from '@/services/sync-manager';

interface TimeBlock {
  id: string;
  startTime: string;
  endTime: string;
  date: string;
  isAvailable: boolean;
  appointment?: any;
}

interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  professionalId: string;
  serviceId?: string;
  timeBlockId?: string;
  date: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  amount?: number;
}

let syncManager: SyncManager | null = null;

function getSyncManager(): SyncManager {
  if (!syncManager) {
    syncManager = new SyncManager({ apiBaseUrl: '' });
  }
  return syncManager;
}

export function useAvailableBlocks(
  clinicId: string,
  date: string,
  professionalId: string
) {
  const [localBlocks, setLocalBlocks] = useState<TimeBlock[]>([]);

  useEffect(() => {
    const loadLocal = async () => {
      const cached = await indexeddb.getAllByIndex<TimeBlock>(
        'timeBlocks',
        'date',
        date
      );
      const filtered = cached.filter(
        (b) => b.professionalId === professionalId && !b.appointment
      );
      setLocalBlocks(filtered);
    };
    loadLocal();
  }, [date, professionalId]);

  return useQuery({
    queryKey: ['availableBlocks', clinicId, date, professionalId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/schedule/${clinicId}/blocks/available?date=${date}&professionalId=${professionalId}`
        );

        if (!response.ok) {
          return { blocks: localBlocks };
        }

        const data = await response.json();
        await indexeddb.bulkPut('timeBlocks', data.blocks);
        setLocalBlocks(data.blocks);

        return data;
      } catch (error) {
        return { blocks: localBlocks };
      }
    },
    initialData: { blocks: localBlocks },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBlocksForDateRange(
  clinicId: string,
  startDate: string,
  endDate: string,
  professionalId: string
) {
  return useQuery({
    queryKey: ['blocksRange', clinicId, startDate, endDate, professionalId],
    queryFn: async () => {
      const response = await fetch(
        `/api/schedule/${clinicId}/blocks/range?startDate=${startDate}&endDate=${endDate}&professionalId=${professionalId}`
      );

      if (!response.ok) throw new Error('Failed to fetch blocks');

      const data = await response.json();
      await indexeddb.bulkPut('timeBlocks', data.blocks);

      return data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCreateAppointment(clinicId: string) {
  const queryClient = useQueryClient();
  const manager = getSyncManager();

  return useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>) => {
      if (navigator.onLine) {
        const response = await fetch(`/api/schedule/${clinicId}/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(appointmentData),
        });

        if (!response.ok) throw new Error('Failed to create appointment');
        return response.json();
      } else {
        // Queue for later
        const id = await manager.queueMutation(
          clinicId,
          'APPOINTMENT',
          'CREATE',
          appointmentData
        );

        // Return optimistic data
        return {
          id,
          ...appointmentData,
          _queued: true,
        };
      }
    },
    onSuccess: async (data) => {
      if (!data._queued) {
        await indexeddb.put('appointments', data);
      }
      queryClient.invalidateQueries({ queryKey: ['availableBlocks'] });
    },
  });
}

export function useUpdateAppointment(clinicId: string, appointmentId: string) {
  const queryClient = useQueryClient();
  const manager = getSyncManager();

  return useMutation({
    mutationFn: async (appointmentData: Partial<Appointment>) => {
      if (navigator.onLine) {
        const response = await fetch(
          `/api/schedule/${clinicId}/appointments/${appointmentId}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData),
          }
        );

        if (!response.ok) throw new Error('Failed to update appointment');
        return response.json();
      } else {
        await manager.queueMutation(
          clinicId,
          'APPOINTMENT',
          'UPDATE',
          appointmentData,
          appointmentId
        );

        return { id: appointmentId, ...appointmentData, _queued: true };
      }
    },
    onSuccess: async (data) => {
      if (!data._queued) {
        await indexeddb.put('appointments', data);
      }
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
  });
}

export function useCancelAppointment(clinicId: string) {
  const queryClient = useQueryClient();
  const manager = getSyncManager();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      if (navigator.onLine) {
        const response = await fetch(
          `/api/schedule/${clinicId}/appointments/${appointmentId}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) throw new Error('Failed to cancel appointment');
        return response.json();
      } else {
        await manager.queueMutation(
          clinicId,
          'APPOINTMENT',
          'DELETE',
          {},
          appointmentId
        );

        return { id: appointmentId, _queued: true };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['availableBlocks'] });
    },
  });
}

export function usePatientAppointments(clinicId: string, patientId: string) {
  const [localAppointments, setLocalAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (!patientId) return;

    const loadLocal = async () => {
      const cached = await indexeddb.getAllByIndex<Appointment>(
        'appointments',
        'patientId',
        patientId
      );
      setLocalAppointments(cached);
    };
    loadLocal();
  }, [patientId]);

  return useQuery({
    queryKey: ['patientAppointments', clinicId, patientId],
    queryFn: async () => {
      try {
        const response = await fetch(
          `/api/schedule/${clinicId}/patients/${patientId}/appointments`
        );

        if (!response.ok) {
          return { appointments: localAppointments };
        }

        const data = await response.json();
        await indexeddb.bulkPut('appointments', data);
        setLocalAppointments(data);

        return { appointments: data };
      } catch (error) {
        return { appointments: localAppointments };
      }
    },
    enabled: !!patientId,
    initialData: { appointments: localAppointments },
    staleTime: 5 * 60 * 1000,
  });
}
