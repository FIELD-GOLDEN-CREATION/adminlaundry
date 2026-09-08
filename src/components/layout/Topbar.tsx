import { useState, useRef, useEffect } from 'react'
import { Menu, Bell, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRealtime, type NotificationEventPayload } from '@/contexts/RealtimeContext'
import { adminApi } from '@/services/api'
import { timeAgo } from '@/lib/utils'
import { useNavigate, Link } from 'react-router-dom'

interface TopbarProps {
  onMenuClick: () => void
  title?: string
}

interface TopbarNotification {
  id: string | number
  title: string
  desc: string
  time: string
  unread: boolean
}

function mapNotification(n: any): TopbarNotification {
  return {
    id: n.id,
    title: n.title || 'Notification',
    desc: n.body || n.message || n.description || '',
    time: n.created_at ? timeAgo(n.created_at) : '',
    unread: !n.is_read && !n.read_at,
  }
}

export function Topbar({ onMenuClick, title = 'Dashboard' }: TopbarProps) {
  const { user, logout } = useAuth()
  const { onNotification } = useRealtime()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<TopbarNotification[]>([])
  const notifRef = useRef<HTMLDivElement>(null)

  const isStaff = user?.role === 'staff'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    adminApi
      .getNotifications()
      .then((res) => {
        const data = res.data?.data || []
        setNotifications(data.slice(0, 5).map(mapNotification))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    return onNotification((payload: NotificationEventPayload) => {
      setNotifications((prev) => [mapNotification(payload), ...prev].slice(0, 5))
    })
  }, [onNotification])

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="icon-btn"
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
                {notifications.length === 0 && (
                  <div style={{ padding: '20px 16px', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
                    No notifications yet
                  </div>
                )}
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
