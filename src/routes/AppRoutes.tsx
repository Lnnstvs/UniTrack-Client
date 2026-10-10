
import { Navigate, Route, Routes } from "react-router-dom"

import AppLayout from "../components/layout/AppLayout"
import ProtectedRoute from "../components/ProtectedRoute"

import LandingPage from "../pages/LandingPage"
import LoginPage from "../pages/LoginPage"
import RegisterPage from "../pages/RegisterPage"
import DashboardPage from "../pages/DashboardPage"
import EventsPage from "../pages/EventsPage"
import EventDetailsPage from "../pages/EventDetailsPage"
import CreateEventPage from "../pages/CreateEventPage"
import EditEventPage from "../pages/EditEventPage"
import RegistrationsPage from "../pages/RegistrationsPage"
import AttendancePage from "../pages/AttendancePage"
import StudentsPage from "../pages/StudentsPage"
import VenuesPage from "../pages/VenuesPage"
import CategoriesPage from "../pages/CategoriesPage"
import StatisticsPage from "../pages/StatisticsPage"
import ProfilePage from "../pages/ProfilePage"

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
     <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<AppLayout><DashboardPage /></AppLayout>}
        />
        <Route
          path="/events"
          element={<AppLayout><EventsPage /></AppLayout>}
        />
        <Route
          path="/events/create"
          element={<AppLayout><CreateEventPage /></AppLayout>}
        />
        <Route
          path="/events/:id/edit"
          element={<AppLayout><EditEventPage /></AppLayout>}
        />
        <Route
          path="/events/:id"
          element={<AppLayout><EventDetailsPage /></AppLayout>}
        />
        <Route
          path="/registrations"
          element={<AppLayout><RegistrationsPage /></AppLayout>}
        />
        <Route
          path="/attendance"
          element={<AppLayout><AttendancePage /></AppLayout>}
        />
        <Route
          path="/students"
          element={<AppLayout><StudentsPage /></AppLayout>}
        />
        <Route
          path="/venues"
          element={<AppLayout><VenuesPage /></AppLayout>}
        />
        <Route
          path="/categories"
          element={<AppLayout><CategoriesPage /></AppLayout>}
        />
        <Route
          path="/statistics"
          element={<AppLayout><StatisticsPage /></AppLayout>}
        />
        <Route
          path="/profile"
          element={<AppLayout><ProfilePage /></AppLayout>}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes