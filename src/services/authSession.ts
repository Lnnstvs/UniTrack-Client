
import type { AuthUser } from "./authService"

const TOKEN_KEY = "unitrack_token"
const USER_KEY = "unitrack_user"

export const saveSession = (
  token: string,
  user: AuthUser
): void => {
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const getSavedUser = (): AuthUser | null => {
  const savedUser = sessionStorage.getItem(USER_KEY)

  if (!savedUser) return null

  try {
    return JSON.parse(savedUser) as AuthUser
  } catch {
    sessionStorage.removeItem(USER_KEY)
    return null
  }
}

export const clearSession = (): void => {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}