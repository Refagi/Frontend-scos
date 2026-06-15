
import api from './axios'
import type { ApiResponse, NotifikasiResponse } from './types'

export const notifikasiApi = {

  getDaftar: () =>
    api.get<ApiResponse<NotifikasiResponse[]>>('/notifications'),

  getJumlahBelumDibaca: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  tandaiDibaca: (notifId: string) =>
    api.patch<ApiResponse>(`/notifications/${notifId}/read`),

  tandaiSemuaDibaca: () =>
    api.patch<ApiResponse>('/notifications/read-all'),

  hapusSemua: () =>
    api.delete<ApiResponse>('/notifications'),
}