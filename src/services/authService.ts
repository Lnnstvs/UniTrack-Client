
import api from "./api"

export interface AuthUser {
  id: string
  name: string
  email: string
  status: "Active" | "Inactive"
}

interface AuthResponse {
  success: boolean
  message?: string
  token?: string
  user: AuthUser
}

export const registerUser = async (data: {
  name: string
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data
  )
  return response.data
}

export const loginUser = async (data: {
  email: string
  password: string
}): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  )
  return response.data
}

export const getCurrentUser = async (): Promise<AuthUser> => {
  const response = await api.get<{
    success: boolean
    user: AuthUser
  }>("/auth/me")

  return response.data.user
}