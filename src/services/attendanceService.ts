
import api from "./api"

export type AttendanceStatus = "Present" | "Absent"

export interface AttendanceRecord {
  _id: string
  studentId: {
    _id: string
    name: string
    studentId: string
    email?: string
  }
  eventId: {
    _id: string
    title: string
    date: string
  }
  registrationId: {
    _id: string
    status: "Pending" | "Confirmed" | "Cancelled"
  }
  status: AttendanceStatus
  markedAt?: string
  createdAt?: string
  updatedAt?: string
}

interface ListResponse {
  success: boolean
  data: AttendanceRecord[]
}

interface ItemResponse {
  success: boolean
  message?: string
  data: AttendanceRecord
}

export const getAttendance = async (): Promise<AttendanceRecord[]> => {
  const response = await api.get<ListResponse>("/attendance")
  return response.data.data
}

export const createAttendance = async (data: {
  registrationId: string
  status: AttendanceStatus
}): Promise<AttendanceRecord> => {
  const response = await api.post<ItemResponse>("/attendance", data)
  return response.data.data
}

export const updateAttendance = async (
  id: string,
  status: AttendanceStatus
): Promise<AttendanceRecord> => {
  const response = await api.patch<ItemResponse>(`/attendance/${id}`, {
    status,
  })
  return response.data.data
}

export const deleteAttendance = async (id: string): Promise<void> => {
  await api.delete(`/attendance/${id}`)
}