import { useState } from 'react'
import { useCreateFixedExpense, useFixedExpenses } from '@/hooks/useFinancial'

export default function FixedExpensesForm() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    dueDay: '',
  })
  const [error, setError] = useState('')

  const createExpense = useCreateFixedExpense()
  const expenses = useFixedExpenses()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await createExpense.mutateAsync({
        name: formData.name,
        category: formData.category,
        amount: parseFloat(formData.amount),
        dueDay: parseInt(formData.dueDay),
      })

      setFormData({ name: '', category: '', amount: '', dueDay: '' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create expense')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Add Fixed Expense</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expense Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select category</option>
            <option value="rent">Rent</option>
            <option value="utilities">Utilities</option>
            <option value="insurance">Insurance</option>
            <option value="supplies">Supplies</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount (R$)
          </label>
          <input
            type="number"
            name="amount"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Due Day (1-31)
          </label>
          <input
            type="number"
            name="dueDay"
            min="1"
            max="31"
            value={formData.dueDay}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={createExpense.isPending}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition"
        >
          {createExpense.isPending ? 'Adding...' : 'Add Expense'}
        </button>
      </form>

      {/* List of fixed expenses */}
      {expenses.data && expenses.data.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Fixed Expenses</h3>
          <div className="space-y-2">
            {expenses.data.map((exp: any) => (
              <div key={exp.id} className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{exp.name}</p>
                  <p className="text-sm text-gray-600">{exp.category} - Due day {exp.dueDay}</p>
                </div>
                <p className="font-semibold">R$ {Number(exp.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
