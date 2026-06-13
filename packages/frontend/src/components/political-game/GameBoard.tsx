import React from 'react'
import { GameTurn } from '../../types/game'
import { useMakeDecision } from '../../hooks/usePoliticalGame'

interface GameBoardProps {
  gameId: string
  currentTurn: GameTurn | null
  isLoading?: boolean
}

export function GameBoard({ gameId, currentTurn, isLoading = false }: GameBoardProps) {
  const [selectedChoice, setSelectedChoice] = React.useState<number | null>(null)
  const { mutate: makeDecision, isPending } = useMakeDecision(gameId)

  const handleChoice = (index: number) => {
    setSelectedChoice(index)
    makeDecision(index, {
      onSuccess: () => {
        setSelectedChoice(null)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!currentTurn) {
    return <div className="text-center text-gray-500">No turn available</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Turno {currentTurn.turnNumber}</h2>

        <div className="prose prose-sm max-w-none mb-6">
          <p className="text-gray-700 leading-relaxed">{currentTurn.situation}</p>
        </div>

        {currentTurn.consequence && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Consequência</h3>
            <p className="text-blue-800 text-sm">{currentTurn.consequence}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Suas Opções</h3>

        <div className="space-y-3">
          {Array.isArray(currentTurn.choices) && currentTurn.choices.length > 0 ? (
            currentTurn.choices.map((choice, index) => (
              <button
                key={index}
                onClick={() => handleChoice(index)}
                disabled={isPending || currentTurn.chosenIndex !== null}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedChoice === index
                    ? 'border-blue-500 bg-blue-50'
                    : currentTurn.chosenIndex !== null
                      ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                      : 'border-gray-200 hover:border-blue-500 hover:bg-blue-50'
                }`}
              >
                <p className="font-medium text-gray-900">{choice.text}</p>
                <p className="text-sm text-gray-600 mt-1">{choice.expectedImpact}</p>
              </button>
            ))
          ) : (
            <p className="text-gray-500">No choices available</p>
          )}
        </div>

        {isPending && (
          <div className="mt-4 flex items-center text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm">Processando decisão...</span>
          </div>
        )}
      </div>
    </div>
  )
}
