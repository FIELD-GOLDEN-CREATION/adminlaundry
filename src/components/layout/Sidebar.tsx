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
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  /** 'desktop' = rendered in document flow, always visible. 'mobile' = overlay with show/hide. */
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
    <div className="flex flex-col h-full w-[272px] bg-gradient-to-b from-[#0F423F] via-[#134e4a] to-[#1A5C58] shadow-2xl shadow-teal-900/30">
      {/* Brand */}
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/20">
              <span className="text-white font-bold text-xl tracking-tight">FF</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#D4841A] ring-2 ring-[#0F423F]"></span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">FreshFold</h1>
            <p className="text-teal-200/70 text-[11px] font-medium uppercase tracking-wider">Admin Console</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-white/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-teal-200/50">
          Menu
        </p>
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.children ? (
                <>
                  <button
                    onClick={() => toggleExpanded(item.label)}
                    className={cn(
                      'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                      isChildActive(item.children)
                        ? 'bg-white/15 text-white shadow-inner'
                        : 'text-teal-100/70 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {isChildActive(item.children) && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#D4841A] rounded-r-full" />
                    )}
                    <item.icon size={20} className="shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {expandedItems.includes(item.label) ? (
                      <ChevronDown size={16} className="text-teal-200/60" />
                    ) : (
                      <ChevronRight size={16} className="text-teal-200/60" />
                    )}
                  </button>
                  {expandedItems.includes(item.label) && (
                    <div className="ml-5 mt-1 space-y-1 border-l border-white/10 pl-3">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          onClick={onClose}
                          className={({ isActive: active }) =>
                            cn(
                              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors relative',
                              active
                                ? 'bg-[#D4841A] text-white font-medium shadow'
                                : 'text-teal-100/60 hover:bg-white/10 hover:text-white'
                            )
                          }
                        >
                          <child.icon size={17} className="shrink-0" />
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
                    cn(
                      'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative',
                      active
                        ? 'bg-white/15 text-white shadow-inner'
                        : 'text-teal-100/70 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  {isActive(item.path) && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-[#D4841A] rounded-r-full" />
                  )}
                  <item.icon size={20} className="shrink-0" />
                  <span className="flex-1">{item.label}</span>
                </NavLink>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User card */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4841A] to-[#b86f12] flex items-center justify-center ring-2 ring-white/10">
              <span className="text-white text-sm font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </span>
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 ring-2 ring-[#0F423F]"></span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
            <p className="text-teal-200/60 text-xs truncate flex items-center gap-1">
              <ShieldCheck size={11} /> {user?.role || 'admin'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white bg-white/10 hover:bg-red-500/80 transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ isOpen, onClose, mode }: SidebarProps) {
  if (mode === 'desktop') {
    return <SidebarContent onClose={onClose} />
  }

  // Mobile overlay mode
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[272px] lg:hidden',
          'transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onClose={onClose} />
      </aside>
    </>
  )
}
