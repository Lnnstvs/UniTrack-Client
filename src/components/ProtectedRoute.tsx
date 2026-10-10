
import { Navigate, Outlet, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { getCurrentUser } from "../services/authService"
import { clearSession } from "../services/authSession"

function ProtectedRoute() {
  const location = useLocation()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    let active = true

    const verifySession = async () => {
      try {
        const token = sessionStorage.getItem("unitrack_token")

        if (!token) {
          if (active) setAuthorized(false)
          return
        }

        await getCurrentUser()

        if (active) setAuthorized(true)
      } catch {
        clearSession()
        if (active) setAuthorized(false)
      } finally {
        if (active) setChecking(false)
      }
    }

    void verifySession()

    return () => {
      active = false
    }
  }, [])

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Verifying your session...
      </div>
    )
  }

  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}

export default ProtectedRoute