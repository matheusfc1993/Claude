import { useLatestReport } from '@/hooks/useAI'

export default function DailyReport() {
  const { data: report, isLoading } = useLatestReport()

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">📊 Daily Executive Report</h2>
        <p className="text-gray-500">Loading report...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">📊 Daily Executive Report</h2>
        <p className="text-gray-500 text-center py-8">
          No report available yet. Reports are generated daily at 20:00 (8 PM).
        </p>
      </div>
    )
  }

  const urgencyColors = {
    LOW: 'bg-green-50 border-green-200 text-green-800',
    MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    HIGH: 'bg-orange-50 border-orange-200 text-orange-800',
    CRITICAL: 'bg-red-50 border-red-200 text-red-800',
  }

  const urgencyBadge = (urgencyColors as any)[report.urgencyLevel] || urgencyColors.MEDIUM

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      <div className="flex justify-between items-start">
        <h2 className="text-xl font-bold">📊 Daily Executive Report</h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold border ${urgencyBadge}`}
        >
          {report.urgencyLevel}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Diagnosis */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Diagnosis</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{report.diagnosis}</p>
        </div>

        {/* Financial Impact */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Financial Impact</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{report.financialImpact}</p>
        </div>

        {/* Main Cause */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Main Cause</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{report.mainCause}</p>
        </div>

        {/* Priority Recommendation */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Priority Recommendation</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {report.priorityRecommendation}
          </p>
        </div>
      </div>

      {/* Report Date */}
      <div className="pt-4 border-t text-xs text-gray-500">
        Generated: {new Date(report.reportDate).toLocaleDateString('pt-BR')} at{' '}
        {new Date(report.createdAt).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  )
}
