import api from './axios'
import type {
  ApiResponse, UserResponse, MenuResponse,
  PesananResponse, UpdateOrderStatusPayload,
  UpdateMenuPayload, GetDaftarAkunQuery, DashboardSummaryResponse, GrafikMingguanItem,
  GetSemuaMenuQuery,
  CreateMenuPayload, GetSemuaPesananQuery,
  LaporanBulananResponse,
  MenuTerlarisItem,
  RiwayatTransaksiItem,
  TambahAkunPayload,
  EditAkunPayload
} from './types'


export const adminApi = {

  getDaftarAkun: (query: GetDaftarAkunQuery) =>
    api.get<ApiResponse<UserResponse[]>>('/admin/akun', {
      params: {
        ...query,
      },
    }),

  getDetailAkun: (userId: string) =>
    api.get<ApiResponse<UserResponse>>(`/admin/akun/${userId}`),

  tambahAkun: (payload: TambahAkunPayload) =>
    api.post<ApiResponse<UserResponse>>('/admin/akun', payload),

  editAkun: (userId: string, payload: EditAkunPayload) =>
    api.patch<ApiResponse<UserResponse>>(`/admin/akun/${userId}`, payload),

  hapusAkun: (userId: string) =>
    api.delete<ApiResponse>(`/admin/akun/${userId}`),

  tambahMenu: (payload: CreateMenuPayload) =>
    api.post<ApiResponse<MenuResponse>>(`/admin/menu`, payload),


  getSemuaMenu: (query: GetSemuaMenuQuery) =>
    api.get<ApiResponse<MenuResponse[]>>('/admin/menu', {
      params: {
        ...(query.sellerId && { sellerId: query.sellerId }),
        ...(query.category && { category: query.category }),
      },
    }),

  getDetailMenu: (menuId: string) =>
    api.get<ApiResponse<MenuResponse>>(`/admin/menu/${menuId}`),

  editMenu: (menuId: string, payload: UpdateMenuPayload) =>
    api.patch<ApiResponse<MenuResponse>>(`/admin/menu/${menuId}`, payload),

  hapusMenu: (menuId: string) =>
    api.delete<ApiResponse>(`/admin/menu/${menuId}`),


  getSemuaPesanan: (query: GetSemuaPesananQuery) =>
    api.get<ApiResponse<PesananResponse[]>>('/admin/pesanan', {
      params: { ...query },
    }),

  updateStatusPesanan: (pesananId: string, payload: UpdateOrderStatusPayload) =>
    api.patch<ApiResponse<PesananResponse>>(`/admin/pesanan/${pesananId}/status`, payload),

  hapusPesanan: (pesananId: string) =>
    api.delete<ApiResponse>(`/admin/pesanan/${pesananId}`),


  getLaporanBulanan: (year: number, month: number) =>
    api.get<ApiResponse<LaporanBulananResponse>>('/admin/laporan/bulanan', { params: { year, month } }),

  getMenuTerlaris: (limit = 10) =>
    api.get<ApiResponse<MenuTerlarisItem>>('/admin/laporan/menu-terlaris', { params: { limit } }),

  getRiwayatTransaksiTerakhir: (limit = 20) =>
    api.get<ApiResponse<RiwayatTransaksiItem>>('/admin/laporan/transaksi-terakhir', { params: { limit } }),

  getDashboardSummary: () =>
    api.get<ApiResponse<DashboardSummaryResponse>>('/admin/dashboard/summary'),

  getGrafikPesananMingguan: () =>
    api.get<ApiResponse<GrafikMingguanItem[]>>('/admin/dashboard/grafik-mingguan'),
}