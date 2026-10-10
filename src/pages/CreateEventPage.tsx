
import { useEffect, useState } from "react"
import { ArrowLeft, CalendarDays, Save } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  getCategories,
  type Category,
} from "../services/categoryService"
import {
  getVenues,
  type Venue,
} from "../services/venueService"
import { createEvent } from "../services/eventService"

const schema = z.object({
  title: z.string().trim().min(3, "Event title must be at least 3 characters"),
  description: z.string().trim().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  date: z.string().min(1, "Please select an event date"),
  startTime: z.string().min(1, "Please enter the start time"),
  endTime: z.string().min(1, "Please enter the end time"),
  venueId: z.string().min(1, "Please select a venue"),
  capacity: z.number().int().min(1, "Capacity must be at least 1").max(10000),
}).refine((data) => data.startTime < data.endTime, {
  message: "End time must be later than start time",
  path: ["endTime"],
})

type FormData = z.infer<typeof schema>

function CreateEventPage() {
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
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

    Promise.all([getCategories(), getVenues()])
      .then(([categoryData, venueData]) => {
        if (!active) return
        setCategories(categoryData)
        setVenues(venueData)
      })
      .catch((err) => {
        console.error(err)
        if (active) {
          setError("Failed to load venues and categories. Check your backend connection.")
        }
      })
      .finally(() => {
        if (active) setLoadingOptions(false)
      })

    return () => {
      active = false
    }
  }, [])

  const onSubmit = async (data: FormData) => {
    setError("")

    try {
      await createEvent({
        title: data.title.trim(),
        description: data.description.trim(),
        categoryId: data.categoryId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        venueId: data.venueId,
        capacity: data.capacity,
      })

      navigate("/events")
    } catch (err) {
      console.error(err)
      setError("Failed to create the event. Check your information and try again.")
    }
  }

  const inputClass =
    "w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"

  const labelClass =
    "mb-2 block text-sm font-medium text-slate-700"

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="px-4 py-5 sm:px-6 lg:px-8">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Events
          </Link>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center gap-3">
            <CalendarDays className="h-7 w-7 text-indigo-600" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Create Event
              </h1>
              <p className="text-sm text-slate-500">
                Enter the details for a new campus event.
              </p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {!loadingOptions &&
            !error &&
            (categories.length === 0 || venues.length === 0) && (
              <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Add at least one category and one venue before creating an event.
                {" "}
                <Link to="/categories" className="font-semibold underline">
                  Categories
                </Link>
                {" · "}
                <Link to="/venues" className="font-semibold underline">
                  Venues
                </Link>
              </div>
            )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              {loadingOptions ? (
                <p className="py-6 text-sm text-slate-500">
                  Loading venues and categories...
                </p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="title" className={labelClass}>
                      Event Title
                    </label>
                    <input
                      id="title"
                      placeholder="Enter event title"
                      {...register("title")}
                      className={inputClass}
                    />
                    {errors.title && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="description" className={labelClass}>
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={5}
                      placeholder="Describe the event"
                      {...register("description")}
                      className={`${inputClass} resize-y`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="categoryId" className={labelClass}>
                        Category
                      </label>
                      <select
                        id="categoryId"
                        {...register("categoryId")}
                        className={inputClass}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.categoryId.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="venueId" className={labelClass}>
                        Venue
                      </label>
                      <select
                        id="venueId"
                        {...register("venueId")}
                        className={inputClass}
                      >
                        <option value="">Select a venue</option>
                        {venues.map((venue) => (
                          <option key={venue._id} value={venue._id}>
                            {venue.name} — {venue.location}
                          </option>
                        ))}
                      </select>
                      {errors.venueId && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.venueId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div>
                      <label htmlFor="date" className={labelClass}>
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        {...register("date")}
                        className={inputClass}
                      />
                      {errors.date && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.date.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="startTime" className={labelClass}>
                        Start Time
                      </label>
                      <input
                        id="startTime"
                        type="time"
                        {...register("startTime")}
                        className={inputClass}
                      />
                      {errors.startTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.startTime.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="endTime" className={labelClass}>
                        End Time
                      </label>
                      <input
                        id="endTime"
                        type="time"
                        {...register("endTime")}
                        className={inputClass}
                      />
                      {errors.endTime && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.endTime.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="capacity" className={labelClass}>
                      Maximum Capacity
                    </label>
                    <input
                      id="capacity"
                      type="number"
                      min="1"
                      max="10000"
                      {...register("capacity", { valueAsNumber: true })}
                      className="w-full max-w-sm rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                    />
                    {errors.capacity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.capacity.message}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-slate-500">
                      A new event starts with 0 registrations. Available slots
                      will equal the capacity you enter.
                    </p>
                  </div>
                </div>
              )}
            </section>

            <div className="flex justify-end gap-3">
              <Link
                to="/events"
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  loadingOptions ||
                  !!error ||
                  categories.length === 0 ||
                  venues.length === 0
                }
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {isSubmitting ? "Creating..." : "Create Event"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default CreateEventPage