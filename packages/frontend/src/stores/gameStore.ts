import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PoliticalGame, GameTurn } from '../types/game'

interface GameStore {
  // State
  game: PoliticalGame | null
  currentTurn: GameTurn | null
  isLoading: boolean
  error: string | null

  // Actions
  setGame: (game: PoliticalGame) => void
  setCurrentTurn: (turn: GameTurn | null) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      game: null,
      currentTurn: null,
      isLoading: false,
      error: null,

      setGame: (game) => set({ game }),
      setCurrentTurn: (turn) => set({ currentTurn: turn }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      resetGame: () =>
        set({
          game: null,
          currentTurn: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: 'game-store',
      partialize: (state) => ({
        game: state.game,
        currentTurn: state.currentTurn,
      }),
    }
  )
)
