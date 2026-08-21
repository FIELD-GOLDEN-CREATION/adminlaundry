import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Truck,
  Store,
  UserCheck,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  mode: 'desktop' | 'mobile'
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/orders', label: 'Orders', icon: ShoppingCart },
  {
    label: 'Members',
    icon: Users,
    children: [
      { path: '/members/vendors', label: 'Vendors', icon: Store },
      { path: '/members/drivers', label: 'Drivers', icon: Truck },
      { path: '/members/clients', label: 'Clients', icon: UserCheck },
    ],
  },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
]

function SidebarContent({ onClose }: { onClose: () => void }) {
  const [expandedItems, setExpandedItems] = useState<string[]>(['Members'])
  const location = useLocation()
  const { user, logout } = useAuth()

  const toggleExpanded = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    )
  }

  const isActive = (path: string) => location.pathname === path
  const isChildActive = (children: { path: string }[]) =>
    children.some((child) => location.pathname === child.path)

  return (
    <aside className="sidebar" style={{ background: 'var(--bg-deep)' }}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-logo">
          <span>FF</span>
          <span className="brand-badge">●</span>
        </div>
        <div>
          <div className="brand-title">FreshFold</div>
          <div className="brand-subtitle">ADMIN</div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="close-btn-mobile"
        style={{ display: 'none' }}
      >
        ✕
      </button>

      {/* Nav */}
      <nav className="sidebar-nav">
        <div className="nav-label">MENU</div>
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleExpanded(item.label)}
                  className={cn(
                    'nav-item',
                    isChildActive(item.children) && 'active'
                  )}
                >
                  <item.icon size={16} />
                  <span>{item.label}</span>
                  {expandedItems.includes(item.label) ? (
                    <ChevronDown size={14} className="nav-arrow" />
                  ) : (
                    <ChevronRight size={14} className="nav-arrow" />
                  )}
                </button>
                {expandedItems.includes(item.label) && (
                  <div className="nav-children">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        onClick={onClose}
                        className={({ isActive: active }) =>
                          cn('nav-child-item', active && 'active')
                        }
                      >
                        <child.icon size={13} />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive: active }) =>
                  cn('nav-item', active && 'active')
                }
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Admin card */}
      <div className="sidebar-footer">
        <div className="admin-card">
          <div className="admin-avatar">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="admin-meta">
            <div className="admin-name">{user?.name || 'Admin'}</div>
            <div className="admin-email">{user?.email || 'admin@gmail.com'}</div>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </aside>
  )
}

export function Sidebar({ isOpen, onClose, mode }: SidebarProps) {
  if (mode === 'desktop') {
    return <SidebarContent onClose={onClose} />
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ width: 264 }}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}
