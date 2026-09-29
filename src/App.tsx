import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'
import LandingPage from './marketing/LandingPage'
import Login from './auth/Login'
import Signup from './auth/Signup'
import MapDashboard from './app/components/MapDashboard'
import VehiclesPage from './vehicles/components/VehiclesPage'
import VehiclesLayoutPage from './vehicles/components/VehiclesLayoutPage'
import Dashboard from './dashboard/components/Dashboard'

/**
 * App-wide route map. Providers wrap everything once, here, so any
 * page — marketing, auth, or the dashboard — can just call
 * useTheme() / useLanguage() / useAuth() without extra wiring.
 *
 * Adding a new page? See docs/GUIDE.md → "Adding a new page".
 */
export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/vehicles" element={<VehiclesLayoutPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <MapDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
  path="/app/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
