import type { OrderStatus, UserRole } from '@/types/index.js'


type NotifType = 'info' | 'success' | 'warning' | 'error';


export interface TambahAkunPayload {
  name:         string
  email:        string
  password:     string
  role:         UserRole
  status?:      'active' | 'non-active'
  phone?:       string

  storeName?:   string
  description?: string
  location?:    string
  isOpen?:      boolean
  openLabel?:   string
  logo?:        string
  image?:       string
  qrisImage?:   string
}

export type EditAkunPayload = Partial<TambahAkunPayload>

export type GetDaftarAkunQuery = {
  role?: 'admin' | 'seller' | 'customer';
  status?: 'active' | 'non-active';
  page?: number;
  limit?: number;
};



export interface ApiResponse<T = unknown> {
  status:  number
  data?:   T
  message?: string
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  message: string;
}


export interface LoginPayload {
  email:    string
  password: string
}

export interface RegisterPayload {
  name:     string
  email:    string
  password: string
  phone?:   string | null
  role?:    UserRole
}

export interface AuthResponse {
  user:        UserResponse
  accessToken: string 
}


export interface UserResponse {
  id:          string
  name:        string
  email:       string
  role:        UserRole
  status:      'active' | 'non-active'
  phone?:      string | null
  avatar?:     string | null

  storeName?:  string | null
  description?: string | null
  location?:   string | null
  isOpen?:     boolean
  openLabel?:  string | null
  logo?:       string | null
  image?:      string | null
  qrisImage?:  string | null
  createdAt:   string
  updatedAt:   string
}

export interface UpdateProfilePayload {
  name?:        string
  phone?:       string | null
  avatar?:      string | null

  storeName?:   string 
  description?: string | null
  location?:    string | null
  isOpen?:      boolean
  openLabel?:   string | null
  logo?:        string | null
  image?:       string | null
  qrisImage?:   string | null
}

export interface MenuSellerInfo {
  id:        string
  name:      string
  storeName: string | null
}


export interface MenuResponse {
  id:          string
  sellerId:    string
  name:        string
  description: string | null
  price:       number
  category:    'Makanan_Berat' | 'Cemilan' | 'Minuman'
  image:       string | null
  isAvailable: boolean
  stock:       number | null
  createdAt:   string
  updatedAt:   string
  seller?:     MenuSellerInfo
}

export interface GetSemuaMenuQuery {
  sellerId?: string
  category?: 'Makanan_Berat' | 'Cemilan' | 'Minuman'
}

export interface CreateMenuPayload {
  name:         string
  description?: string | null
  price:        number
  category:    'Makanan_Berat' | 'Cemilan' | 'Minuman'
  image?:       string | null
  isAvailable?: boolean
  stock?:       number | null
  sellerId?: string
}

export type UpdateMenuPayload = Partial<CreateMenuPayload>


export interface CheckoutItem {
  menu:     MenuResponse
  quantity: number
  notes?:   string | null
}

export interface CreatePesananItem {
  menuId:   string
  quantity: number
  notes?:   string
}

export type GetSemuaPesananQuery = {
  status?: OrderStatus;
  page?: number;
  limit?: number;
};

export interface CreatePesananPayload {
  sellerId:         string
  items:            CreatePesananItem[]
  slot?:            string | null
  notes?:           string | null
}

export interface DetailPesananResponse {
  id:        string
  menuId:    string
  menuName:  string
  menuPrice: number
  quantity:  number
  subtotal:  number
  notes:     string
  menu?:     MenuResponse
}

export interface PesananResponse {
  id:               string
  orderNumber:      string
  customerId:       string
  sellerId:         string
  totalPrice:       number
  status:           OrderStatus
  isPaid: boolean
  paidAt?: string
  slot:             string
  notes:            string
  createdAt:        string
  updatedAt:        string
  customer?:        Pick<UserResponse, 'id' | 'name' | 'phone' | 'avatar'>
  seller?:          Pick<UserResponse, 'id' | 'name' | 'storeName' | 'location' | 'image' | 'qrisImage'>
  details:          DetailPesananResponse[]
}

export interface LocationState {
  seller: SellerResponse | null
  items:  CheckoutItem[]
}

export interface UpdateOrderStatusPayload {
  status:              OrderStatus
  alasanPenolakan?:   string
}

export interface LaporanResponse {
  pesananList: PesananResponse[];
  ringkasan: {
    totalPesanan:       number;
    totalPendapatan:    number;
    ringkasanPerStatus: { status: string; jumlah: number }[];
  };
  menuTerlaris: {
    menuId:       string;
    menuName:     string;
    totalTerjual: number;
    totalRevenue: number;
  }[];
}


export interface LaporanQuery {
  from?:   string  
  to?:     string
  status?: OrderStatus
}

export interface LaporanBulananResponse {
  periode: {
    year:  number
    month: number
    from:  string
    to:    string
  }
  summary: {
    totalPendapatan: number
    totalPesanan:    number
    totalItem:       number
  }
  perSeller: {
    sellerId:      string
    storeName:     string
    total:         number
    jumlahPesanan: number
  }[]
}
 
export interface MenuTerlarisItem {
  rank:         number
  menuId:       string
  menuName:     string
  totalTerjual: number
  totalPesanan: number
}
 
export interface RiwayatTransaksiItem {
  id:          string
  orderNumber: string
  totalPrice:  number
  status:      string
  createdAt:   string
  customer: {
    id:     string
    name:   string
    avatar: string | null
  } | null
  seller: {
    id:        string
    storeName: string | null
  } | null
  details: {
    menuName: string
    quantity: number
    subtotal: number
  }[]
}


export interface NotifikasiResponse {
  id:        string
  userId:    string
  role:      UserRole
  title:     string
  message:   string
  type:      NotifType
  isRead:    boolean
  pesananId: string | null
  menuId:    string | null
  createdAt: string
}


export interface UploadResponse {
  url:      string
  filename: string
}


export interface DashboardSummaryResponse {
  totalPengguna:     number
  totalPenjual:      number
  pesananHariIni:    number
  pendapatanHariIni: number
  ringkasanStatus: {
    menunggu:  number
    diterima:  number
    ditolak:   number
    dimasak:   number
    siap:      number
    selesai:   number
  }
}

export interface GrafikMingguanItem {
  tanggal:        string 
  hari:           string
  hariPendek:     string
  jumlahPesanan:  number
}


export interface SellerDashboardSummary {
  pesananHariIni:    number
  pendapatanHariIni: number
  totalMenu:         number
  menuTersedia:      number
}


export interface UpdateSellerTenantPayload {
  storeName?:   string
  description?: string | null
  location?:    string | null
  isOpen?:      boolean
  openLabel?:   string | null
  logo?:        string | null
  image?:       string | null
  qrisImage?:   string | null
}

export interface SellerResponse {
  id:          string
  name:        string
  storeName:   string | null
  description: string | null
  location:    string | null
  isOpen:      boolean | null
  openLabel:   string | null
  logo:        string | null
  image:       string | null
  qrisImage:   string | null
}