
import { RefreshCw } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import {
  getStatistics,
  type StatisticsData,
  type StatusCount,
} from "../services/statisticsService"

const emptyStatistics: StatisticsData = {
  studentsByStatus: [],
  eventsByStatus: [],
  registrationsByStatus: [],
  attendanceByStatus: [],
}

function StatisticsPage() {
  const [statistics, setStatistics] =
    useState<StatisticsData>(emptyStatistics)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadStatistics = useCallback(async () => {
    setLoading(true)
    setError("")

    try {
      const data = await getStatistics()
      setStatistics(data)
    } catch {
      setError("Unable to load statistics. Please check the backend.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadStatistics()
  }, [loadStatistics])

  const sections: {
    title: string
    data: StatusCount[]
  }[] = [
    { title: "Students by Status", data: statistics.studentsByStatus },
    { title: "Events by Status", data: statistics.eventsByStatus },
    {
      title: "Registrations by Status",
      data: statistics.registrationsByStatus,
    },
    {
      title: "Attendance by Status",
      data: statistics.attendanceByStatus,
    },
  ]

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Statistics
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Review student, event, registration, and attendance summaries.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadStatistics()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      <div className="space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
            Loading statistics...
          </div>
        ) : (
          <section className="grid gap-6 lg:grid-cols-2">
            {sections.map((section) => {
              const total = section.data.reduce(
                (sum, item) => sum + item.count,
                0
              )

              return (
                <article
                  key={section.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-semibold text-slate-900">
                      {section.title}
                    </h2>
                    <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                      {total} total
                    </span>
                  </div>

                  {section.data.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-500">
                      No data available yet.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-5">
                      {section.data.map((item) => {
                        const percentage =
                          total > 0 ? (item.count / total) * 100 : 0

                        return (
                          <div key={item._id}>
                            <div className="mb-2 flex justify-between gap-3 text-sm">
                              <span className="font-medium text-slate-700">
                                {item._id}
                              </span>
                              <span className="text-slate-500">
                                {item.count} ({percentage.toFixed(1)}%)
                              </span>
                            </div>

                            <div
                              className="h-3 overflow-hidden rounded-full bg-slate-100"
                              role="progressbar"
                              aria-label={`${item._id} ${section.title}`}
                              aria-valuenow={percentage}
                              aria-valuemin={0}
                              aria-valuemax={100}
                            >
                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}

export default StatisticsPage