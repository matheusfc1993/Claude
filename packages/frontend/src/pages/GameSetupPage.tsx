import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useStartGame, useListPlayerGames } from '../hooks/usePoliticalGame'
import type { PoliticalPosition } from '../types/game'

const STARTING_POSITIONS: Array<{ value: PoliticalPosition; label: string; description: string }> = [
  {
    value: 'VEREADOR',
    label: 'Vereador(a)',
    description: 'Comece em uma pequena cidade. Menor visibilidade, mas mais liberdade de ação.',
  },
  {
    value: 'DEPUTADO_ESTADUAL',
    label: 'Deputado(a) Estadual',
    description: 'Nível estadual. Mais visibilidade e influência política.',
  },
  {
    value: 'DEPUTADO_FEDERAL',
    label: 'Deputado(a) Federal',
    description: 'Nível federal. Maior desafio e mais cobertura da mídia.',
  },
  {
    value: 'SENADOR',
    label: 'Senador(a)',
    description: 'Elite política nacional. Máxima responsabilidade.',
  },
]

export function GameSetupPage() {
  const [selectedPosition, setSelectedPosition] = React.useState<PoliticalPosition | null>(null)
  const navigate = useNavigate()

  const { mutate: startGame, isPending } = useStartGame()
  const { data: games, isLoading: isLoadingGames } = useListPlayerGames()

  const handleStartGame = async () => {
    if (!selectedPosition) return

    startGame(selectedPosition, {
      onSuccess: (data) => {
        navigate(`/games/political/${data.game.id}`)
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Jogo de Política Infinito</h1>
        <p className="text-gray-600 text-lg">
          Comece sua carreira política e evolua em turnos infinitos com a ajuda da IA.
        </p>
      </div>

      {/* Active Games */}
      {!isLoadingGames && games && games.length > 0 && (
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4">Seus Jogos Ativos</h2>
          <div className="space-y-2">
            {games.map((game) => (
              <button
                key={game.id}
                onClick={() => navigate(`/games/political/${game.id}`)}
                className="w-full text-left p-3 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
              >
                <p className="font-medium text-gray-900">{game.currentPosition} - Turno {game.currentTurn}</p>
                <p className="text-sm text-gray-600">Reputação: {game.reputation}/100</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Starting Position Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Escolha sua posição inicial</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {STARTING_POSITIONS.map((position) => (
            <button
              key={position.value}
              onClick={() => setSelectedPosition(position.value)}
              className={`text-left p-6 rounded-lg border-2 transition-all ${
                selectedPosition === position.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{position.label}</h3>
              <p className="text-gray-600">{position.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <div className="flex gap-4">
        <button
          onClick={handleStartGame}
          disabled={!selectedPosition || isPending}
          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Iniciando...' : 'Iniciar Jogo'}
        </button>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
        >
          Voltar
        </button>
      </div>
    </div>
  )
}
