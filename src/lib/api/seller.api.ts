

import api, { apiUpload } from './axios'
import type {
  ApiResponse, MenuResponse, PesananResponse,
  CreateMenuPayload, UpdateMenuPayload,
  UpdateOrderStatusPayload, LaporanQuery, SellerDashboardSummary, GrafikMingguanItem, MenuTerlarisItem,
  UploadResponse, UserResponse, UpdateSellerTenantPayload, LaporanResponse
} from './types';
import type { OrderStatus } from '@/types'

export const sellerApi = {

 updateSellerTenant: (payload: UpdateSellerTenantPayload) =>
  api.patch<ApiResponse<UserResponse>>('/seller/tenant', payload),

  getSemuaMenu: (category?: 'Makanan Berat' | 'Cemilan' | 'Minuman') =>
    api.get<ApiResponse<MenuResponse[]>>('/seller/menu', {
      params: { ...(category && { category }) },
    }),

  getDetailMenu: (menuId: string) =>
    api.get<ApiResponse<MenuResponse>>(`/seller/menu/${menuId}`),

  addMenu: (payload: CreateMenuPayload) =>
    api.post<ApiResponse<MenuResponse>>('/seller/menu', payload),

  updateMenu: (menuId: string, payload: UpdateMenuPayload) =>
    api.patch<ApiResponse<MenuResponse>>(`/seller/menu/${menuId}`, payload),

  deleteMenu: (menuId: string) =>
    api.delete<ApiResponse>(`/seller/menu/${menuId}`),

  toggleKetersediaan: (menuId: string) =>
    api.patch<ApiResponse<MenuResponse>>(`/seller/menu/${menuId}/toggle`),

  uploadGambarMenu: (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return apiUpload.post<ApiResponse<UploadResponse>>('/seller/menu/upload-image', form)
  },

  uploadQris: (file: File) => {
    const form = new FormData()
    form.append('qris', file)
    return apiUpload.post<ApiResponse<UploadResponse>>('/seller/profile/upload-qris', form)
  },

  getSemuaPesanan: (status?: OrderStatus) =>
    api.get<ApiResponse<PesananResponse[]>>('/seller/pesanan', {
      params: { ...(status && { status }) },
    }),

  getPesananMasuk: (status?: OrderStatus) =>
    api.get<ApiResponse<PesananResponse[]>>('/seller/pesanan', {
      params: { ...(status && { status }) },
    }),

  getDetailPesanan: (pesananId: string) =>
    api.get<ApiResponse<PesananResponse>>(`/seller/pesanan/${pesananId}`),

  updateStatusPesanan: (pesananId: string, payload: UpdateOrderStatusPayload) =>
    api.patch<ApiResponse<PesananResponse>>(`/seller/pesanan/${pesananId}/status`, payload),

  getLaporanPesanan: (query?: LaporanQuery) =>
    api.get<ApiResponse<LaporanResponse>>('/seller/laporan', { params: query }),

  getDashboardSummary: () =>
    api.get<ApiResponse<SellerDashboardSummary>>('/seller/dashboard/summary'),

  getGrafikMingguan: () =>
    api.get<ApiResponse<GrafikMingguanItem[]>>('/seller/dashboard/grafik-mingguan'),

  getMenuTerlaris: () =>
    api.get<ApiResponse<MenuTerlarisItem[]>>('/seller/dashboard/menu-terlaris'),
}