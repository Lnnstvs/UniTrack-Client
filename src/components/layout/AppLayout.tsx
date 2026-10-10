import type { ReactNode } from "react"
import Sidebar from "./Sidebar"

interface AppLayoutProps {
  children: ReactNode
}

function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen min-w-0 lg:pl-64">
        {children}
      </main>
    </div>
  )
}

export default AppLayout