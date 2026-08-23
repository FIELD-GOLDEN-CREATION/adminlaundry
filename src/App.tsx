import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import OrdersPage from '@/pages/OrdersPage'
import OrderDetailPage from '@/pages/OrderDetailPage'
import SettingsPage from '@/pages/SettingsPage'
import ReportsPage from '@/pages/ReportsPage'
import ReportsCenterPage from '@/pages/ReportsCenterPage'
import VendorLoadReportPage from '@/pages/VendorLoadReportPage'
import OrdersReportPage from '@/pages/OrdersReportPage'
import RevenueReportPage from '@/pages/RevenueReportPage'
import SubscriptionsReportPage from '@/pages/SubscriptionsReportPage'
import VendorPerformanceReportPage from '@/pages/VendorPerformanceReportPage'
import CustomerReportPage from '@/pages/CustomerReportPage'
import MembersPage from '@/pages/MembersPage'
import VendorDetailPage from '@/pages/VendorDetailPage'
import CustomerDetailPage from '@/pages/CustomerDetailPage'
import StaffDetailPage from '@/pages/StaffDetailPage'
import PromosPage from '@/pages/PromosPage'
import PackagesPage from '@/pages/PackagesPage'
import CategoriesItemsPage from '@/pages/CategoriesItemsPage'
import RequestsPage from '@/pages/RequestsPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SubscriptionsPage from '@/pages/SubscriptionsPage'
import StaffSettingsPage from '@/pages/StaffSettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { VendorApplicationProvider } from '@/contexts/VendorApplicationContext'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#1A5C58] flex items-center justify-center">
            <span className="text-white font-bold text-xl">FF</span>
          </div>
          <div className="w-8 h-8 border-3 border-[#1A5C58] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <AppShell>{children}</AppShell>
}

const staffRestrictedPaths = ['/reports', '/subscriptions', '/settings']
const staffRestrictedMemberPaths = ['/members/staff']

function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const location = window.location.pathname

  if (user?.role === 'staff') {
    if (staffRestrictedPaths.some((p) => location === p || location.startsWith(p + '/'))) {
      return <Navigate to="/" replace />
    }
    if (location === '/members' || staffRestrictedMemberPaths.some((p) => location.startsWith(p))) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}

export default function App() {
  return (
    <VendorApplicationProvider>
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/vendors/:id"
        element={
          <ProtectedRoute>
            <StaffRoute><VendorDetailPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/clients/:id"
        element={
          <ProtectedRoute>
            <StaffRoute><CustomerDetailPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/staff/:id"
        element={
          <ProtectedRoute>
            <StaffRoute><StaffDetailPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:role?"
        element={
          <ProtectedRoute>
            <StaffRoute><MembersPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <StaffRoute><ReportsPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/center"
        element={
          <ProtectedRoute>
            <StaffRoute><ReportsCenterPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/vendor-load"
        element={
          <ProtectedRoute>
            <StaffRoute><VendorLoadReportPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/orders"
        element={
          <ProtectedRoute>
            <StaffRoute><OrdersReportPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/revenue"
        element={
          <ProtectedRoute>
            <StaffRoute><RevenueReportPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/subscriptions"
        element={
          <ProtectedRoute>
            <StaffRoute><SubscriptionsReportPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/vendor-performance"
        element={
          <ProtectedRoute>
            <StaffRoute><VendorPerformanceReportPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports/customers"
        element={
          <ProtectedRoute>
            <StaffRoute><CustomerReportPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <StaffRoute><SettingsPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/promos"
        element={
          <ProtectedRoute>
            <PromosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/packages"
        element={
          <ProtectedRoute>
            <PackagesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <ProtectedRoute>
            <CategoriesItemsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <RequestsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff-settings"
        element={
          <ProtectedRoute>
            <StaffSettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute>
            <StaffRoute><SubscriptionsPage /></StaffRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </VendorApplicationProvider>
  )
}
