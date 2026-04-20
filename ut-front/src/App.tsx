import React from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { NavBar } from './components/layout/NavBar/NavBar'
import { Footer } from './components/layout/Footer/Footer'
import { useAuth } from './context/AuthContext'

import { HomePage }               from './pages/HomePage/HomePage'
import { ServicesPage }           from './pages/ServicesPage/ServicesPage'
import { BookingWizard }          from './pages/BookingWizard/BookingWizard'
import { LoginPage }              from './pages/LoginPage/LoginPage'
import { SignUpPage }             from './pages/SignUpPage/SignUpPage'
import { PasswordResetPage }      from './pages/PasswordResetPage/PasswordResetPage'
import { AboutPage }              from './pages/AboutPage/AboutPage'
import { ContactPage }            from './pages/ContactPage/ContactPage'
import { FaqPage }                from './pages/FaqPage/FaqPage'
import { TermsPage }              from './pages/TermsPage/TermsPage'
import { PrivacyPage }            from './pages/PrivacyPage/PrivacyPage'
import { DashboardPage }          from './pages/DashboardPage/DashboardPage'
import { VehiclesPage }           from './pages/VehiclesPage/VehiclesPage'
import { AppointmentsPage }       from './pages/AppointmentsPage/AppointmentsPage'
import { AppointmentDetailsPage } from './pages/AppointmentDetailsPage/AppointmentDetailsPage'
import { AccountSettingsPage }    from './pages/AccountSettingsPage/AccountSettingsPage'
import { NotFoundPage }           from './pages/NotFoundPage/NotFoundPage'
import { PrivateRoute }           from './components/layout/PrivateRoute/PrivateRoute'
import { AdminRoute }             from './components/layout/AdminRoute/AdminRoute'
import { AdminLayout }             from './components/layout/AdminLayout/AdminLayout'
import { AdminAppointmentsPage }   from './pages/AdminAppointmentsPage/AdminAppointmentsPage'
import { OAuthCallbackPage }      from './pages/OAuthCallbackPage/OAuthCallbackPage'

const BARE_ROUTES = ['/login', '/signup', '/reset-password', '/oauth/callback']
const isAdminRoute = (pathname: string) => pathname.startsWith('/admin')

function App() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const isBare = BARE_ROUTES.includes(pathname) || isAdminRoute(pathname)

  const navUser = user
    ? {
        name:     user.name,
        email:    user.email,
        initials: user.name
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      }
    : null

  return (
    <>
      {!isBare && <NavBar user={navUser} onLogout={logout} isAdmin={user?.role === 'admin'} />}

      <Routes>
        {/* Public */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/services"       element={<ServicesPage />} />
        <Route path="/contact"        element={<ContactPage />} />
        <Route path="/terms"          element={<TermsPage />} />
        <Route path="/privacy"        element={<PrivacyPage />} />

        {/* Auth — bare layout */}
        <Route path="/login"          element={<LoginPage />} />
        <Route path="/signup"         element={<SignUpPage />} />
        <Route path="/reset-password" element={<PasswordResetPage />} />
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        {/* Protected */}
        <Route path="/dashboard"        element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/vehicles"         element={<PrivateRoute><VehiclesPage /></PrivateRoute>} />
        <Route path="/booking"          element={<PrivateRoute><BookingWizard /></PrivateRoute>} />
        <Route path="/appointments"     element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
        <Route path="/appointments/:id" element={<PrivateRoute><AppointmentDetailsPage /></PrivateRoute>} />
        <Route path="/account-settings" element={<PrivateRoute><AccountSettingsPage /></PrivateRoute>} />

        {/* Admin — guarded by AdminRoute, laid out with AdminLayout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="appointments" replace />} />
          <Route path="appointments" element={<AdminAppointmentsPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {!isBare && <Footer />}
    </>
  )
}

export default App

