import { useState, useRef, useEffect } from 'react'
import { Menu, Search, Bell, ChevronDown, User, Settings, LogOut, CheckCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
  subtitle?: string
}

const notifications = [
  { id: '1', title: 'New order assigned', desc: 'Order #4523 → Marina Fresh', time: '2m ago', unread: true },
  { id: '2', title: 'Pickup overdue', desc: 'Driver Daniel is 15 mins late', time: '8m ago', unread: true },
  { id: '3', title: 'Vendor cancelled', desc: 'Marina Fresh declined #4518', time: '12m ago', unread: true },
  { id: '4', title: 'Payout completed', desc: 'TZS 1.2M sent to Bright & Fold', time: '1h ago', unread: false },
]

export function Topbar({ onMenuClick, title = 'Dashboard', subtitle }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 bg-[#F5F0E8]/85 backdrop-blur-lg border-b border-[#E2E8F0]">
      <div className="flex items-center gap-4 px-4 lg:px-8 h-[68px]">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 text-[#2C3E50] hover:text-[#1A5C58] hover:bg-white rounded-lg transition-colors"
        >
          <Menu size={22} />
        </button>

        {/* Title / breadcrumb */}
        <div className="hidden sm:block min-w-0">
          <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
            <span>FreshFold</span>
            <span>/</span>
            <span className="text-[#1A5C58] font-medium">{title}</span>
          </div>
          <h1 className="text-lg font-bold text-[#2C3E50] leading-tight truncate">{title}</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md ml-auto">
          <div className="relative group">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#1A5C58] transition-colors" />
            <input
              type="text"
              placeholder="Search orders, members, reports..."
              className="w-full pl-11 pr-4 py-2.5 bg-white rounded-xl border border-[#E2E8F0] text-sm text-[#2C3E50] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20 focus:border-[#1A5C58] shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Drivers online */}
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 bg-[#1A5C58]/10 rounded-full border border-[#1A5C58]/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-pulse-dot absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-sm font-semibold text-[#1A5C58]">19 Drivers Online</span>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setNotifOpen(!notifOpen); setUserOpen(false) }}
              className="relative p-2.5 text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-xl transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C0553F] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#F5F0E8]">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E2E8F0]">
                  <p className="font-semibold text-[#2C3E50]">Notifications</p>
                  <button className="flex items-center gap-1 text-xs font-medium text-[#1A5C58] hover:text-[#0F423F]">
                    <CheckCheck size={14} /> Mark all read
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 px-4 py-3 border-b border-[#F1F5F9] last:border-0 hover:bg-[#F8FAFC] transition-colors ${n.unread ? 'bg-[#1A5C58]/5' : ''}`}
                    >
                      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.unread ? 'bg-[#D4841A]' : 'bg-transparent'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[#2C3E50]">{n.title}</p>
                        <p className="text-xs text-[#64748B] mt-0.5">{n.desc}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 text-sm font-semibold text-[#1A5C58] hover:bg-[#1A5C58]/5 transition-colors">
                  View all notifications
                </button>
              </div>
            )}
          </div>

          <div className="w-px h-8 bg-[#E2E8F0] hidden sm:block"></div>

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => { setUserOpen(!userOpen); setNotifOpen(false) }}
              className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-white rounded-xl transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1A5C58] to-[#0F423F] flex items-center justify-center ring-2 ring-white shadow">
                <span className="text-white text-sm font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-[#2C3E50] leading-tight">{user?.name || 'Admin'}</p>
                <p className="text-xs text-[#64748B] capitalize">{user?.role || 'admin'}</p>
              </div>
              <ChevronDown size={16} className={`hidden sm:block text-[#94A3B8] transition-transform ${userOpen ? 'rotate-180' : ''}`} />
            </button>

            {userOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-[#E2E8F0] shadow-xl overflow-hidden z-50 py-1.5">
                <div className="px-4 py-3 border-b border-[#F1F5F9]">
                  <p className="text-sm font-semibold text-[#2C3E50]">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-[#64748B] truncate">{user?.email || 'admin@freshfold.com'}</p>
                </div>
                <button
                  onClick={() => { setUserOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C3E50] hover:bg-[#F8FAFC] transition-colors"
                >
                  <User size={17} className="text-[#64748B]" />
                  Profile
                </button>
                <button
                  onClick={() => { setUserOpen(false); navigate('/settings') }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#2C3E50] hover:bg-[#F8FAFC] transition-colors"
                >
                  <Settings size={17} className="text-[#64748B]" />
                  Settings
                </button>
                <div className="my-1 border-t border-[#F1F5F9]"></div>
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#C0553F] hover:bg-red-50 transition-colors"
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
