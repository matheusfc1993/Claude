import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ProfessionalData {
  name: string
  totalRevenue: number
  appointmentCount: number
}

interface ProfessionalChartProps {
  data: ProfessionalData[]
}

export default function ProfessionalChart({ data }: ProfessionalChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Professional Performance</h2>
        <p className="text-gray-500 text-center py-8">No professional data available</p>
      </div>
    )
  }

  const chartData = data
    .slice(0, 10) // Top 10 professionals
    .map((item) => ({
      name: item.name.split(' ')[0], // First name only for space
      revenue: Math.round(Number(item.totalRevenue)),
      appointments: item.appointmentCount,
    }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Top Professionals by Revenue</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'revenue') {
                return `R$ ${Number(value).toLocaleString('pt-BR')}`
              }
              return value
            }}
          />
          <Legend />
          <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue (R$)" />
          <Bar yAxisId="right" dataKey="appointments" fill="#10b981" name="Appointments" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
