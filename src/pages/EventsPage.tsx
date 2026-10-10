
import {
  CalendarDays,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  RefreshCw,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import {
  deleteEvent,
  getEvents,
  updateEventStatus,
  type EventItem,
  type EventStatus,
} from "../services/eventService"

const statuses = ["All", "Upcoming", "Ongoing", "Completed", "Cancelled"]

function getErrorMessage(error: unknown): string {
  const err = error as {
    response?: { data?: { message?: string } }
  }

  return (
    err.response?.data?.message ||
    "Something went wrong. Please check the backend and try again."
  )
}

function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")
  const [sortBy, setSortBy] = useState("date")
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getEvents()
      setEvents(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadEvents()
  }, [loadEvents])

  const categories = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(events.map((event) => event.categoryId?.name).filter(Boolean))
      ),
    ],
    [events]
  )

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase()

    return events
      .filter((event) => {
        const matchesSearch =
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          (event.venueId?.name || "").toLowerCase().includes(term)

        const matchesCategory =
          categoryFilter === "All" ||
          event.categoryId?.name === categoryFilter

        const matchesStatus =
          statusFilter === "All" || event.status === statusFilter

        return matchesSearch && matchesCategory && matchesStatus
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title)
        if (sortBy === "capacity") return b.capacity - a.capacity
        if (sortBy === "category") {
          return (a.categoryId?.name || "").localeCompare(
            b.categoryId?.name || ""
          )
        }

        return a.date.localeCompare(b.date)
      })
  }, [events, search, categoryFilter, statusFilter, sortBy])

  const handleStatusChange = async (
    event: EventItem,
    status: EventStatus
  ) => {
    setBusyId(event._id)
    setError("")
    setSuccess("")

    try {
      const updated = await updateEventStatus(event._id, status)

      setEvents((current) =>
        current.map((item) =>
          item._id === event._id ? { ...item, ...updated } : item
        )
      )

      setSuccess(`"${event.title}" status updated to ${status}.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const handleDelete = async (event: EventItem) => {
    const confirmed = window.confirm(
      `Delete "${event.title}"? Related registrations may also be deleted.`
    )

    if (!confirmed) return

    setBusyId(event._id)
    setError("")
    setSuccess("")

    try {
      await deleteEvent(event._id)
      setEvents((current) =>
        current.filter((item) => item._id !== event._id)
      )
      setSuccess(`"${event.title}" was deleted.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const formatDate = (date: string) => {
    if (!date) return "Date not set"

    return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const statusClass: Record<EventStatus, string> = {
    Upcoming: "bg-blue-50 text-blue-700",
    Ongoing: "bg-emerald-50 text-emerald-700",
    Completed: "bg-slate-100 text-slate-700",
    Cancelled: "bg-red-50 text-red-700",
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Events</h1>
            <p className="mt-1 text-sm text-slate-500">
              Create and manage campus events.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              to="/events/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Events</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "—" : events.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Upcoming</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "—" : events.filter((e) => e.status === "Upcoming").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Ongoing</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading ? "—" : events.filter((e) => e.status === "Ongoing").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">Total Capacity</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {loading
                ? "—"
                : events.reduce((total, event) => total + event.capacity, 0)}
            </p>
          </div>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Search events"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All Categories" : category}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Statuses" : status}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort events"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
          >
            <option value="date">Sort by date</option>
            <option value="title">Sort by title</option>
            <option value="category">Sort by category</option>
            <option value="capacity">Sort by capacity</option>
          </select>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Event List</h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading ? "Loading events..." : `${filteredEvents.length} event(s) found`}
            </p>
          </div>

          {loading ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Loading events from the database...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-10 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="font-medium text-slate-700">No events found</p>
              <p className="mt-1 text-sm text-slate-500">
                Create an event or adjust your search and filters.
              </p>
              <Link
                to="/events/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create First Event
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEvents.map((event) => (
                <article
                  key={event._id}
                  className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900">
                        {event.title}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass[event.status]}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-600">
                      {event.description || "No description provided."}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(event.date)} · {event.startTime}–{event.endTime}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {event.venueId?.name || "Venue unavailable"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {event.registeredCount ?? 0} registered / {event.capacity} capacity
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      Category: {event.categoryId?.name || "Uncategorized"} ·{" "}
                      {event.availableSlots ?? Math.max(event.capacity - (event.registeredCount ?? 0), 0)} slots available
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`status-${event._id}`}>
                      Change status for {event.title}
                    </label>
                    <select
                      id={`status-${event._id}`}
                      value={event.status}
                      disabled={busyId === event._id}
                      onChange={(e) =>
                        void handleStatusChange(
                          event,
                          e.target.value as EventStatus
                        )
                      }
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:opacity-50"
                    >
                      {statuses.filter((s) => s !== "All").map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <Link
                      to={`/events/${event._id}/edit`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      disabled={busyId === event._id}
                      onClick={() => void handleDelete(event)}
                      aria-label={`Delete ${event.title}`}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default EventsPage