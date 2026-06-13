import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGameStore } from '../stores/gameStore'
import { api } from '../services/api'
import type { PoliticalGame, GameTurn, GameDecision, PoliticalPosition } from '../types/game'

export function useStartGame() {
  const queryClient = useQueryClient()
  const { setGame, setCurrentTurn, setIsLoading, setError } = useGameStore()

  return useMutation({
    mutationFn: async (startingPosition: PoliticalPosition) => {
      const response = await api.post('/games/political/start', { startingPosition })
      return response.data
    },
    onSuccess: (data) => {
      setGame(data.game)
      setCurrentTurn(data.currentTurn)
      queryClient.invalidateQueries({ queryKey: ['games'] })
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to start game')
    },
  })
}

export function useGameState(gameId: string | undefined) {
  const { setGame, setCurrentTurn } = useGameStore()

  return useQuery({
    queryKey: ['game', gameId],
    queryFn: async () => {
      if (!gameId) return null
      const response = await api.get(`/games/political/${gameId}`)
      const data = response.data
      setGame(data.game)
      setCurrentTurn(data.currentTurn)
      return data
    },
    enabled: !!gameId,
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useMakeDecision(gameId: string) {
  const queryClient = useQueryClient()
  const { setGame, setCurrentTurn, setError } = useGameStore()

  return useMutation({
    mutationFn: async (chosenOptionIndex: number) => {
      const response = await api.post(`/games/political/${gameId}/decide`, {
        chosenOptionIndex,
      })
      return response.data
    },
    onSuccess: (data) => {
      setGame(data.game)
      setCurrentTurn(data.currentTurn)
      queryClient.invalidateQueries({ queryKey: ['game', gameId] })
      queryClient.invalidateQueries({ queryKey: ['turnHistory', gameId] })
    },
    onError: (error) => {
      setError(error instanceof Error ? error.message : 'Failed to make decision')
    },
  })
}

export function useListPlayerGames() {
  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      const response = await api.get('/games/political')
      return response.data.games
    },
  })
}

export function useTurnHistory(gameId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['turnHistory', gameId],
    queryFn: async () => {
      if (!gameId) return []
      const response = await api.get(`/games/political/${gameId}/history`, {
        params: { limit },
      })
      return response.data.turns
    },
    enabled: !!gameId,
  })
}
