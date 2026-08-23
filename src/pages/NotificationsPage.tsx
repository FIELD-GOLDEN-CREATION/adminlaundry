import { useState } from 'react'
import { Bell, CheckCheck, Trash2, Eye, EyeOff } from 'lucide-react'

interface Notification {
  id: string
  title: string
  desc: string
  type: 'order' | 'vendor' | 'system' | 'payment'
  time: string
  unread: boolean
}

const initialNotifications: Notification[] = [
  { id: '1', title: 'New order assigned', desc: 'Order #4523 assigned to Marina Fresh for wash & fold service', type: 'order', time: '2m ago', unread: true },
  { id: '2', title: 'Pickup overdue', desc: 'Driver Daniel is 15 mins late for pickup at Location A', type: 'order', time: '8m ago', unread: true },
  { id: '3', title: 'Vendor cancelled order', desc: 'Marina Fresh declined Order #4518 — reason: capacity full', type: 'vendor', time: '12m ago', unread: true },
  { id: '4', title: 'Payout completed', desc: 'TZS 1.2M sent to Bright & Fold for Jan 10–14 invoices', type: 'payment', time: '1h ago', unread: false },
  { id: '5', title: 'New vendor registered', desc: 'Sparkle Wash applied to join the platform — pending review', type: 'vendor', time: '2h ago', unread: false },
  { id: '6', title: 'Order delivered', desc: 'Order #4520 delivered to Daniel O. by Marina Fresh', type: 'order', time: '3h ago', unread: false },
  { id: '7', title: 'System maintenance scheduled', desc: 'Planned downtime on Jan 20, 02:00–04:00 EAT', type: 'system', time: '5h ago', unread: false },
  { id: '8', title: 'Customer complaint', desc: 'Nadia B. reported missing items in Order #4521', type: 'order', time: '6h ago', unread: true },
  { id: '9', title: 'Vendor rating updated', desc: 'Crisp Corner rating dropped to 3.8 — below threshold', type: 'vendor', time: '8h ago', unread: false },
  { id: '10', title: 'Payment failed', desc: 'Client payment for Order #4517 failed — retry initiated', type: 'payment', time: '10h ago', unread: true },
  { id: '11', title: 'Bulk order received', desc: '12 new orders from corporate client — auto-assigned to vendors', type: 'order', time: '12h ago', unread: false },
  { id: '12', title: 'Driver offline', desc: 'Driver Felix has been offline for 45 minutes', type: 'system', time: '14h ago', unread: false },
  { id: '13', title: 'Promo code used 100 times', desc: 'WELCOME20 promo code reached usage milestone', type: 'system', time: '1d ago', unread: false },
  { id: '14', title: 'Vendor payout pending', desc: 'Marina Fresh payout of TZS 890K awaiting approval', type: 'payment', time: '1d ago', unread: false },
  { id: '15', title: 'New staff member', desc: 'Hassan K. added to the operations team by admin', type: 'system', time: '2d ago', unread: false },
]

const typeColors: Record<string, { bg: string; fg: string }> = {
  order: { bg: '#E3EEFF', fg: '#1F5ECC' },
  vendor: { bg: '#FDE8D4', fg: '#CF6A2C' },
  system: { bg: '#F1F5F9', fg: '#64748B' },
  payment: { bg: '#DFF5ED', fg: '#1A7A5C' },
}

const stats = [
  { label: 'Total Notifications', value: '15', color: '#E8F2F1' },
  { label: 'Unread', value: '5', color: '#FDE8D4' },
  { label: 'Order Alerts', value: '6', color: '#E3EEFF' },
  { label: 'Vendor Alerts', value: '3', color: '#FDE8D4' },
  { label: 'Payments', value: '3', color: '#DFF5ED' },
  { label: 'System', value: '3', color: '#F1F5F9' },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [selectedType, setSelectedType] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = notifications.filter((n) => {
    if (selectedType !== 'all' && n.type !== selectedType) return false
    if (search && !n.title.toLowerCase().includes(search.toLowerCase()) && !n.desc.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const unreadCount = notifications.filter((n) => n.unread).length

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n))
    )
  }

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={markAllRead}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
              border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            <CheckCheck size={14} /> Mark All Read
          </button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="stat-grid">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-tile" style={{ '--tile-bg': stat.color } as React.CSSProperties}>
            <div className="st-value">{stat.value}</div>
            <div className="st-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 14,
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
        flexWrap: 'wrap',
      }}>
        <div className="search-box" style={{ maxWidth: 320 }}>
          <Bell size={15} color="#64748B" />
          <input
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            style={{
              width: '100%', height: 36, borderRadius: 9, border: '1px solid #EDE7D9',
              padding: '4px 10px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="all">All Types</option>
            <option value="order">Orders</option>
            <option value="vendor">Vendors</option>
            <option value="payment">Payments</option>
            <option value="system">System</option>
          </select>
        </div>
        {unreadCount > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: '#FDE8D4', borderRadius: 9, fontSize: 12, fontWeight: 700, color: '#D4841A',
          }}>
            <Bell size={13} /> {unreadCount} unread
          </div>
        )}
      </div>

      {/* Notifications list */}
      <div className="data-table-card">
        <div className="dt-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dt-title">Notifications</span>
            <span className="dt-sub">{filtered.length} records</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {filtered.map((n) => {
            const tc = typeColors[n.type] || typeColors.system
            return (
              <div
                key={n.id}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px',
                  borderBottom: '1px solid #F5F0E8',
                  background: n.unread ? 'rgba(26,92,88,0.03)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#F5F0E8' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = n.unread ? 'rgba(26,92,88,0.03)' : 'transparent' }}
              >
                {/* Unread dot */}
                <div style={{
                  marginTop: 6, width: 8, height: 8, borderRadius: 999, flexShrink: 0,
                  background: n.unread ? '#D4841A' : 'transparent',
                }} />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 700, color: '#2C3E50' }}>{n.title}</span>
                    <span className="status-pill" style={{ background: tc.bg, color: tc.fg, fontSize: 10 }}>
                      {n.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 12.5, color: '#64748B', lineHeight: 1.5 }}>{n.desc}</div>
                  <div style={{ fontSize: 11, color: '#64748B', marginTop: 4, opacity: 0.7 }}>{n.time}</div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleRead(n.id) }}
                    title={n.unread ? 'Mark as read' : 'Mark as unread'}
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: '1px solid #EDE7D9',
                      background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#64748B',
                    }}
                  >
                    {n.unread ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id) }}
                    title="Delete"
                    style={{
                      width: 30, height: 30, borderRadius: 8, border: '1px solid #EDE7D9',
                      background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#C0553F',
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div style={{
              padding: '40px 20px', textAlign: 'center', color: '#64748B', fontSize: 13, fontWeight: 600,
            }}>
              No notifications found
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
