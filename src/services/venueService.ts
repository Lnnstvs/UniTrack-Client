import api from "./api"

export interface Venue {
  _id: string
  name: string
  location: string
  capacity: number
  status: "Available" | "Occupied"
  createdAt?: string
  updatedAt?: string
}

interface VenueResponse {
  success: boolean
  data: Venue[]
}

interface SingleVenueResponse {
  success: boolean
  message: string
  data: Venue
}



export const updateVenue = async (
  id: string,
  venue: {
    name: string
    location: string
    capacity: number
    status: "Available" | "Occupied"
  }
): Promise<Venue> => {
  const response = await api.patch<{ success: boolean; data: Venue }>(
    `/venues/${id}`,
    venue
  )

  return response.data.data
}



export const getVenues = async (): Promise<Venue[]> => {
  const response = await api.get<VenueResponse>("/venues")

  return response.data.data
}

export const createVenue = async (
  venue: {
    name: string
    location: string
    capacity: number
  }
): Promise<Venue> => {
  const response = await api.post<SingleVenueResponse>(
    "/venues",
    venue
  )

  return response.data.data
}

export const updateVenueStatus = async (
  id: string,
  status: "Available" | "Occupied"
): Promise<Venue> => {
  const response = await api.patch<SingleVenueResponse>(
    `/venues/${id}/status`,
    { status }
  )

  return response.data.data
}

export const deleteVenue = async (
  id: string
): Promise<void> => {
  await api.delete(`/venues/${id}`)
}