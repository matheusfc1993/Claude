import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useGameStore } from '../stores/gameStore'
import { useAuthStore } from '../stores/authStore'
import { localGameStorage } from '../services/localGameStorage'
import { localGameEngine } from '../services/localGameEngine'
import type { PoliticalGame, GameTurn, GameDecision, PoliticalPosition } from '../types/game'

export function useStartGame() {
  const queryClient = useQueryClient()
  const { setGame, setCurrentTurn, setIsLoading, setError } = useGameStore()
  const user = useAuthStore((state) => state.user)

  return useMutation({
    mutationFn: async (startingPosition: PoliticalPosition) => {
      if (!user?.id) throw new Error('User not authenticated')

      // Create game locally
      const game = localGameStorage.createGame(user.id, startingPosition)

      // Generate first turn
      const situationData = localGameEngine.generateSituation(game)
      const turn = localGameStorage.createTurn(game.id, 1, situationData.situation, situationData.choices)

      return { game, currentTurn: turn }
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

      const game = localGameStorage.getGame(gameId)
      if (!game) throw new Error('Game not found')

      const turns = localGameStorage.getTurns(gameId)
      const currentTurn = turns.find((t) => t.turnNumber === game.currentTurn)

      setGame(game)
      setCurrentTurn(currentTurn || null)

      return { game, currentTurn }
    },
    enabled: !!gameId,
    staleTime: 10 * 1000,
  })
}

export function useMakeDecision(gameId: string) {
  const queryClient = useQueryClient()
  const { setGame, setCurrentTurn, setError } = useGameStore()

  return useMutation({
    mutationFn: async (chosenOptionIndex: number) => {
      const game = localGameStorage.getGame(gameId)
      if (!game) throw new Error('Game not found')

      const currentTurn = localGameStorage.getTurn(gameId, game.currentTurn)
      if (!currentTurn) throw new Error('Current turn not found')

      const chosenOption = (currentTurn.choices as any[])[chosenOptionIndex]
      const consequence = localGameEngine.generateConsequence(game, chosenOption.text)

      // Update turn with decision
      currentTurn.chosenIndex = chosenOptionIndex
      currentTurn.consequence = consequence.consequence
      localGameStorage.updateTurn(currentTurn)

      // Create decision record
      const decision: GameDecision = {
        id: `decision_${gameId}_${game.currentTurn}`,
        gameId,
        turnNumber: game.currentTurn,
        chosenText: chosenOption.text,
        tokensUsed: 0,
        reputationChange: consequence.reputationChange,
        fundsChange: consequence.fundsChange,
        ideologyShift: consequence.ideologyShift,
        newAllies: consequence.newAllies,
        createdAt: new Date().toISOString(),
      }

      localGameStorage.createDecision(decision)

      // Update game state
      const newReputation = Math.max(0, Math.min(100, game.reputation + consequence.reputationChange))
      const newFunds = game.campaignFunds + consequence.fundsChange
      const newIdeology = mergeIdeology(game.ideology, consequence.ideologyShift)
      const newAllies = Array.isArray(game.allies) ? [...game.allies, ...consequence.newAllies] : consequence.newAllies
      const decisionHistory = Array.isArray(game.decisionHistory) ? game.decisionHistory : []
      decisionHistory.push({
        turn: game.currentTurn,
        choice: chosenOption.text,
        consequences: {
          reputationChange: consequence.reputationChange,
          fundsChange: consequence.fundsChange,
          newAllies: consequence.newAllies,
        },
      })

      game.currentTurn += 1
      game.reputation = newReputation
      game.campaignFunds = newFunds
      game.ideology = newIdeology
      game.allies = newAllies
      game.decisionHistory = decisionHistory
      game.updatedAt = new Date().toISOString()

      localGameStorage.updateGame(game)

      // Generate next turn
      const nextSituationData = localGameEngine.generateSituation(game)
      const nextTurn = localGameStorage.createTurn(gameId, game.currentTurn, nextSituationData.situation, nextSituationData.choices)

      return {
        decision,
        game,
        currentTurn: nextTurn,
      }
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
  const user = useAuthStore((state) => state.user)

  return useQuery({
    queryKey: ['games'],
    queryFn: async () => {
      if (!user?.id) return []
      return localGameStorage.getAllGames(user.id)
    },
    enabled: !!user?.id,
  })
}

export function useTurnHistory(gameId: string | undefined, limit = 10) {
  return useQuery({
    queryKey: ['turnHistory', gameId],
    queryFn: async () => {
      if (!gameId) return []
      const turns = localGameStorage.getTurns(gameId)
      return turns.slice(-limit)
    },
    enabled: !!gameId,
  })
}

function mergeIdeology(current: any, shift: any): any {
  const merged = { ...current }
  for (const key in shift) {
    if (merged[key] !== undefined) {
      merged[key] = Math.max(0, Math.min(1, merged[key] + shift[key]))
    }
  }
  return merged
}
