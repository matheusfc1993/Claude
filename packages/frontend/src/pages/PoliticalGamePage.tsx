import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGameStore } from '../stores/gameStore'
import { useGameState } from '../hooks/usePoliticalGame'
import { GameBoard } from '../components/political-game/GameBoard'
import { MetricsPanel } from '../components/political-game/MetricsPanel'

export function PoliticalGamePage() {
  const { gameId } = useParams<{ gameId: string }>()
  const navigate = useNavigate()
  const game = useGameStore((state) => state.game)
  const currentTurn = useGameStore((state) => state.currentTurn)
  const { isLoading, error } = useGameState(gameId)

  if (!gameId) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Jogo não encontrado</h1>
        <button
          onClick={() => navigate('/games/political/setup')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Iniciar novo jogo
        </button>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao carregar jogo</h1>
        <p className="text-gray-600 mb-4">{error instanceof Error ? error.message : 'Erro desconhecido'}</p>
        <button
          onClick={() => navigate('/games/political')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Voltar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Jogo de Política</h1>
        <p className="text-gray-600">Turno {game?.currentTurn || 0}</p>
      </div>

      <MetricsPanel game={game} />

      <GameBoard gameId={gameId} currentTurn={currentTurn} isLoading={isLoading} />
    </div>
  )
}
