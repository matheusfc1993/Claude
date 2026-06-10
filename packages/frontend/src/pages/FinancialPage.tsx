import { useState } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import FixedExpensesForm from '@/components/financial/FixedExpensesForm'
import VariableExpensesForm from '@/components/financial/VariableExpensesForm'
import ProfessionalsForm from '@/components/financial/ProfessionalsForm'

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<'expenses' | 'revenues' | 'professionals'>('expenses')

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Financial Management</h1>

        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'expenses'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'revenues'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Revenues
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`px-4 py-2 font-medium ${
              activeTab === 'professionals'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600'
            }`}
          >
            Professionals
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          {activeTab === 'expenses' && <FixedExpensesForm />}
          {activeTab === 'revenues' && <VariableExpensesForm />}
          {activeTab === 'professionals' && <ProfessionalsForm />}
        </div>
      </div>
    </MainLayout>
  )
}
