
import { ArrowLeft, CalendarDays, Save } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  getEventById,
  updateEvent,
  type EventItem,
  type EventInput,
} from "../services/eventService"
import { getCategories, type Category } from "../services/categoryService"
import { getVenues, type Venue } from "../services/venueService"

const editEventSchema = z
  .object({
    title: z.string().trim().min(3, "Event title must be at least 3 characters"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    categoryId: z.string().min(1, "Please select a category"),
    date: z.string().min(1, "Please select an event date"),
    startTime: z.string().min(1, "Please enter the start time"),
    endTime: z.string().min(1, "Please enter the end time"),
    venueId: z.string().min(1, "Please select a venue"),
    capacity: z.coerce.number().int().min(1).max(10000),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
  })

type FormInput = z.input<typeof editEventSchema>
type FormData = z.output<typeof editEventSchema>

function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<EventItem | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormData>({
  resolver: zodResolver(editEventSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      date: "",
      startTime: "",
      endTime: "",
      venueId: "",
      capacity: 1,
    },
  })

  useEffect(() => {
    let active = true

    async function loadPage() {
      if (!id) {
        setLoadError("The event ID is missing.")
        setLoading(false)
        return
      }

      setLoading(true)
      setLoadError("")

      try {
        const [eventData, categoryData, venueData] = await Promise.all([
          getEventById(id),
          getCategories(),
          getVenues(),
        ])

        if (!active) return

        setEvent(eventData)
        setCategories(categoryData)
        setVenues(venueData)

        reset({
          title: eventData.title,
          description: eventData.description || "",
          categoryId:
            typeof eventData.categoryId === "string"
              ? eventData.categoryId
              : eventData.categoryId?._id || "",
          date: eventData.date?.slice(0, 10) || "",
          startTime: eventData.startTime,
          endTime: eventData.endTime,
          venueId:
            typeof eventData.venueId === "string"
              ? eventData.venueId
              : eventData.venueId?._id || "",
          capacity: eventData.capacity,
        })
      } catch (err) {
        console.error("Failed to load event:", err)
        if (active) {
          setLoadError(
            "Unable to load this event. It may have been deleted, or the backend may be unavailable."
          )
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadPage()

    return () => {
      active = false
    }
  }, [id, reset])

  const onSubmit = async (data: FormData) => {
    if (!id) return

    setSaveError("")

    const payload: EventInput = {
      title: data.title.trim(),
      description: data.description.trim(),
      categoryId: data.categoryId,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      venueId: data.venueId,
      capacity: data.capacity,
    }

    try {
      await updateEvent(id, payload)
      navigate("/events", {
        state: { message: "Event updated successfully." },
      })
    } catch (err) {
      console.error("Failed to update event:", err)

      const error = err as {
        response?: { data?: { message?: string } }
      }

      setSaveError(
        error.response?.data?.message ||
          "Unable to update the event. Please check your details and try again."
      )
    }
  }

  const inputClass =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <p className="mx-auto max-w-3xl py-12 text-center text-slate-500">
          Loading event details...
        </p>
      </main>
    )
  }

  if (loadError || !event) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <Link to="/events" className="inline-flex items-center gap-2 text-sm text-blue-600">
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>
        <section className="mx-auto mt-8 max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center">
          <h1 className="text-xl font-bold text-slate-900">Unable to open event</h1>
          <p role="alert" className="mt-2 text-sm text-red-600">
            {loadError || "Event not found."}
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        <header className="mb-6 mt-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Edit Event</h1>
              <p className="mt-1 text-sm text-slate-500">
                Update event details saved in the database.
              </p>
            </div>
          </div>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-8"
        >
          {saveError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {saveError}
            </div>
          )}

          <div>
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              Event Title *
            </label>
            <input id="title" {...register("title")} className={inputClass} />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-slate-700">
              Description *
            </label>
            <textarea
              id="description"
              rows={4}
              {...register("description")}
              className={inputClass}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="categoryId" className="text-sm font-medium text-slate-700">
                Category *
              </label>
              <select id="categoryId" {...register("categoryId")} className={inputClass}>
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Add a category before editing this event.
                </p>
              )}
              {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>}
            </div>

            <div>
              <label htmlFor="venueId" className="text-sm font-medium text-slate-700">
                Venue *
              </label>
              <select id="venueId" {...register("venueId")} className={inputClass}>
                <option value="">Select a venue</option>
                {venues.map((venue) => (
                  <option key={venue._id} value={venue._id}>
                    {venue.name} — {venue.location}
                  </option>
                ))}
              </select>
              {venues.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  Add a venue before editing this event.
                </p>
              )}
              {errors.venueId && <p className="mt-1 text-sm text-red-600">{errors.venueId.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="date" className="text-sm font-medium text-slate-700">
              Event Date *
            </label>
            <input
              id="date"
              type="date"
              {...register("date")}
              className={inputClass}
            />
            {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="startTime" className="text-sm font-medium text-slate-700">
                Start Time *
              </label>
              <input
                id="startTime"
                type="time"
                {...register("startTime")}
                className={inputClass}
              />
              {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime.message}</p>}
            </div>

            <div>
              <label htmlFor="endTime" className="text-sm font-medium text-slate-700">
                End Time *
              </label>
              <input
                id="endTime"
                type="time"
                {...register("endTime")}
                className={inputClass}
              />
              {errors.endTime && <p className="mt-1 text-sm text-red-600">{errors.endTime.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="capacity" className="text-sm font-medium text-slate-700">
              Event Capacity *
            </label>
            <input
              id="capacity"
              type="number"
              min={1}
              max={10000}
              {...register("capacity")}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              Capacity cannot be lower than the number of active registrations.
            </p>
            {errors.capacity && <p className="mt-1 text-sm text-red-600">{errors.capacity.message}</p>}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Link
              to="/events"
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default EditEventPage