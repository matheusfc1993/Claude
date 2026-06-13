import React from 'react'
import { PoliticalGame } from '../../types/game'

interface MetricsPanelProps {
  game: PoliticalGame | null
}

export function MetricsPanel({ game }: MetricsPanelProps) {
  if (!game) {
    return null
  }

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      VEREADOR: 'Vereador(a)',
      DEPUTADO_ESTADUAL: 'Deputado(a) Estadual',
      DEPUTADO_FEDERAL: 'Deputado(a) Federal',
      SENADOR: 'Senador(a)',
      PRESIDENTE: 'Presidente',
    }
    return labels[position] || position
  }

  const getReputationColor = (reputation: number) => {
    if (reputation >= 80) return 'text-green-600'
    if (reputation >= 60) return 'text-blue-600'
    if (reputation >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Position */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-600 text-sm font-medium mb-2">Cargo Atual</p>
        <p className="text-lg font-bold text-gray-900">{getPositionLabel(game.currentPosition)}</p>
      </div>

      {/* Reputation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-600 text-sm font-medium mb-2">Reputação</p>
        <div className="flex items-end gap-2">
          <p className={`text-2xl font-bold ${getReputationColor(game.reputation)}`}>
            {game.reputation}
          </p>
          <p className="text-gray-600 text-sm mb-1">/100</p>
        </div>
        <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all ${
              game.reputation >= 80
                ? 'bg-green-600'
                : game.reputation >= 60
                  ? 'bg-blue-600'
                  : game.reputation >= 40
                    ? 'bg-yellow-600'
                    : 'bg-red-600'
            }`}
            style={{ width: `${game.reputation}%` }}
          ></div>
        </div>
      </div>

      {/* Campaign Funds */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-600 text-sm font-medium mb-2">Caixa de Campanha</p>
        <p className="text-lg font-bold text-gray-900">
          R$ {game.campaignFunds.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
        </p>
      </div>

      {/* Allies */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <p className="text-gray-600 text-sm font-medium mb-2">Aliados</p>
        <p className="text-2xl font-bold text-gray-900">{Array.isArray(game.allies) ? game.allies.length : 0}</p>
      </div>
    </div>
  )
}
