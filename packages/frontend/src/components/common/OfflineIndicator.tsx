import { useState, useEffect } from 'react'
import { useOfflineSync } from '@/hooks/useOfflineSync'

export default function OfflineIndicator() {
  const { isOnline, pendingCount, syncNow } = useOfflineSync()
  const [showSync, setShowSync] = useState(false)

  useEffect(() => {
    if (pendingCount > 0) {
      setShowSync(true)
    }
  }, [pendingCount])

  if (isOnline && pendingCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-xs">
      {!isOnline && (
        <div className="mb-3 bg-amber-100 border border-amber-400 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-amber-900">
                Modo offline
              </span>
            </div>
          </div>
          <p className="text-xs text-amber-700 mt-1">
            Suas alterações serão sincronizadas quando voltar online
          </p>
        </div>
      )}

      {showSync && pendingCount > 0 && (
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-4 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-900">
                {pendingCount} alteração{pendingCount !== 1 ? 's' : ''} pendente{pendingCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            {isOnline && (
              <button
                onClick={syncNow}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium py-2 px-3 rounded transition"
              >
                Sincronizar agora
              </button>
            )}
            <button
              onClick={() => setShowSync(false)}
              className="bg-blue-200 hover:bg-blue-300 text-blue-900 text-xs font-medium py-2 px-3 rounded transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
