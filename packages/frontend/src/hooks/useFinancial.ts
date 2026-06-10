import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

export function useFixedExpenses() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['financial', 'fixed-expenses', clinicId],
    queryFn: async () => {
      const response = await api.get(`/financial/${clinicId}/fixed-expenses`)
      return response.data
    },
    enabled: !!clinicId,
  })
}

export function useVariableExpenses(startDate?: string, endDate?: string) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['financial', 'variable-expenses', clinicId, startDate, endDate],
    queryFn: async () => {
      let url = `/financial/${clinicId}/variable-expenses`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await api.get(url)
      return response.data
    },
    enabled: !!clinicId,
  })
}

export function useRevenues(startDate?: string, endDate?: string) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['financial', 'revenues', clinicId, startDate, endDate],
    queryFn: async () => {
      let url = `/financial/${clinicId}/revenues`
      const params = new URLSearchParams()
      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (params.toString()) url += `?${params.toString()}`

      const response = await api.get(url)
      return response.data
    },
    enabled: !!clinicId,
  })
}

export function useProfessionals() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['financial', 'professionals', clinicId],
    queryFn: async () => {
      const response = await api.get(`/financial/${clinicId}/professionals`)
      return response.data
    },
    enabled: !!clinicId,
  })
}

export function useCreateFixedExpense() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/financial/${clinicId}/fixed-expenses`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial', 'fixed-expenses', clinicId],
      })
    },
  })
}

export function useCreateVariableExpense() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/financial/${clinicId}/variable-expenses`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial', 'variable-expenses'],
      })
    },
  })
}

export function useCreateRevenue() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/financial/${clinicId}/revenues`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial', 'revenues'],
      })
    },
  })
}

export function useCreateProfessional() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/financial/${clinicId}/professionals`, data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['financial', 'professionals', clinicId],
      })
    },
  })
}
