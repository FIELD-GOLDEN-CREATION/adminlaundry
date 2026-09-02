import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Download, Printer, ShoppingCart, Clock, Droplets, CheckCircle, Truck, Package } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  accepted: { bg: '#E3EEFF', fg: '#1F5ECC' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
}

const statusTabs = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_wash', label: 'In Wash' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery', label: 'Delivery' },
  { key: 'delivered', label: 'Delivered' },
]

export default function OrdersPage() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getDashboardOrders()
        setOrders(res.data.data || [])
      } catch (err) {
        console.error('Failed to load orders:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredOrders = selectedStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === selectedStatus)

  // Aggregate stats from real data
  const statusCounts: Record<string, number> = {}
  for (const o of orders) {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1
  }
  const totalRevenue = orders.filter((o) => o.payment_status === 'paid').reduce((sum, o) => sum + (o.total_tzs || 0), 0)

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: ShoppingCart, color: '#E8F2F1', fg: '#1A5C58' },
    { label: 'Revenue', value: formatCurrency(totalRevenue), icon: Package, color: '#FDF3E3', fg: '#D4841A' },
    { label: 'Pending', value: statusCounts['pending'] || 0, icon: Clock, color: '#FDF3E3', fg: '#D4841A' },
    { label: 'In Wash', value: (statusCounts['in_wash'] || 0) + (statusCounts['accepted'] || 0), icon: Droplets, color: '#E3EEFF', fg: '#1F5ECC' },
    { label: 'Ready', value: statusCounts['ready'] || 0, icon: CheckCircle, color: '#DFF5ED', fg: '#1A7A5C' },
    { label: 'Delivered', value: statusCounts['delivered'] || 0, icon: Truck, color: '#DFF5ED', fg: '#1A7A5C' },
  ]

  return (
    <div>
      {/* Header */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Orders</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" title="Refresh"><RefreshCw size={14} /></button>
          <button className="icon-btn" title="Export"><Download size={14} /></button>
          <button className="icon-btn" title="Print"><Printer size={14} /></button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-tile" style={{ '--tile-bg': s.color, '--tile-fg': s.fg } as React.CSSProperties}>
            <div className="st-icon"><s.icon size={16} /></div>
            <div className="st-value">{loading ? '...' : s.value}</div>
            <div className="st-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                color: selectedStatus === tab.key ? '#1A5C58' : '#64748B',
                background: selectedStatus === tab.key ? '#E8F2F1' : 'transparent',
                border: 'none', borderRadius: 7, cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading orders...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Client</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Fulfillment</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const sc = statusColors[order.status] || statusColors.pending
                  return (
                    <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/orders/${order.id}`)}>
                      <td style={{ fontWeight: 700, color: '#2C3E50' }}>#{order.order_number || order.id}</td>
                      <td style={{ color: '#64748B' }}>{order.customer_name || order.customer?.name || '—'}</td>
                      <td style={{ color: '#64748B' }}>{order.shop?.name || '—'}</td>
                      <td>
                        <span className="status-pill" style={{ background: sc.bg, color: sc.fg }}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ color: '#64748B', fontSize: 13 }}>{order.fulfillment || '—'}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(order.total_tzs || 0)}</td>
                      <td style={{ color: '#64748B', fontSize: 12 }}>
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  )
                })}
                {filteredOrders.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>No orders found</td></tr>
                )}
              </tbody>
            </table>
            <div className="dt-footer">
              Showing {filteredOrders.length} of {orders.length} orders
            </div>
          </>
        )}
      </div>
    </div>
  )
}
