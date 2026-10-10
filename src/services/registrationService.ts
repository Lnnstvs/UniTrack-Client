
import api from "./api"

export type RegistrationStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"

export interface Registration {
  _id: string
  studentId: {
    _id: string
    name: string
    studentId: string
    email: string
    status: "Active" | "Inactive"
  }
  eventId: {
    _id: string
    title: string
    date: string
    status: string
    capacity: number
  }
  status: RegistrationStatus
  registeredAt: string
}

interface ListResponse {
  success: boolean
  data: Registration[]
}

interface ItemResponse {
  success: boolean
  message?: string
  data: Registration
}

export const getRegistrations = async (): Promise<Registration[]> => {
  const response = await api.get<ListResponse>("/registrations")
  return response.data.data
}

export const createRegistration = async (data: {
  studentId: string
  eventId: string
}): Promise<Registration> => {
  const response = await api.post<ItemResponse>("/registrations", data)
  return response.data.data
}

export const confirmRegistration = async (
  id: string
): Promise<Registration> => {
  const response = await api.patch<ItemResponse>(
    `/registrations/${id}/confirm`
  )
  return response.data.data
}

export const cancelRegistration = async (
  id: string
): Promise<Registration> => {
  const response = await api.patch<ItemResponse>(
    `/registrations/${id}/cancel`
  )
  return response.data.data
}

export const deleteRegistration = async (id: string): Promise<void> => {
  await api.delete(`/registrations/${id}`)
}