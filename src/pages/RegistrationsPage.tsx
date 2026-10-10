
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Check,
  RefreshCw,
  Search,
  UserPlus,
  XCircle,
  Trash2,
} from "lucide-react"
import {
  getRegistrations,
  createRegistration,
  confirmRegistration,
  cancelRegistration,
  deleteRegistration,
  type Registration,
} from "../services/registrationService"
import { getStudents, type Student } from "../services/studentService"
import { getEvents, type EventItem } from "../services/eventService"

type StatusFilter = "All" | "Pending" | "Confirmed" | "Cancelled"

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } }
  }
  return (
    err.response?.data?.message ||
    "The request failed. Please check the backend and try again."
  )
}

function RegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [eventFilter, setEventFilter] = useState("All")
  const [studentId, setStudentId] = useState("")
  const [eventId, setEventId] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadData = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const [registrationData, studentData, eventData] = await Promise.all([
        getRegistrations(),
        getStudents(),
        getEvents(),
      ])

      setRegistrations(registrationData)
      setStudents(studentData)
      setEvents(eventData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const activeStudents = useMemo(
    () => students.filter((student) => student.status === "Active"),
    [students]
  )

  const eligibleEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.status !== "Completed" &&
          event.status !== "Cancelled" &&
          (event.availableSlots ?? event.capacity) > 0
      ),
    [events]
  )

  const filteredRegistrations = useMemo(() => {
    const term = search.trim().toLowerCase()

    return registrations.filter((registration) => {
      const student = registration.studentId
      const event = registration.eventId

      const studentName =
        typeof student === "string" ? "" : student?.name || ""
      const studentNumber =
        typeof student === "string" ? "" : student?.studentId || ""
      const eventTitle =
        typeof event === "string" ? "" : event?.title || ""

      const matchesSearch =
        studentName.toLowerCase().includes(term) ||
        studentNumber.toLowerCase().includes(term) ||
        eventTitle.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "All" || registration.status === statusFilter

      const matchesEvent =
        eventFilter === "All" ||
        (typeof event === "string" ? event : event?._id) === eventFilter

      return matchesSearch && matchesStatus && matchesEvent
    })
  }, [registrations, search, statusFilter, eventFilter])

  const handleCreate = async () => {
    if (!studentId || !eventId) {
      setError("Please select both a student and an event.")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      await createRegistration({ studentId, eventId })
      setStudentId("")
      setEventId("")
      setSuccess("Registration created successfully.")
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleAction = async (
    registration: Registration,
    action: "confirm" | "cancel" | "delete"
  ) => {
    const student =
      typeof registration.studentId === "string"
        ? "this student"
        : registration.studentId?.name || "this student"

    if (
      action !== "confirm" &&
      !window.confirm(
        action === "cancel"
          ? `Cancel the registration for ${student}?`
          : `Permanently delete the registration for ${student}?`
      )
    ) {
      return
    }

    setBusyId(registration._id)
    setError("")
    setSuccess("")

    try {
      if (action === "confirm") {
        await confirmRegistration(registration._id)
        setSuccess("Registration confirmed.")
      } else if (action === "cancel") {
        await cancelRegistration(registration._id)
        setSuccess("Registration cancelled.")
      } else {
        await deleteRegistration(registration._id)
        setSuccess("Registration deleted.")
      }

      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const counts = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === "Pending").length,
    confirmed: registrations.filter((r) => r.status === "Confirmed").length,
    cancelled: registrations.filter((r) => r.status === "Cancelled").length,
  }

  const statusClass: Record<StatusFilter, string> = {
    All: "bg-slate-100 text-slate-700",
    Pending: "bg-amber-50 text-amber-700",
    Confirmed: "bg-emerald-50 text-emerald-700",
    Cancelled: "bg-red-50 text-red-700",
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registrations</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage student registrations for campus events.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </header>

        {error && (
          <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Registrations", value: counts.total },
            { label: "Pending", value: counts.pending },
            { label: "Confirmed", value: counts.confirmed },
            { label: "Cancelled", value: counts.cancelled },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">
                {loading ? "—" : item.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold text-slate-900">Register a Student</h2>
          <p className="mt-1 text-sm text-slate-500">
            Select an active student and an event with available slots.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto]">
            <label className="text-sm font-medium text-slate-700">
              Student
              <select
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              >
                <option value="">Select student</option>
                {activeStudents.map((student) => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.studentId})
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-medium text-slate-700">
              Event
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 font-normal"
              >
                <option value="">Select event</option>
                {eligibleEvents.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title} ({event.availableSlots ?? event.capacity} slots)
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={saving || loading || !activeStudents.length || !eligibleEvents.length}
              className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" />
              {saving ? "Registering..." : "Register Student"}
            </button>
          </div>

          {!loading && activeStudents.length === 0 && (
            <p className="mt-3 text-sm text-amber-700">
              No active students are available. Add or activate a student first.
            </p>
          )}
          {!loading && eligibleEvents.length === 0 && (
            <p className="mt-3 text-sm text-amber-700">
              No eligible events with available capacity were found.
            </p>
          )}
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">Registration Records</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Search registrations"
                  placeholder="Search student or event..."
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                aria-label="Filter registration status"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                {(["All", "Pending", "Confirmed", "Cancelled"] as StatusFilter[]).map((status) => (
                  <option key={status} value={status}>
                    {status === "All" ? "All Statuses" : status}
                  </option>
                ))}
              </select>

              <select
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
                aria-label="Filter by event"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
              >
                <option value="All">All Events</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>{event.title}</option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-slate-500">Loading registrations...</p>
          ) : filteredRegistrations.length === 0 ? (
            <div className="p-10 text-center">
              <p className="font-medium text-slate-700">No registrations found</p>
              <p className="mt-1 text-sm text-slate-500">
                Create a registration or change your filters.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Student</th>
                    <th className="px-5 py-3 font-medium">Event</th>
                    <th className="px-5 py-3 font-medium">Registered On</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRegistrations.map((registration) => {
                    const student = registration.studentId
                    const event = registration.eventId
                    const studentName =
                      typeof student === "string" ? "Unknown student" : student?.name || "Unknown student"
                    const studentNumber =
                      typeof student === "string" ? "" : student?.studentId || ""
                    const eventTitle =
                      typeof event === "string" ? "Unknown event" : event?.title || "Unknown event"

                    return (
                      <tr key={registration._id}>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-900">{studentName}</p>
                          <p className="mt-1 text-xs text-slate-500">{studentNumber}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{eventTitle}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {registration.registeredAt
                            ? new Date(registration.registeredAt).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[registration.status]}`}>
                            {registration.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {registration.status === "Pending" && (
                              <button
                                type="button"
                                title="Confirm registration"
                                aria-label={`Confirm registration for ${studentName}`}
                                disabled={busyId === registration._id}
                                onClick={() => void handleAction(registration, "confirm")}
                                className="rounded-lg border border-emerald-200 p-2 text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            {registration.status !== "Cancelled" && (
                              <button
                                type="button"
                                title="Cancel registration"
                                aria-label={`Cancel registration for ${studentName}`}
                                disabled={busyId === registration._id}
                                onClick={() => void handleAction(registration, "cancel")}
                                className="rounded-lg border border-amber-200 p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              title="Delete registration"
                              aria-label={`Delete registration for ${studentName}`}
                              disabled={busyId === registration._id}
                              onClick={() => void handleAction(registration, "delete")}
                              className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default RegistrationsPage