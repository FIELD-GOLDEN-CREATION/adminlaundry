import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

const notifications = [
  { id: '1', title: 'New order assigned', desc: 'Order #4523 → Marina Fresh', time: '2m ago', unread: true },
  { id: '2', title: 'Pickup overdue', desc: 'Driver Daniel is 15 mins late', time: '8m ago', unread: true },
  { id: '3', title: 'Vendor cancelled', desc: 'Marina Fresh declined #4518', time: '12m ago', unread: true },
  { id: '4', title: 'Payout completed', desc: 'TZS 1.2M sent to Bright & Fold', time: '1h ago', unread: false },
]

export function Topbar({ onMenuClick, title = 'Dashboard' }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  const isStaff = user?.role === 'staff'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="icon-btn lg:hidden"
          style={{ width: 38, height: 38 }}
        >
          <Menu size={18} />
        </button>

        {/* Breadcrumb (matches original) */}
        <ol className="breadcrumb">
          <li><a href="/">FreshFold</a></li>
          <li className="sep">/</li>
          <li className="current" aria-current="page">{title}</li>
        </ol>
      </div>

      <div className="topbar-right">
        {/* Live pill */}
        <span className="live-pill">
          <span className="dot"></span>
          19 Drivers Online
        </span>

        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            className="icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="icon-badge">{unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <span className="notif-title">Notifications</span>
              </div>
              <div className="notif-list">
                {notifications.map((n) => (
                  <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                    <div className={`notif-dot ${n.unread ? 'unread' : ''}`} />
                    <div className="notif-body">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-desc">{n.desc}</div>
                      <div className="notif-item-time">{n.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notif-footer">
                <Link to="/notifications" onClick={() => setNotifOpen(false)}>View all notifications</Link>
              </div>
            </div>
          )}
        </div>

        {/* Avatar chip */}
        <div
          className="avatar-chip"
          title={user?.name || 'Admin'}
          onClick={() => navigate(isStaff ? '/staff-settings' : '/settings')}
          style={{ cursor: 'pointer' }}
        >
          {user?.name?.charAt(0) || 'A'}
        </div>
      </div>
    </header>
  )
}
