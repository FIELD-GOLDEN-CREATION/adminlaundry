import { useState, useEffect } from 'react'
import { Bell, CheckCheck, Trash2, Eye, EyeOff } from 'lucide-react'
import { adminApi } from '@/services/api'

const typeColors: Record<string, { bg: string; fg: string }> = {
  order: { bg: '#E3EEFF', fg: '#1F5ECC' },
  vendor: { bg: '#FDE8D4', fg: '#CF6A2C' },
  system: { bg: '#F1F5F9', fg: '#64748B' },
  payment: { bg: '#DFF5ED', fg: '#1A7A5C' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getNotifications()
        setNotifications(res.data.data || [])
      } catch (err) {
        console.error('Failed to load notifications:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = notifications.filter((n) => {
    const type = n.type || 'system'
    if (selectedType !== 'all' && type !== selectedType) return false
    if (search && !(n.title || '').toLowerCase().includes(search.toLowerCase()) && !(n.message || n.description || '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read_at && !n.is_read).length

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read_at: n.read_at ? null : new Date().toISOString() } : n))
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read_at: new Date().toISOString() })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const unreadByType = (type: string) => notifications.filter((n) => (n.type || 'system') === type && !n.read_at && !n.is_read).length

  const typeIcons: Record<string, string> = {
    order: '📦',
    vendor: '🏪',
    system: '⚙️',
    payment: '💰',
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Notifications</li>
        </ol>
        <button
          onClick={markAllRead}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <CheckCheck size={14} /> Mark all read
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        {[
          { label: 'Unread', value: unreadCount.toString(), color: '#FDE8D4' },
          { label: 'Order Alerts', value: unreadByType('order').toString(), color: '#E3EEFF' },
          { label: 'Vendor Alerts', value: unreadByType('vendor').toString(), color: '#FDE8D4' },
          { label: 'System', value: unreadByType('system').toString(), color: '#F1F5F9' },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#1A5C58' }}>{loading ? '...' : kpi.value}</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[
          { key: 'all', label: 'All', count: notifications.length },
          { key: 'order', label: '📦 Orders', count: unreadByType('order') },
          { key: 'vendor', label: '🏪 Vendors', count: unreadByType('vendor') },
          { key: 'payment', label: '💰 Payments', count: unreadByType('payment') },
          { key: 'system', label: '⚙️ System', count: unreadByType('system') },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedType(tab.key)}
            style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 600,
              color: selectedType === tab.key ? '#1A5C58' : '#64748B',
              background: selectedType === tab.key ? '#E8F2F1' : '#FFFFFF',
              border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 20, height: 20, borderRadius: 10,
                background: selectedType === tab.key ? '#1A5C58' : '#E8F2F1',
                color: selectedType === tab.key ? '#FFFFFF' : '#1A5C58',
                fontSize: 11, fontWeight: 700,
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="panel" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading notifications...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B', fontStyle: 'italic' }}>
            {notifications.length === 0 ? 'No notifications yet' : 'No notifications match this filter'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.map((n) => {
              const isUnread = !n.read_at && !n.is_read
              const type = n.type || 'system'
              const tc = typeColors[type] || typeColors.system
              return (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px',
                  borderBottom: '1px solid #F5F0E8',
                  background: isUnread ? '#FAFBFD' : '#FFFFFF',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18,
                  }}>
                    {typeIcons[type] || '🔔'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14, fontWeight: isUnread ? 700 : 600, color: '#2C3E50' }}>
                        {n.title || 'Notification'}
                      </span>
                      {isUnread && <span style={{ width: 8, height: 8, borderRadius: 4, background: '#1F5ECC', flexShrink: 0 }} />}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', marginTop: 3, lineHeight: 1.4 }}>
                      {n.message || n.description || ''}
                    </div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
                      {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                      {n.data?.order_number && <span style={{ marginLeft: 8, color: '#1A5C58', fontWeight: 600 }}>#{n.data.order_number}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button
                      onClick={() => toggleRead(n.id)}
                      title={isUnread ? 'Mark read' : 'Mark unread'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', padding: 6, borderRadius: 6 }}
                    >
                      {isUnread ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => deleteNotification(n.id)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0553F', padding: 6, borderRadius: 6 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
