import { useParams } from 'react-router-dom'
import MainLayout from '@/components/layout/MainLayout'
import { usePatientById } from '@/hooks/usePatients'
import { usePatientMetrics } from '@/hooks/usePatientMetrics'
import { usePatientAppointments } from '@/hooks/useSchedule'
import { useAuthStore } from '@/stores/authStore'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { format } from 'date-fns'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinicId

  if (!clinicId || !patientId) {
    return <MainLayout><div>Carregando...</div></MainLayout>
  }

  const { patient, isLoading: patientLoading } = usePatientById(clinicId, patientId)
  const { data: metrics, isLoading: metricsLoading } = usePatientMetrics(clinicId, patientId)
  const { appointments } = usePatientAppointments(clinicId, patientId)

  if (patientLoading || metricsLoading) {
    return (
      <MainLayout>
        <div className="text-center py-12">Carregando detalhes do paciente...</div>
      </MainLayout>
    )
  }

  if (!patient || !metrics) {
    return (
      <MainLayout>
        <div className="text-center py-12 text-red-500">Paciente não encontrado</div>
      </MainLayout>
    )
  }

  const serviceData = metrics.revenue.totalByService.slice(0, 5)
  const monthlyData = metrics.revenue.monthlyTrend

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{patient.name}</h1>
            <div className="text-gray-600 space-y-1 mt-2">
              {patient.email && <p>📧 {patient.email}</p>}
              {patient.phone && <p>📱 {patient.phone}</p>}
              {patient.document && <p>📋 {patient.document}</p>}
            </div>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
          >
            ← Voltar
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Total Gasto</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              R$ {metrics.revenue.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Visitas</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{metrics.revenue.visitCount}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Média por Visita</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">
              R$ {metrics.revenue.averagePerVisit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Margem de Lucro</p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              {metrics.profitMargin.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Tendência Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  dot={false}
                  name="Receita"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue by Service */}
          {serviceData.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Receita por Serviço</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    dataKey="total"
                    nameKey="serviceName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Service Breakdown */}
        {serviceData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Serviços Utilizados</h2>
            <div className="space-y-3">
              {metrics.revenue.totalByService.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">{service.serviceName}</p>
                      <p className="text-sm text-gray-600">{service.count} sessão{service.count !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    R$ {service.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Appointments */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Últimos Atendimentos</h2>
          {appointments && appointments.appointments.length > 0 ? (
            <div className="space-y-2">
              {appointments.appointments.slice(0, 10).map((apt, index) => (
                <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{apt.service?.name || 'Serviço'}</p>
                    <p className="text-sm text-gray-600">
                      {format(new Date(apt.date), 'dd/MM/yyyy')} - {apt.professional?.name || 'Profissional'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      R$ {apt.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </p>
                    <p className="text-xs text-gray-600">
                      {apt.status === 'COMPLETED' && '✓ Concluído'}
                      {apt.status === 'SCHEDULED' && '○ Agendado'}
                      {apt.status === 'CANCELLED' && '✗ Cancelado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">Nenhum atendimento registrado</p>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
