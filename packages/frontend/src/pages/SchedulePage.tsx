import { useState, useMemo } from 'react'
import MainLayout from '@/components/layout/MainLayout'
import { useAvailableBlocks, useCreateAppointment, usePatientAppointments } from '@/hooks/useSchedule'
import { usePatients } from '@/hooks/usePatients'
import { useAuthStore } from '@/stores/authStore'
import { format, addDays, isMonday, isTuesday, isWednesday, isThursday, isFriday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function SchedulePage() {
  const user = useAuthStore((state) => state.user)
  const clinicId = user?.clinicId
  const professionals = user?.clinic?.professionals || []

  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [selectedProfessional, setSelectedProfessional] = useState(
    professionals[0]?.id || ''
  )
  const [selectedPatient, setSelectedPatient] = useState('')
  const [selectedBlock, setSelectedBlock] = useState('')
  const [showModal, setShowModal] = useState(false)

  if (!clinicId) {
    return <MainLayout><div>Carregando...</div></MainLayout>
  }

  const { patients } = usePatients(clinicId, { take: 1000 })
  const { blocks, isLoading } = useAvailableBlocks(
    clinicId,
    selectedDate,
    selectedProfessional
  )
  const createMutation = useCreateAppointment(clinicId)

  // Generate next 30 days excluding weekends
  const availableDates = useMemo(() => {
    const dates = []
    let currentDate = new Date()

    for (let i = 0; i < 30; i++) {
      const dayOfWeek = currentDate.getDay()
      // Only Monday (1) to Friday (5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        dates.push(format(currentDate, 'yyyy-MM-dd'))
      }
      currentDate = addDays(currentDate, 1)
    }

    return dates
  }, [])

  const handleCreateAppointment = async () => {
    if (!selectedPatient || !selectedBlock) {
      alert('Selecione paciente e horário')
      return
    }

    try {
      await createMutation.mutateAsync({
        clinicId,
        patientId: selectedPatient,
        professionalId: selectedProfessional,
        timeBlockId: selectedBlock,
        date: new Date(selectedDate),
        status: 'SCHEDULED',
      })
      setShowModal(false)
      setSelectedPatient('')
      setSelectedBlock('')
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  const displayedBlocks = blocks?.blocks || []
  const isMobile = window.innerWidth < 768

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <button
            onClick={() => setShowModal(!showModal)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition"
          >
            {showModal ? 'Cancelar' : '+ Novo Agendamento'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Professional Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profissional
              </label>
              <select
                value={selectedProfessional}
                onChange={(e) => setSelectedProfessional(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {professionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {availableDates.map((date) => (
                  <option key={date} value={date}>
                    {format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Appointment Modal */}
        {showModal && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Novo Agendamento</h2>

            <div className="space-y-4">
              {/* Patient Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paciente *
                </label>
                <select
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um paciente...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Block Select */}
              {isLoading ? (
                <div className="text-center py-4 text-gray-500">Carregando blocos disponíveis...</div>
              ) : displayedBlocks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Nenhum bloco disponível para a data selecionada
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horário *
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {displayedBlocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => setSelectedBlock(block.id)}
                        disabled={!block.isAvailable}
                        className={`p-3 rounded border text-sm font-medium transition ${
                          selectedBlock === block.id
                            ? 'bg-blue-500 text-white border-blue-500'
                            : block.isAvailable
                            ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {block.startTime}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={handleCreateAppointment}
                  disabled={createMutation.isPending || !selectedPatient || !selectedBlock}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition"
                >
                  {createMutation.isPending ? 'Agendando...' : 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blocks Grid */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Blocos de {selectedDate && format(new Date(selectedDate), 'dd/MM/yyyy')} -{' '}
            {professionals.find((p) => p.id === selectedProfessional)?.name}
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Carregando blocos...</div>
          ) : displayedBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum bloco disponível para os filtros selecionados
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {displayedBlocks.map((block) => (
                <div
                  key={block.id}
                  className={`p-4 rounded border text-center transition ${
                    block.isAvailable
                      ? 'bg-green-50 border-green-200 hover:border-green-400'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p className="font-semibold text-gray-900">
                    {block.startTime} - {block.endTime}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {block.isAvailable ? '✓ Disponível' : '✗ Ocupado'}
                  </p>
                  {!block.isAvailable && block.appointment?.patient && (
                    <p className="text-xs text-gray-500 mt-1">
                      {block.appointment.patient.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
