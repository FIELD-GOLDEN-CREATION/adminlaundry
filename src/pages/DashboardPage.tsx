import { useState, useEffect } from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
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

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Admin'

  const [kpi, setKpi] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_users: 0,
    total_vendors: 0,
    total_shops: 0,
    pending_orders: 0,
    active_orders: 0,
    completed_orders: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [dashRes, ordersRes] = await Promise.all([
          adminApi.getDashboard(),
          adminApi.getDashboardOrders(),
        ])
        const dash = dashRes.data.data
        setKpi(dash)
        setRecentOrders((ordersRes.data.data || []).slice(0, 5))
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const kpiCards = [
    { label: 'Total Orders', value: kpi.total_orders.toString(), sub: `${kpi.active_orders} active` },
    { label: 'Total Users', value: kpi.total_users.toString(), sub: `${kpi.total_vendors} vendors` },
    { label: 'Active Shops', value: kpi.total_shops.toString(), sub: '' },
    { label: 'Revenue', value: formatCurrency(kpi.total_revenue), sub: `${kpi.completed_orders} completed` },
  ]

  const alerts: { id: string; type: string; title: string; desc: string; tag: string }[] = []
  if (kpi.pending_orders > 0) {
    alerts.push({ id: '1', type: 'urgent', title: `${kpi.pending_orders} pending order${kpi.pending_orders > 1 ? 's' : ''}`, desc: 'Awaiting vendor response', tag: 'urgent' })
  }
  if (kpi.active_orders > 0) {
    alerts.push({ id: '2', type: 'late', title: `${kpi.active_orders} order${kpi.active_orders > 1 ? 's' : ''} in progress`, desc: 'Being processed by vendors', tag: 'active' })
  }
  if (alerts.length === 0) {
    alerts.push({ id: '0', type: 'cancel', title: 'All clear', desc: 'No urgent alerts right now', tag: 'ok' })
  }

  const alertColors: Record<string, { border: string; bg: string; icon: string; tag: string; tagBg: string }> = {
    urgent: { border: '#C0553F', bg: '#FFF6F3', icon: '#C0553F', tag: '#C0553F', tagBg: '#F3D5CE' },
    late: { border: '#D4841A', bg: '#FFF9EF', icon: '#D4841A', tag: '#D4841A', tagBg: '#FDF3E3' },
    cancel: { border: '#1A7A5C', bg: '#F0FAF4', icon: '#1A7A5C', tag: '#1A7A5C', tagBg: '#DFF5ED' },
  }

  return (
    <div>
      <section className="hero">
        <div className="hero-top">
          <div>
            <p className="hero-eyebrow">Overview</p>
            <h1 className="hero-title">Welcome back, {firstName} 👋</h1>
          </div>
        </div>
        <div className="hero-cards">
          {kpiCards.map((kpi) => (
            <div key={kpi.label} className="hero-card">
              <div className="hc-label">{kpi.label}</div>
              <div className="hc-row">
                <span className="hc-value">{loading ? '...' : kpi.value}</span>
              </div>
              {kpi.sub && <div className="hc-label" style={{ marginTop: 4 }}>{kpi.sub}</div>}
            </div>
          ))}
        </div>
      </section>

      <div className="row row-8-4" style={{ marginTop: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Recent Orders table */}
          <div className="data-table-card">
            <div className="dt-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="dt-title">Recent Orders</span>
              </div>
              <a href="/orders" style={{ fontSize: 12, fontWeight: 700, color: '#1A5C58', textDecoration: 'none' }}>
                View all
              </a>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#64748B' }}>Loading...</div>
            ) : (
              <>
                {/* Desktop table — scrollable on small screens */}
                <div className="data-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 540 }}>
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Client</th>
                        <th>Vendor</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const sc = statusColors[order.status] || statusColors.pending
                        return (
                          <tr key={order.id}>
                            <td style={{ fontWeight: 700, color: '#2C3E50' }}>#{order.id}</td>
                            <td style={{ color: '#64748B' }}>{order.customer_name || order.customer?.name || '—'}</td>
                            <td style={{ color: '#64748B' }}>{order.shop?.name || '—'}</td>
                            <td>
                              <span className="status-pill" style={{ background: sc.bg, color: sc.fg }}>
                                {order.status?.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(order.total_tzs || 0)}</td>
                          </tr>
                        )
                      })}
                      {recentOrders.length === 0 && (
                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#64748B' }}>No orders yet</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile card list — visible only on small screens */}
                {recentOrders.length > 0 && (
                  <div className="mobile-card-list">
                    {recentOrders.map((order) => {
                      const sc = statusColors[order.status] || statusColors.pending
                      return (
                        <div key={order.id} className="mobile-order-card">
                          <div className="mobile-order-top">
                            <span className="mobile-order-id">#{order.id}</span>
                            <span className="status-pill" style={{ background: sc.bg, color: sc.fg }}>
                              {order.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className="mobile-order-meta">
                            <span>{order.customer_name || order.customer?.name || '—'}</span>
                            <span className="mobile-order-total">{formatCurrency(order.total_tzs || 0)}</span>
                          </div>
                          <div className="mobile-order-meta">
                            <span>{order.shop?.name || '—'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="dt-footer">View all orders →</div>
              </>
            )}
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Alerts */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Alerts</div>
                <div className="panel-sub">Needs attention</div>
              </div>
            </div>
            <div className="alert-list">
              {alerts.map((alert) => {
                const ac = alertColors[alert.type] || alertColors.cancel
                return (
                  <div
                    key={alert.id}
                    className="alert-card"
                    style={{ borderLeftColor: ac.border, background: ac.bg }}
                  >
                    <div style={{ color: ac.icon, flexShrink: 0 }}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="alert-body">
                      <div className="alert-title">{alert.title}</div>
                      <div className="alert-sub">{alert.desc}</div>
                    </div>
                    <span className="alert-tag" style={{ background: ac.tagBg, color: ac.tag }}>
                      {alert.tag}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Platform Stats</div>
                <div className="panel-sub">All time</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'Total Orders', value: kpi.total_orders },
                { label: 'Completed', value: kpi.completed_orders },
                { label: 'Total Users', value: kpi.total_users },
                { label: 'Active Shops', value: kpi.total_shops },
              ].map((item) => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#2C3E50' }}>{loading ? '...' : item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
