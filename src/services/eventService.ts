
import api from "./api"

export type EventStatus =
  | "Upcoming"
  | "Ongoing"
  | "Completed"
  | "Cancelled"

export interface EventItem {
  _id: string
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  venueId: {
    _id: string
    name: string
    location: string
    capacity?: number
  }
  categoryId: {
    _id: string
    name: string
    description?: string
  }
  capacity: number
  status: EventStatus
  registeredCount: number
  availableSlots: number
  createdAt?: string
  updatedAt?: string
}

interface EventListResponse {
  success: boolean
  data: EventItem[]
}

interface EventResponse {
  success: boolean
  message?: string
  data: EventItem
}

export interface EventFilters {
  search?: string
  status?: string
  categoryId?: string
  venueId?: string
  sort?: string
}

export const getEvents = async (
  filters: EventFilters = {}
): Promise<EventItem[]> => {
  const response = await api.get<EventListResponse>("/events", {
    params: filters,
  })

  return response.data.data
}

export const getEventById = async (
  id: string
): Promise<EventItem> => {
  const response = await api.get<EventResponse>(`/events/${id}`)
  return response.data.data
}

export interface EventInput {
  title: string
  description: string
  date: string
  startTime: string
  endTime: string
  venueId: string
  categoryId: string
  capacity: number
}

export const createEvent = async (
  event: EventInput
): Promise<EventItem> => {
  const response = await api.post<EventResponse>("/events", event)
  return response.data.data
}

export const updateEvent = async (
  id: string,
  event: EventInput
): Promise<EventItem> => {
  const response = await api.patch<EventResponse>(
    `/events/${id}`,
    event
  )

  return response.data.data
}

export const updateEventStatus = async (
  id: string,
  status: EventStatus
): Promise<EventItem> => {
  const response = await api.patch<EventResponse>(
    `/events/${id}/status`,
    { status }
  )

  return response.data.data
}

export const deleteEvent = async (id: string): Promise<void> => {
  await api.delete(`/events/${id}`)
}