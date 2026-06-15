import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { DashboardLayout } from '@/layouts/DashboardLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminAkun } from '@/pages/admin/AdminAkun'
import { AdminLaporan } from '@/pages/admin/AdminLaporan'
import { AdminMenu } from '@/pages/admin/AdminMenu'
import { AdminPesanan } from '@/pages/admin/AdminPesanan'
import { SellerDashboard } from '@/pages/seller/SellerDashboard'
import { SellerMenu } from '@/pages/seller/SellerMenu'
import { SellerPesanan } from '@/pages/seller/SellerPesanan'
import { SellerLaporan } from '@/pages/seller/SellerLaporan'
import { CustomerDashboard } from '@/pages/customer/CustomerDashboard'
import { CustomerPenjual } from '@/pages/customer/CustomerPenjual'
import { CustomerRiwayat } from '@/pages/customer/CustomerRiwayat'
import ProtectedRoute from '@/components/layout/ProtectedRoute'
import { Profile } from '@/pages/profiles/Profile'
import { AdminEditAkun } from '@/pages/admin/AdminEditAkun'
import { AdminEditMenu } from './pages/admin/AdminEditMenu'
import { AdminTambahAkun } from './pages/admin/AdminTambahAkun'
import { AdminTambahMenu } from './pages/admin/AdminTambahMenu'
import { SellerEditTenant } from './pages/seller/SellerEditTenant'
import { SellerEditMenu } from './pages/seller/SellerEditMenu'
import { SellerTambahMenu } from './pages/seller/SellerTambahMenu'
import { CustomerMenu } from './pages/customer/CustomerMenu';
import { CustomerCheckout } from './pages/customer/CustomerCheckout'
import { CustomerOrderSuccess } from './pages/customer/CustomerOrderSucces'
import { CustomerRingkasan } from './pages/customer/CustomerRingkasan'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="profil" element={<Profile />} />

          <Route path="akun" element={<AdminAkun />} />
          <Route path="akun/add" element={<AdminTambahAkun />} />
          <Route path="akun/edit/:userId" element={<AdminEditAkun />} />
          <Route path="menu/add" element={<AdminTambahMenu />} />

          <Route path="menu" element={<AdminMenu />} />
          <Route path="menu/edit/:menuId" element={<AdminEditMenu />} />


          <Route path="laporan" element={<AdminLaporan />} />
          <Route path="pesanan" element={<AdminPesanan />} />
        </Route>

        <Route
          path="/seller"
          element={
            <ProtectedRoute allowedRoles={['seller']}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
          <Route path="profil" element={<Profile />} />
          <Route path="tenant" element={<SellerEditTenant />} />
          <Route index element={<SellerDashboard />} />

          <Route path="pesanan" element={<SellerPesanan />} />
          
          <Route path="menu" element={<SellerMenu />} />
          <Route path="menu/add" element={<SellerTambahMenu />} />
          <Route path="menu/edit/:menuId" element={<SellerEditMenu />} />

          <Route path="laporan" element={<SellerLaporan />} />
        </Route>

        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="profil" element={<Profile />} />
          <Route path="ringkasan/pesanan"    element={<CustomerRingkasan />} />
          <Route path="sellers/:sellerId/menu" element={<CustomerMenu />} />
          <Route path="checkout/:sellerId" element={<CustomerCheckout />} />
          <Route path="order/success/:pesananId" element={<CustomerOrderSuccess />} />
          <Route path="penjual" element={<CustomerPenjual />} />
          <Route path="riwayat/pesanan" element={<CustomerRiwayat />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </BrowserRouter>
  )
}