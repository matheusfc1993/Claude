import { useAuthStore } from '@/stores/authStore'
import MainLayout from '@/components/layout/MainLayout'

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Revenue</h3>
            <p className="text-3xl font-bold mt-2">R$ 0,00</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Expenses</h3>
            <p className="text-3xl font-bold mt-2">R$ 0,00</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Profit Margin</h3>
            <p className="text-3xl font-bold mt-2">0%</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-sm font-medium">Cash Flow</h3>
            <p className="text-3xl font-bold mt-2">R$ 0,00</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
          <p className="text-gray-600">
            Welcome to CFO Virtual, <strong>{user?.name}</strong>. Start by adding financial data
            to see analytics and get AI-powered recommendations.
          </p>
        </div>
      </div>
    </MainLayout>
  )
}
