import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/members/vendors': 'Vendors',
  '/members/drivers': 'Drivers',
  '/members/clients': 'Clients',
  '/reports/center': 'Reports Center',
  '/reports/vendor-load': 'Vendor Load Report',
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = titleMap[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen">
      {/* Sidebar — fixed, always visible on desktop */}
      <div className="hidden lg:block fixed top-0 left-0 w-[272px] h-screen z-40">
        <Sidebar isOpen={true} onClose={() => {}} mode="desktop" />
      </div>

      {/* Mobile sidebar overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mode="mobile" />

      {/* Main content — shifted right on desktop via margin */}
      <div className="min-h-screen lg:ml-[272px] bg-[#F5F0E8] bg-[radial-gradient(1200px_600px_at_80%_-10%,rgba(26,92,88,0.06),transparent),radial-gradient(900px_500px_at_-10%_110%,rgba(212,132,26,0.05),transparent)]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-4 lg:p-8 max-w-[1600px]">
          {children}
        </main>
      </div>
    </div>
  )
}
