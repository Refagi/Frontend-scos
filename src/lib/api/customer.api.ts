import api from './axios'
import type {
  ApiResponse, MenuResponse,
  PesananResponse, CreatePesananPayload,
  SellerResponse
} from './types'
import type { OrderStatus } from '@/types'

export const customerApi = {

  getDaftarSeller: () =>
    api.get<ApiResponse<SellerResponse[]>>('/customer/sellers'),

  getMenuSeller: (sellerId: string, category?: 'Makanan_Berat' | 'Cemilan' | 'Minuman') =>
    api.get<ApiResponse<{ seller: SellerResponse; menus: MenuResponse[] }>>(
      `/customer/sellers/${sellerId}/menu`,
      { params: { ...(category && { category }) } },
    ),

  buatPesanan: (payload: CreatePesananPayload) =>
    api.post<ApiResponse<PesananResponse>>('/customer/pesanan', payload),

  cancelPesanan: (pesananId: string) =>
    api.patch<ApiResponse<PesananResponse>>(`/customer/pesanan/${pesananId}/cancel`),

  konfirmasiPembayaran: (pesananId: string, paymentProof: string) =>
    api.patch<ApiResponse<PesananResponse>>(`/customer/pesanan/${pesananId}/konfirmasi-bayar`, { paymentProof }),

  getRiwayatPesanan: (status?: OrderStatus) =>
    api.get<ApiResponse<PesananResponse[]>>('/customer/pesanan/riwayat', {
      params: { ...(status && { status }) },
    }),

  getRingkasanPesanan: (pesananId: string) =>
    api.get<ApiResponse<PesananResponse>>(`/customer/pesanan/${pesananId}/ringkasan`),

  getDetailPesanan: (pesananId: string) =>
    api.get<ApiResponse<PesananResponse>>(`/customer/pesanan/${pesananId}`),

}