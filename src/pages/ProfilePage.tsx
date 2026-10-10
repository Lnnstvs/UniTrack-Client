
import { LogOut, Mail, ShieldCheck, UserRound } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { getCurrentUser, type AuthUser } from "../services/authService"
import { clearSession } from "../services/authSession"

function ProfilePage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    getCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        clearSession()
        if (active) {
          setError("Your session has expired. Please sign in again.")
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const handleLogout = () => {
    clearSession()
    navigate("/login", { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            View your account information and manage your session.
          </p>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            {loading ? (
              <p className="text-sm text-slate-500">Loading profile...</p>
            ) : error ? (
              <p role="alert" className="text-sm text-red-600">{error}</p>
            ) : user ? (
              <>
                <div className="flex flex-col items-center gap-5 sm:flex-row">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                    <UserRound className="h-9 w-9 text-indigo-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">{user.email}</p>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {user.status}
                    </span>
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Account Information
                  </h3>
                  <div className="mt-4 grid gap-5 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">Full Name</p>
                      <p className="mt-1 font-medium text-slate-800">{user.name}</p>
                    </div>
                    <div>
                      <p className="flex items-center gap-2 text-sm text-slate-500">
                        <Mail className="h-4 w-4" /> Email Address
                      </p>
                      <p className="mt-1 break-all font-medium text-slate-800">{user.email}</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">No account information available.</p>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-slate-900">Account</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign out to end your current browser session.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default ProfilePage