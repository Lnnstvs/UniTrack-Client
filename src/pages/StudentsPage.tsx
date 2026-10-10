import {
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"

import {
  createStudent,
  deleteStudent,
  getStudents,
  updateStudentStatus,
  type Student,
} from "../services/studentService"

type StudentStatus = "Active" | "Inactive"

function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    studentNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    course: "",
    yearLevel: "",
    status: "Active" as StudentStatus,
  })

  // =========================
  // LOAD STUDENTS
  // =========================

  const loadStudents = async () => {
    try {
      setLoading(true)
      setError("")

      const data = await getStudents({
        search: search.trim() || undefined,
        status:
          statusFilter === "All"
            ? undefined
            : (statusFilter as StudentStatus),
      })

      setStudents(data)
    } catch (error) {
      console.error("Error loading students:", error)

      setError(
        "Failed to load students. Please make sure the backend server is running."
      )
    } finally {
      setLoading(false)
    }
  }

  // Load students whenever search or status changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStudents()
    }, 300)

    return () => clearTimeout(timeout)
  }, [search, statusFilter])

  // =========================
  // ADD STUDENT
  // =========================

  const handleAddStudent = async () => {
    if (
      !form.studentNumber.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.course.trim() ||
      !form.yearLevel.trim()
    ) {
      alert("Please complete all fields.")
      return
    }

    const yearLevel = Number(form.yearLevel)

    if (
      !Number.isInteger(yearLevel) ||
      yearLevel < 1 ||
      yearLevel > 6
    ) {
      alert("Year level must be a number from 1 to 6.")
      return
    }

    try {
      setSaving(true)

      await createStudent({
        studentId: form.studentNumber.trim(),
        name: `${form.firstName.trim()} ${form.lastName.trim()}`,
        email: form.email.trim(),
        course: form.course.trim(),
        yearLevel,
        status: form.status,
      })

      setForm({
        studentNumber: "",
        firstName: "",
        lastName: "",
        email: "",
        course: "",
        yearLevel: "",
        status: "Active",
      })

      setShowModal(false)

      await loadStudents()
    } catch (error: any) {
      console.error("Error creating student:", error)

      const message =
        error?.response?.data?.message ||
        "Failed to create student."

      alert(message)
    } finally {
      setSaving(false)
    }
  }

  // =========================
  // DELETE STUDENT
  // =========================

  const handleDeleteStudent = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this student record?"
    )

    if (!confirmed) {
      return
    }

    try {
      setError("")

      await deleteStudent(id)

      await loadStudents()
    } catch (error: any) {
      console.error("Error deleting student:", error)

      const message =
        error?.response?.data?.message ||
        "Failed to delete student."

      alert(message)
    }
  }

  // =========================
  // CHANGE STATUS
  // =========================

  const handleStatusChange = async (
    id: string,
    status: StudentStatus
  ) => {
    try {
      setError("")

      await updateStudentStatus(id, status)

      await loadStudents()
    } catch (error: any) {
      console.error("Error updating student status:", error)

      const message =
        error?.response?.data?.message ||
        "Failed to update student status."

      alert(message)
    }
  }

  // =========================
  // RENDER
  // =========================

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Students
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage student records and account status.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />

            Add Student
          </button>
        </div>
      </header>

      {/* MAIN */}

      <main className="px-4 py-8 sm:px-6 lg:px-8">
        {/* SEARCH AND FILTER */}

        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm"
            >
              <option value="All">
                All Statuses
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>
        </section>

        {/* ERROR */}

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* STUDENTS TABLE */}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Student
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Email
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Course
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Year
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50"
                    >
                      {/* STUDENT */}

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {student.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {student.studentId}
                        </p>
                      </td>

                      {/* EMAIL */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.email}
                      </td>

                      {/* COURSE */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.course}
                      </td>

                      {/* YEAR */}

                      <td className="px-6 py-4 text-sm text-slate-600">
                        {student.yearLevel}
                      </td>

                      {/* STATUS */}

                      <td className="px-6 py-4">
                        <select
                          value={student.status}
                          onChange={(e) =>
                            handleStatusChange(
                              student._id,
                              e.target.value as StudentStatus
                            )
                          }
                          className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                            student.status === "Active"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }`}
                        >
                          <option value="Active">
                            Active
                          </option>

                          <option value="Inactive">
                            Inactive
                          </option>
                        </select>
                      </td>

                      {/* DELETE */}

                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteStudent(
                                student._id
                              )
                            }
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* EMPTY STATE */}

          {!loading && students.length === 0 && (
            <div className="p-12 text-center">
              <UserRound className="mx-auto h-10 w-10 text-slate-400" />

              <h2 className="mt-4 font-semibold text-slate-900">
                No students found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* ADD STUDENT MODAL */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Add Student
              </h2>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* FORM */}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* STUDENT NUMBER */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Student Number
                </label>

                <input
                  placeholder="e.g. 2026-0001"
                  value={form.studentNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      studentNumber: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* FIRST NAME */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  First Name
                </label>

                <input
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* LAST NAME */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Last Name
                </label>

                <input
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      lastName: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="student@unitrack.edu"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* COURSE */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Course
                </label>

                <input
                  placeholder="e.g. BS Information Technology"
                  value={form.course}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      course: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* YEAR */}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Year Level
                </label>

                <input
                  type="number"
                  min="1"
                  max="6"
                  placeholder="e.g. 4"
                  value={form.yearLevel}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      yearLevel: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* STATUS */}

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status:
                        e.target.value as StudentStatus,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddStudent}
                disabled={saving}
                className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Adding..." : "Add Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentsPage