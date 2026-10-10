
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  Users,
  Pencil,
  RefreshCw,
} from "lucide-react"
import {
  getEventById,
  type EventItem,
  type EventStatus,
} from "../services/eventService"

function EventDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    async function loadEvent() {
      if (!id) {
        setError("The event ID is missing.")
        setLoading(false)
        return
      }

      setLoading(true)
      setError("")

      try {
        const data = await getEventById(id)
        if (active) setEvent(data)
      } catch (err) {
        console.error("Failed to load event:", err)
        if (active) {
          setError("Unable to load this event. It may have been deleted.")
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadEvent()

    return () => {
      active = false
    }
  }, [id])

  const formatDate = (date: string) => {
    if (!date) return "Date not set"

    return new Date(`${date.slice(0, 10)}T00:00:00`).toLocaleDateString(
      undefined,
      { year: "numeric", month: "long", day: "numeric" }
    )
  }

  const statusClasses: Record<EventStatus, string> = {
    Upcoming: "bg-blue-50 text-blue-700",
    Ongoing: "bg-emerald-50 text-emerald-700",
    Completed: "bg-slate-100 text-slate-700",
    Cancelled: "bg-red-50 text-red-700",
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <p className="py-12 text-center text-slate-500">
          Loading event details...
        </p>
      </main>
    )
  }

  if (error || !event) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-blue-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <section className="mx-auto mt-8 max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Event unavailable</h1>
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error || "This event could not be found."}
          </p>
        </section>
      </main>
    )
  }

  const registeredCount = event.registeredCount ?? 0
  const availableSlots =
    event.availableSlots ?? Math.max(event.capacity - registeredCount, 0)

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={async () => {
                if (!id) return
                setLoading(true)
                setError("")
                try {
                  setEvent(await getEventById(id))
                } catch {
                  setError("Unable to refresh event details.")
                } finally {
                  setLoading(false)
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <Link
              to={`/events/${event._id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Pencil className="h-4 w-4" />
              Edit Event
            </Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="flex min-h-40 items-center justify-center bg-blue-50 p-8">
            <CalendarDays className="h-16 w-16 text-blue-300" />
          </div>

          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClasses[event.status]}`}>
                {event.status}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                {event.categoryId?.name || "Uncategorized"}
              </span>
            </div>

            <h1 className="mt-4 break-words text-3xl font-bold text-slate-900">
              {event.title}
            </h1>

            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-600">
              {event.description || "No description provided."}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Event Date</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDate(event.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Schedule</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {event.startTime} – {event.endTime}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Venue</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {event.venueId?.name || "Venue unavailable"}
                  </p>
                  {event.venueId?.location && (
                    <p className="mt-1 text-sm text-slate-500">
                      {event.venueId.location}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
                <Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="text-xs text-slate-500">Registration Capacity</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {registeredCount} / {event.capacity} registered
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {availableSlots} slots available
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-5">
              <Link
                to="/registrations"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View Registrations →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

export default EventDetailsPage