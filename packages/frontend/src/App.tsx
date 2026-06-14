import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import FinancialPage from './pages/FinancialPage'
import CFOAssistantPage from './pages/CFOAssistantPage'
import PatientsListPage from './pages/PatientsListPage'
import PatientDetailPage from './pages/PatientDetailPage'
import SchedulePage from './pages/SchedulePage'
import PrivateRoute from './components/common/PrivateRoute'
import OfflineIndicator from './components/common/OfflineIndicator'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <OfflineIndicator />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/cfo-assistant" element={<CFOAssistantPage />} />

            {/* Patient Management Routes */}
            <Route path="/patients" element={<PatientsListPage />} />
            <Route path="/patients/:patientId" element={<PatientDetailPage />} />

            {/* Schedule Routes */}
            <Route path="/schedule" element={<SchedulePage />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}
