
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Search,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  updateAttendance,
  type AttendanceRecord,
  type AttendanceStatus,
} from "../services/attendanceService"
import {
  getRegistrations,
  type Registration,
} from "../services/registrationService"

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (error as {
      response?: { data?: { message?: string } }
    }).response

    if (response?.data?.message) {
      return response.data.message
    }
  }

  return "Something went wrong. Please try again."
}

function formatDate(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString()
}

function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [selectedRegistration, setSelectedRegistration] = useState("")
  const [selectedStatus, setSelectedStatus] =
    useState<AttendanceStatus>("Present")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [busyId, setBusyId] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const loadData = async () => {
    setLoading(true)
    setError("")

    try {
      const [attendanceData, registrationData] = await Promise.all([
        getAttendance(),
        getRegistrations(),
      ])

      setRecords(attendanceData)
      setRegistrations(registrationData)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const confirmedRegistrations = registrations.filter(
    (registration) => registration.status === "Confirmed"
  )

  const registrationsWithoutAttendance = confirmedRegistrations.filter(
    (registration) =>
      !records.some(
        (record) =>
          record.registrationId &&
          typeof record.registrationId === "object" &&
          record.registrationId._id === registration._id
      )
  )

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase()

    return records.filter((record) => {
      const studentName =
        typeof record.studentId === "object"
          ? record.studentId?.name ?? ""
          : ""

      const studentNumber =
        typeof record.studentId === "object"
          ? record.studentId?.studentId ?? ""
          : ""

      const eventTitle =
        typeof record.eventId === "object"
          ? record.eventId?.title ?? ""
          : ""

      const matchesSearch =
        studentName.toLowerCase().includes(term) ||
        studentNumber.toLowerCase().includes(term) ||
        eventTitle.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === "All" || record.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [records, search, statusFilter])

  const presentCount = records.filter(
    (record) => record.status === "Present"
  ).length

  const absentCount = records.filter(
    (record) => record.status === "Absent"
  ).length

  const handleMarkAttendance = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!selectedRegistration) {
      setError("Please select a confirmed registration.")
      return
    }

    setSaving(true)

    try {
      await createAttendance({
        registrationId: selectedRegistration,
        status: selectedStatus,
      })

      setSelectedRegistration("")
      setSelectedStatus("Present")
      setSuccess("Attendance recorded successfully.")
      await loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateStatus = async (
    record: AttendanceRecord,
    status: AttendanceStatus
  ) => {
    setBusyId(record._id)
    setError("")
    setSuccess("")

    try {
      await updateAttendance(record._id, status)
      setRecords((current) =>
        current.map((item) =>
          item._id === record._id ? { ...item, status } : item
        )
      )
      setSuccess(`Attendance updated to ${status}.`)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  const handleDelete = async (record: AttendanceRecord) => {
    const studentName =
      typeof record.studentId === "object"
        ? record.studentId?.name ?? "this student"
        : "this student"

    if (
      !window.confirm(
        `Delete the attendance record for ${studentName}?`
      )
    ) {
      return
    }

    setBusyId(record._id)
    setError("")
    setSuccess("")

    try {
      await deleteAttendance(record._id)
      setRecords((current) =>
        current.filter((item) => item._id !== record._id)
      )
      setSuccess("Attendance record deleted.")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setBusyId("")
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Attendance
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Record and monitor attendance for confirmed event registrations.
        </p>
      </header>

      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadData()}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <ClipboardCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Records</p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Present</p>
                <p className="text-2xl font-bold">{presentCount}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <UserX className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Absent</p>
                <p className="text-2xl font-bold">{absentCount}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Record Attendance
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Only confirmed registrations without an attendance record are listed.
          </p>

          <form
            onSubmit={handleMarkAttendance}
            className="mt-5 grid gap-4 md:grid-cols-[2fr_1fr_auto] md:items-end"
          >
            <div>
              <label
                htmlFor="registration"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirmed Registration
              </label>
              <select
                id="registration"
                required
                value={selectedRegistration}
                onChange={(e) => setSelectedRegistration(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="">Select a student and event</option>
                {registrationsWithoutAttendance.map((registration) => {
                  const student =
                    typeof registration.studentId === "object"
                      ? registration.studentId
                      : null
                  const event =
                    typeof registration.eventId === "object"
                      ? registration.eventId
                      : null

                  return (
                    <option
                      key={registration._id}
                      value={registration._id}
                    >
                      {student?.name ?? "Unknown student"} (
                      {student?.studentId ?? "No ID"}) —{" "}
                      {event?.title ?? "Unknown event"}
                    </option>
                  )
                })}
              </select>

              {registrationsWithoutAttendance.length === 0 && (
                <p className="mt-2 text-xs text-amber-700">
                  No confirmed registrations are waiting for attendance.
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="attendanceStatus"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Attendance Status
              </label>
              <select
                id="attendanceStatus"
                value={selectedStatus}
                onChange={(e) =>
                  setSelectedStatus(e.target.value as AttendanceStatus)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving || registrationsWithoutAttendance.length === 0}
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Attendance"}
            </button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-4 border-b border-slate-200 p-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                aria-label="Search attendance records"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student or event..."
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm"
              />
            </div>

            <select
              aria-label="Filter attendance status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            >
              <option value="All">All Attendance Statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
            </select>
          </div>

          {loading ? (
            <p className="p-10 text-center text-sm text-slate-500">
              Loading attendance records...
            </p>
          ) : filteredRecords.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarDays className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-900">
                No attendance records found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Confirm a registration and record attendance to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Event</th>
                    <th className="px-5 py-4 font-semibold">Event Date</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRecords.map((record) => {
                    const student =
                      typeof record.studentId === "object"
                        ? record.studentId
                        : null
                    const event =
                      typeof record.eventId === "object"
                        ? record.eventId
                        : null

                    return (
                      <tr key={record._id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {student?.name ?? "Unknown student"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {student?.studentId ?? "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-700">
                          {event?.title ?? "Unknown event"}
                        </td>

                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(event?.date)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              record.status === "Present"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              disabled={busyId === record._id}
                              onClick={() =>
                                void handleUpdateStatus(
                                  record,
                                  record.status === "Present"
                                    ? "Absent"
                                    : "Present"
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Mark {record.status === "Present" ? "Absent" : "Present"}
                            </button>

                            <button
                              type="button"
                              aria-label="Delete attendance record"
                              disabled={busyId === record._id}
                              onClick={() => void handleDelete(record)}
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

export default AttendancePage