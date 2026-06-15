export type UserRole = 'admin' | 'seller' | 'customer';

export interface LoginForm {
  email: string
  password: string
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status?: 'active' | 'non-active';
}

export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  label?: string
  logo?: string;
  location: string;
  isOpen: boolean;
  image?: string;
}

export interface MenuItem {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  price: number;
  category: 'Makanan Berat' | 'Cemilan' | 'Minuman';
  image?: string;
  isAvailable: boolean;
}

export type OrderStatus = 'menunggu' | 'ditolak' | 'diterima' | 'dimasak' | 'siap' | 'selesai';

export interface OrderItem {
  menuId: string;
  menuName: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  slot?: string;
  pickupTime?: string;
  createdAt: Date;
  updatedAt: Date;
}



export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
}

export interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  todayOrders: number;
  todayRevenue: number;
  weeklyOrders: { day: string; orders: number }[];
  orderStatusSummary: { status: OrderStatus; count: number }[];
  topMenus: { name: string; orders: number; revenue: number }[];
}

export type PaginationInfo = {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
};
export type RoleStats = Record<UserRole, number>;
