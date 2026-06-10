import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ChartData {
  period: string
  revenue: {
    total: number
  }
  netIncome: number
  profitMargin: number
}

interface RevenueChartProps {
  data: ChartData[]
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    month: new Date(item.period).toLocaleDateString('pt-BR', { month: 'short' }),
    revenue: Math.round(item.revenue.total),
    netIncome: Math.round(item.netIncome),
  }))

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4">Revenue & Income Trend</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            name="Revenue"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="netIncome"
            stroke="#10b981"
            name="Net Income"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
