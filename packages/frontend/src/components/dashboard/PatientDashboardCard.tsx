import { useAuthStore } from '@/stores/authStore'
import { useAllPatientMetrics, usePatientSegments, useRetentionMetrics } from '@/hooks/usePatientMetrics'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Link } from 'react-router-dom'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b']

export default function PatientDashboardCard() {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinicId

  if (!clinicId) return null

  const { data: allMetrics } = useAllPatientMetrics(clinicId, 'revenue')
  const { data: segments } = usePatientSegments(clinicId)
  const { data: retention } = useRetentionMetrics(clinicId)

  if (!allMetrics || !segments) return null

  const topPatients = allMetrics.slice(0, 5)
  const totalPatientRevenue = allMetrics.reduce((sum, p) => sum + p.totalRevenue, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Análise por Paciente</h2>
        <Link
          to="/patients"
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          Ver todos os pacientes →
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Total de Pacientes</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{allMetrics.length}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Receita Total</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            R$ {totalPatientRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Pacientes Ativos (30d)</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {retention?.activeLastMonth || 0}
          </p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm font-medium">Risco de Churn</p>
          <p className="text-2xl font-bold text-orange-600 mt-2">
            {retention?.churnRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Patients */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Top 5 Pacientes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topPatients}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Bar dataKey="totalRevenue" fill="#3b82f6" name="Receita Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patient Segments */}
        {segments && segments.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Segmentação de Pacientes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segments}
                  dataKey="count"
                  nameKey="segment"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} pacientes`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Segments Details */}
      {segments && segments.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Detalhes de Segmentação</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {segments.map((segment, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index] }}
                  ></div>
                  <p className="font-semibold text-gray-900">{segment.segment}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Pacientes: <span className="font-bold">{segment.count}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Percentual: <span className="font-bold">{segment.percentOfTotal.toFixed(1)}%</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Receita Média: <span className="font-bold">
                      R$ {segment.avgRevenuePerPatient.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex gap-3">
        <Link
          to="/patients"
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition text-center"
        >
          Gerenciar Pacientes
        </Link>
        <Link
          to="/schedule"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition text-center"
        >
          Agendar Consulta
        </Link>
      </div>
    </div>
  )
}
