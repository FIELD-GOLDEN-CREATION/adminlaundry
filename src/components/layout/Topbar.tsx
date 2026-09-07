import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { adminApi } from '@/services/api'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

interface PreviewNotif {
  id: number | string
  title: string
  body?: string
  message?: string
  created_at?: string
  is_read?: boolean
  read_at?: string | null
}

export function Topbar({ onMenuClick, title = 'Dashboard' }: TopbarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<PreviewNotif[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const isStaff = user?.role === 'staff'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [list, count] = await Promise.all([
          adminApi.getNotifications({ limit: 5 }).catch(() => null),
          adminApi.getUnreadCount().catch(() => null),
        ])
        if (cancelled) return
        const items = list?.data?.data ?? []
        setPreview(Array.isArray(items) ? items.slice(0, 5) : [])
        const c = count?.data?.unread_count
        setUnreadCount(typeof c === 'number' ? c : items.filter((n: PreviewNotif) => !n.is_read && !n.read_at).length)
      } catch {
        // best effort — bell stays without badge
      }
    }
    load()
    const t = setInterval(load, 60000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [])

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
              <span className="icon-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-head">
                <span className="notif-title">Notifications {unreadCount > 0 && `(${unreadCount} unread)`}</span>
              </div>
              <div className="notif-list">
                {preview.length === 0 ? (
                  <div style={{ padding: 16, color: '#64748B', fontSize: 13 }}>No notifications yet — kept for 30 days.</div>
                ) : (
                  preview.map((n) => {
                    const unread = !n.is_read && !n.read_at
                    return (
                      <div key={n.id} className={`notif-item ${unread ? 'unread' : ''}`}>
                        <div className={`notif-dot ${unread ? 'unread' : ''}`} />
                        <div className="notif-body">
                          <div className="notif-item-title">{n.title || 'Notification'}</div>
                          <div className="notif-item-desc">{n.body || n.message || ''}</div>
                          <div className="notif-item-time">{n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                        </div>
                      </div>
                    )
                  })
                )}
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
