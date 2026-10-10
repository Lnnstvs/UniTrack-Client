
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FolderOpen,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  getDashboardStats,
  type DashboardStats,
} from "../services/dashboardService"

const emptyStats: DashboardStats = {
  students: 0,
  activeStudents: 0,
  events: 0,
  upcomingEvents: 0,
  registrations: 0,
  confirmedRegistrations: 0,
  attendance: 0,
  availableVenues: 0,
  categories: 0,
}

function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getDashboardStats()
      setStats(data)
    } catch {
      setError(
        "Unable to load dashboard statistics. Check that the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStats()
  }, [loadStats])

  const cards = [
    {
      title: "Total Students",
      value: stats.students,
      subtitle: `${stats.activeStudents} active`,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      link: "/students",
    },
    {
      title: "Total Events",
      value: stats.events,
      subtitle: `${stats.upcomingEvents} upcoming`,
      icon: CalendarDays,
      color: "bg-violet-50 text-violet-600",
      link: "/events",
    },
    {
      title: "Registrations",
      value: stats.registrations,
      subtitle: `${stats.confirmedRegistrations} confirmed`,
      icon: ClipboardList,
      color: "bg-amber-50 text-amber-600",
      link: "/registrations",
    },
    {
      title: "Attendance Records",
      value: stats.attendance,
      subtitle: "Recorded attendance",
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
      link: "/attendance",
    },
    {
      title: "Available Venues",
      value: stats.availableVenues,
      subtitle: "Currently available",
      icon: MapPin,
      color: "bg-rose-50 text-rose-600",
      link: "/venues",
    },
    {
      title: "Categories",
      value: stats.categories,
      subtitle: "Event categories",
      icon: FolderOpen,
      color: "bg-indigo-50 text-indigo-600",
      link: "/categories",
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of campus events and attendance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadStats()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadStats()}
              className="ml-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        )}

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            System Overview
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => {
              const Icon = card.icon

              return (
                <Link
                  key={card.title}
                  to={card.link}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        {card.title}
                      </p>
                      <p className="mt-3 text-3xl font-bold text-slate-900">
                        {loading ? "—" : card.value}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {card.subtitle}
                      </p>
                    </div>

                    <div className={`rounded-xl p-3 ${card.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Navigate to common tasks.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              to="/events/create"
              className="rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create Event
            </Link>
            <Link
              to="/students"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Manage Students
            </Link>
            <Link
              to="/registrations"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Registrations
            </Link>
            <Link
              to="/statistics"
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Statistics
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

export default DashboardPage