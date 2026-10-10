
import api from "./api"

export interface DashboardStats {
  students: number
  activeStudents: number
  events: number
  upcomingEvents: number
  registrations: number
  confirmedRegistrations: number
  attendance: number
  availableVenues: number
  categories: number
}

interface DashboardResponse {
  success: boolean
  data: DashboardStats
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<DashboardResponse>("/dashboard/stats")
  return response.data.data
}