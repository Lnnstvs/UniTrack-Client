
import { MapPin, Plus, Search, Trash2, X } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  createVenue,
  deleteVenue,
  getVenues,
  updateVenue,
  type Venue,
} from "../services/venueService"

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as {
      response?: { data?: { message?: string } }
    }).response
    if (response?.data?.message) return response.data.message
  }
  return "Something went wrong. Please try again."
}

function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [form, setForm] = useState({
    name: "",
    location: "",
    capacity: "",
  })

  const loadVenues = async () => {
    setLoading(true)
    setError("")
    try {
      setVenues(await getVenues())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadVenues()
  }, [])

  const filteredVenues = useMemo(() => {
    const term = search.trim().toLowerCase()
    return venues.filter((venue) => {
      const matchesSearch =
        venue.name.toLowerCase().includes(term) ||
        venue.location.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "All" || venue.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [venues, search, statusFilter])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const capacity = Number(form.capacity)
    if (!form.name.trim() || !form.location.trim() ||
        !Number.isInteger(capacity) || capacity < 1) {
      setError("Enter a name, location, and a capacity of at least 1.")
      return
    }

    setSaving(true)
    try {
      await createVenue({
        name: form.name.trim(),
        location: form.location.trim(),
        capacity,
      })
      setForm({ name: "", location: "", capacity: "" })
      setShowModal(false)
      setSuccess("Venue created successfully.")
      await loadVenues()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (
    venue: Venue,
    status: "Available" | "Occupied"
  ) => {
    setBusyId(venue._id)
    setError("")
    setSuccess("")
    try {
      await updateVenue(venue._id, {
        name: venue.name,
        location: venue.location,
        capacity: venue.capacity,
        status,
      })
      setSuccess("Venue status updated.")
      await loadVenues()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const handleDelete = async (venue: Venue) => {
    if (!window.confirm(`Delete venue "${venue.name}"?`)) return

    setBusyId(venue._id)
    setError("")
    setSuccess("")
    try {
      await deleteVenue(venue._id)
      setVenues((current) =>
        current.filter((item) => item._id !== venue._id)
      )
      setSuccess("Venue deleted.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Venues</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage campus event locations and capacities.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal((value) => !value)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {showModal ? <X size={18} /> : <Plus size={18} />}
            {showModal ? "Close" : "Add Venue"}
          </button>
        </div>
      </header>

      <div className="space-y-5 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
            <button type="button" onClick={() => void loadVenues()} className="ml-3 underline">
              Retry
            </button>
          </div>
        )}
        {success && (
          <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {showModal && (
          <form onSubmit={handleCreate} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-3">
            <div>
              <label htmlFor="venueName" className="mb-2 block text-sm font-medium">Venue name</label>
              <input id="venueName" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div>
              <label htmlFor="venueLocation" className="mb-2 block text-sm font-medium">Location</label>
              <input id="venueLocation" required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div>
              <label htmlFor="venueCapacity" className="mb-2 block text-sm font-medium">Capacity</label>
              <input id="venueCapacity" type="number" min="1" step="1" required value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="w-full rounded-xl border border-slate-300 px-3 py-2.5" />
            </div>
            <div className="sm:col-span-3">
              <button disabled={saving} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                {saving ? "Saving..." : "Save Venue"}
              </button>
            </div>
          </form>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input aria-label="Search venues" placeholder="Search venues..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm" />
          </div>
          <select aria-label="Filter venue status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm">
            <option value="All">All statuses</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
          </select>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <p className="p-10 text-center text-sm text-slate-500">Loading venues...</p>
          ) : filteredVenues.length === 0 ? (
            <div className="p-12 text-center">
              <MapPin className="mx-auto h-10 w-10 text-slate-300" />
              <h2 className="mt-3 font-semibold text-slate-900">No venues found</h2>
              <p className="mt-1 text-sm text-slate-500">Add a venue or adjust your filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Venue</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Capacity</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVenues.map((venue) => (
                    <tr key={venue._id}>
                      <td className="px-5 py-4 font-semibold text-slate-900">{venue.name}</td>
                      <td className="px-5 py-4 text-slate-600">{venue.location}</td>
                      <td className="px-5 py-4 text-slate-600">{venue.capacity}</td>
                      <td className="px-5 py-4">
                        <select
                          aria-label={`Status for ${venue.name}`}
                          value={venue.status}
                          disabled={busyId === venue._id}
                          onChange={(e) => void handleStatusChange(venue, e.target.value as "Available" | "Occupied")}
                          className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                        >
                          <option value="Available">Available</option>
                          <option value="Occupied">Occupied</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button type="button" aria-label={`Delete ${venue.name}`} disabled={busyId === venue._id} onClick={() => void handleDelete(venue)} className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default VenuesPage