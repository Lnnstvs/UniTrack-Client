import { Link } from "react-router-dom"
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Users,
} from "lucide-react"

function LandingPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Navigation */}
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-slate-900">
                UniTrack
              </h1>

              <p className="hidden text-xs text-slate-500 sm:block">
                Campus Management
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Register
            </Link>
          </div>

        </div>
      </header>

      {/* Hero */}
      <main>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8">

            <div className="mx-auto max-w-3xl text-center">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700">
                <CheckCircle2 className="h-4 w-4" />
                Campus Event & Attendance Management
              </div>

              <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Manage Campus Events
                <span className="block text-indigo-600">
                  All in One Place
                </span>
              </h2>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                UniTrack helps students discover campus events, register
                easily, and keep track of their attendance while giving
                organizers the tools to manage events and participants.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Create an Account
                </Link>

              </div>

            </div>

          </div>
        </section>

        {/* Features */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-slate-900">
                Everything You Need
              </h2>

              <p className="mt-4 text-slate-600">
                A centralized platform for managing campus events,
                registrations, and attendance.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              {/* Events */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                  <CalendarDays className="h-6 w-6 text-indigo-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  Discover Events
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Browse upcoming campus events and find activities
                  that match your interests.
                </p>
              </div>

              {/* Attendance */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  Track Attendance
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Manage registrations and record attendance for
                  campus activities.
                </p>
              </div>

              {/* Statistics */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                  <BarChart3 className="h-6 w-6 text-violet-600" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-slate-900">
                  View Statistics
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Understand event participation through attendance
                  and registration statistics.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-600">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">

            <h2 className="text-3xl font-bold text-white">
              Ready to get started?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
              Join UniTrack and make campus event management simpler.
            </p>

            <Link
              to="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              Create Your Account
              <ArrowRight className="h-5 w-5" />
            </Link>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          © 2026 UniTrack — Campus Event & Attendance Management System
        </div>
      </footer>

    </div>
  )
}

export default LandingPage