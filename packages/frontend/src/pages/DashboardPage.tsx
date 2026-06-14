import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/components/layout/MainLayout'
import MetricCard from '@/components/dashboard/MetricCard'
import RevenueChart from '@/components/dashboard/RevenueChart'
import ExpenseChart from '@/components/dashboard/ExpenseChart'
import ProfessionalChart from '@/components/dashboard/ProfessionalChart'
import DailyReport from '@/components/dashboard/DailyReport'
import PatientDashboardCard from '@/components/dashboard/PatientDashboardCard'
import { useDashboardMetrics, useMonthlyTrend, useExpenseBreakdown, useProfessionalMetrics } from '@/hooks/useMetrics'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const [days, setDays] = useState(30)

  const dashboardMetrics = useDashboardMetrics()
  const monthlyTrend = useMonthlyTrend(12)
  const expenseBreakdown = useExpenseBreakdown(days)
  const professionalMetrics = useProfessionalMetrics(days)

  if (dashboardMetrics.isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-500">Loading metrics...</p>
        </div>
      </MainLayout>
    )
  }

  const metrics = dashboardMetrics.data || {}
  const revenueChange = metrics.comparison?.revenueChange || 0
  const expenseChange = metrics.comparison?.expenseChange || 0
  const profitChange = metrics.comparison?.profitChange || 0

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={metrics.revenue?.total || 0}
            format="currency"
            change={revenueChange}
            icon="📊"
            trend={revenueChange >= 0 ? 'up' : 'down'}
          />

          <MetricCard
            title="Total Expenses"
            value={metrics.expenses?.total || 0}
            format="currency"
            change={expenseChange}
            icon="💸"
            trend={expenseChange <= 0 ? 'up' : 'down'}
          />

          <MetricCard
            title="Net Income"
            value={metrics.netIncome || 0}
            format="currency"
            change={profitChange}
            icon="💰"
            trend={profitChange >= 0 ? 'up' : 'down'}
          />

          <MetricCard
            title="Profit Margin"
            value={metrics.profitMargin || 0}
            format="percentage"
            icon="📈"
            trend={metrics.profitMargin > 20 ? 'up' : 'neutral'}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {monthlyTrend.data && (
            <RevenueChart data={monthlyTrend.data} />
          )}

          {expenseBreakdown.data && (
            <ExpenseChart data={expenseBreakdown.data} />
          )}
        </div>

        {/* Professional Metrics */}
        {professionalMetrics.data && professionalMetrics.data.length > 0 && (
          <ProfessionalChart data={professionalMetrics.data} />
        )}

        {/* Daily Report */}
        <DailyReport />

        {/* Patient Analytics Section */}
        <div className="border-t-2 border-gray-300 pt-8 mt-8">
          <PatientDashboardCard />
        </div>

        {!monthlyTrend.data && (
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <p className="text-gray-600">
              Welcome to CFO Virtual, <strong>{user?.name}</strong>. Start by adding financial data
              to see detailed analytics and get AI-powered recommendations.
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
