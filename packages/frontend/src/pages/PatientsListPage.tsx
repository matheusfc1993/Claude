import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { usePatients, useCreatePatient } from '@/hooks/usePatients'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'

export default function PatientsListPage() {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinicId
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
  })

  const { patients, total, isLoading } = usePatients(clinicId || '', {
    search,
    take: 100,
  })

  const createMutation = useCreatePatient(clinicId || '')

  const filteredPatients = useMemo(() => {
    if (!search) return patients
    const lowercaseSearch = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.name.toLowerCase().includes(lowercaseSearch) ||
        p.email?.toLowerCase().includes(lowercaseSearch) ||
        p.phone?.toLowerCase().includes(lowercaseSearch)
    )
  }, [patients, search])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData)
      setFormData({ name: '', email: '', phone: '', document: '' })
      setShowForm(false)
    } catch (error) {
      console.error('Error creating patient:', error)
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Pacientes</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            {showForm ? 'Cancelar' : '+ Novo Paciente'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Novo Paciente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome *"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="CPF"
                  value={formData.document}
                  onChange={(e) => setFormData({ ...formData, document: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending || !formData.name}
                  className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {createMutation.isPending ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div>
          <input
            type="text"
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Patients Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Carregando pacientes...</div>
          ) : filteredPatients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {search ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    CPF
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {patient.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.email || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.phone || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {patient.document || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a
                        href={`/patients/${patient.id}`}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver detalhes →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="text-sm text-gray-600">
          Mostrando {filteredPatients.length} de {total} pacientes
        </div>
      </div>
    </MainLayout>
  )
}
