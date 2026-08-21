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
    <div className="app">
      {/* Desktop sidebar — sticky, in document flow (matches original HTML) */}
      <div className="sidebar-desktop">
        <Sidebar isOpen={true} onClose={() => {}} mode="desktop" />
      </div>

      {/* Mobile sidebar overlay */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} mode="mobile" />

      {/* Main column */}
      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
