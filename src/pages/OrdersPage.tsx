import { useState } from 'react'
import { RefreshCw, Download, Printer } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const orders = [
  { id: '#4523', client: 'Amara K.', avatar: 'A', vendor: 'Marina Fresh', status: 'in_wash', total: 45000, date: '2024-01-15' },
  { id: '#4522', client: 'Jabari M.', avatar: 'J', vendor: 'Bright & Fold', status: 'ready', total: 32000, date: '2024-01-15' },
  { id: '#4521', client: 'Nadia B.', avatar: 'N', vendor: 'Crisp Corner', status: 'pending', total: 28000, date: '2024-01-15' },
  { id: '#4520', client: 'Daniel O.', avatar: 'D', vendor: 'Marina Fresh', status: 'delivered', total: 55000, date: '2024-01-15' },
  { id: '#4519', client: 'Grace T.', avatar: 'G', vendor: 'Bright & Fold', status: 'out_for_delivery', total: 41000, date: '2024-01-15' },
  { id: '#4518', client: 'Ibrahim S.', avatar: 'I', vendor: 'Marina Fresh', status: 'cancelled', total: 38000, date: '2024-01-14' },
  { id: '#4517', client: 'Fatima H.', avatar: 'F', vendor: 'Crisp Corner', status: 'refunded', total: 29000, date: '2024-01-14' },
  { id: '#4516', client: 'Kofi A.', avatar: 'K', vendor: 'Bright & Fold', status: 'delivered', total: 52000, date: '2024-01-14' },
  { id: '#4515', client: 'Lila M.', avatar: 'L', vendor: 'Marina Fresh', status: 'in_wash', total: 36000, date: '2024-01-14' },
  { id: '#4514', client: 'Omar N.', avatar: 'O', vendor: 'Crisp Corner', status: 'ready', total: 44000, date: '2024-01-14' },
]

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
  refunded: { bg: '#F1F5F9', fg: '#64748B' },
}

const stats = [
  { label: 'Orders Today', value: '128', color: '#E8F2F1' },
  { label: 'Revenue Today', value: 'TZS 24.4M', color: '#FDF3E3' },
  { label: 'In Wash', value: '34', color: '#E3EEFF' },
  { label: 'Unassigned', value: '8', color: '#F3D5CE' },
  { label: 'Out for Delivery', value: '21', color: '#FDE8D4' },
  { label: 'Refunded', value: '3', color: '#F1F5F9' },
]

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState('all')

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false
    if (selectedVendor !== 'all' && order.vendor !== selectedVendor) return false
    return true
  })

  return (
    <div>
      {/* Title card (matches original) */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Orders</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}>
            <Download size={14} /> CSV
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Stat tiles (matches original) */}
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
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Status</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{
              width: '100%', height: 36, borderRadius: 9, border: '1px solid #EDE7D9',
              padding: '4px 10px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_wash">In Wash</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            style={{
              width: '100%', height: 36, borderRadius: 9, border: '1px solid #EDE7D9',
              padding: '4px 10px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="all">All Vendors</option>
            <option value="Marina Fresh">Marina Fresh</option>
            <option value="Bright & Fold">Bright & Fold</option>
            <option value="Crisp Corner">Crisp Corner</option>
          </select>
        </div>
      </div>

      {/* Data table (matches original) */}
      <div className="data-table-card">
        <div className="dt-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dt-title">Orders</span>
            <span className="dt-sub">{filteredOrders.length} records</span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th><input type="checkbox" style={{ accentColor: '#1A5C58' }} /></th>
              <th>Order</th>
              <th>Client</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const sc = statusColors[order.status] || statusColors.pending
              return (
                <tr key={order.id}>
                  <td><input type="checkbox" style={{ accentColor: '#1A5C58' }} /></td>
                  <td style={{ fontWeight: 700, color: '#2C3E50' }}>{order.id}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar-chip" style={{ width: 28, height: 28, fontSize: 11 }}>
                        {order.avatar}
                      </div>
                      <span style={{ color: '#2C3E50' }}>{order.client}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748B' }}>{order.vendor}</td>
                  <td>
                    <span className="status-pill" style={{ background: sc.bg, color: sc.fg }}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ color: '#64748B' }}>{order.date}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#2C3E50' }}>
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="dt-footer">View all orders</div>
      </div>
    </div>
  )
}
