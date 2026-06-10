import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/stores/authStore'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useAIChat() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useMutation({
    mutationFn: async (data: { message: string; conversationHistory?: ChatMessage[] }) => {
      const response = await api.post(`/ai/${clinicId}/chat`, data)
      return response.data
    },
  })
}

export function useConversationHistory() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['ai', 'history', clinicId],
    queryFn: async () => {
      const response = await api.get(`/ai/${clinicId}/history`)
      return response.data.history
    },
    enabled: !!clinicId,
  })
}

export function useDailyReport() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['reports', 'daily', clinicId],
    queryFn: async () => {
      const response = await api.get(`/reports/${clinicId}/daily`)
      return response.data
    },
    enabled: !!clinicId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

export function useReportsHistory(limit: number = 30) {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['reports', 'history', clinicId, limit],
    queryFn: async () => {
      const response = await api.get(`/reports/${clinicId}/history?limit=${limit}`)
      return response.data
    },
    enabled: !!clinicId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

export function useLatestReport() {
  const clinicId = useAuthStore((state) => state.user?.clinic.id)

  return useQuery({
    queryKey: ['reports', 'latest', clinicId],
    queryFn: async () => {
      const response = await api.get(`/reports/${clinicId}/latest`)
      return response.data
    },
    enabled: !!clinicId,
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}
