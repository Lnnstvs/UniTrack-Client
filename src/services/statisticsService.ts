
import api from "./api"

export interface StatusCount {
  _id: string
  count: number
}

export interface StatisticsData {
  studentsByStatus: StatusCount[]
  eventsByStatus: StatusCount[]
  registrationsByStatus: StatusCount[]
  attendanceByStatus: StatusCount[]
}

interface StatisticsResponse {
  success: boolean
  data: StatisticsData
}

export const getStatistics = async (): Promise<StatisticsData> => {
  const response = await api.get<StatisticsResponse>("/statistics")
  return response.data.data
}