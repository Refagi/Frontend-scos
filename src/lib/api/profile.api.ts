import api from './axios'
import type { ApiResponse, UserResponse } from './types'

export interface UpdateProfilePayload {
  name?:        string
  email?:       string
  phone?:       string
  // seller only
  storeName?:   string
  description?: string | null
  location?:    string
  isOpen?:      boolean
  openLabel?:   string
  qrisImage?:   string
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword:     string
}

export const profileApi = {
  getProfile: () =>
    api.get<ApiResponse<UserResponse>>('/profile'),

  updateProfile: (payload: UpdateProfilePayload) =>
    api.patch<ApiResponse<UserResponse>>('/profile', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    api.patch<ApiResponse>('/profile/change-password', payload),
}