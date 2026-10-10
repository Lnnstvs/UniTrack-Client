import {
  BarChart3,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Settings,
  Users,
} from "lucide-react"
import { NavLink } from "react-router-dom"

const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Events",
    path: "/events",
    icon: CalendarDays,
  },
  {
    name: "Registrations",
    path: "/registrations",
    icon: ClipboardCheck,
  },
  {
    name: "Attendance",
    path: "/attendance",
    icon: BarChart3,
  },
  {
    name: "Students",
    path: "/students",
    icon: Users,
  },
  {
    name: "Venues",
    path: "/venues",
    icon: MapPin,
  },
  {
    name: "Categories",
    path: "/categories",
    icon: FolderOpen,
  },
  {
    name: "Statistics",
    path: "/statistics",
    icon: BarChart3,
  },
]

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
          <GraduationCap className="h-6 w-6 text-white" />
        </div>

        <div>
          <h1 className="text-lg font-bold text-slate-900">
            UniTrack
          </h1>

          <p className="text-xs text-slate-500">
            Campus Event & Attendance Management
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Management
        </p>

        <div className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* Profile */}
      <div className="shrink-0 border-t border-slate-200 p-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <Settings className="h-5 w-5" />
          <span>Profile</span>
        </NavLink>
      </div>
    </aside>
  )
}

export default Sidebar