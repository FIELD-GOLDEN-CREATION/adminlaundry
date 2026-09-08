import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

const titleMap: Record<string, string> = {
  '/': 'Dashboard',
  '/orders': 'Orders',
  '/promos': 'Promos',
  '/packages': 'Packages',
  '/categories': 'Categories & Items',
  '/requests': 'Requests',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/members/vendors': 'Vendors',
  '/members/vendors/:id': 'Vendor Detail',
  '/members/drivers': 'Staff',
  '/members/clients': 'Clients',
  '/reports/center': 'Reports Center',
  '/reports/vendor-load': 'Vendor Load Report',
}

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const location = useLocation()
  const pathname = location.pathname
  const title = titleMap[pathname]
    || (pathname.startsWith('/orders/') ? 'Order Detail' : null)
    || (pathname.startsWith('/members/vendors/') ? 'Vendor Detail' : null)
    || (pathname.startsWith('/members/clients/') ? 'Client Detail' : null)
    || (pathname.startsWith('/members/staff/') ? 'Staff Detail' : null)
    || (pathname.startsWith('/members/staff') ? 'Staff' : null)
    || 'Dashboard'

  const handleMenuClick = () => {
    const isDesktop = window.matchMedia('(min-width: 901px)').matches
    if (isDesktop) {
      setDesktopSidebarOpen((v) => !v)
    } else {
      setMobileSidebarOpen((v) => !v)
    }
  }

  return (
    <div className="app">
      {/* Desktop sidebar — sticky, in document flow (matches original HTML) */}
      <div className={`sidebar-desktop${desktopSidebarOpen ? '' : ' closed'}`}>
        <Sidebar isOpen={desktopSidebarOpen} onClose={() => setDesktopSidebarOpen(false)} mode="desktop" />
      </div>

      {/* Mobile sidebar overlay */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} mode="mobile" />

      {/* Main column */}
      <div className="main">
        <Topbar onMenuClick={handleMenuClick} title={title} />
        <main className="content">
          {children}
        </main>
      </div>
    </div>
  )
}
