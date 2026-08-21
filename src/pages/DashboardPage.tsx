import { Package, Truck, Store, DollarSign, AlertTriangle, ArrowUpRight, ExternalLink } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const kpiCards = [
  { label: 'Active Orders', value: '128', change: 12, up: true },
  { label: 'Drivers Online', value: '19', change: 3, up: true },
  { label: 'Vendors Open', value: '42', change: 5, up: true },
  { label: 'Revenue Today', value: 'TZS 24.4M', change: 8, up: true },
]

const ordersPerHour = [
  { hour: '6AM', orders: 12 }, { hour: '8AM', orders: 28 }, { hour: '10AM', orders: 45 },
  { hour: '12PM', orders: 38 }, { hour: '2PM', orders: 52 }, { hour: '4PM', orders: 41 },
  { hour: '6PM', orders: 65 }, { hour: '8PM', orders: 58 }, { hour: '10PM', orders: 22 },
]

const vendorLoad = [
  { name: 'Marina Fresh', percentage: 52 },
  { name: 'Bright & Fold', percentage: 38.4 },
  { name: 'Crisp Corner', percentage: 15.1 },
]

const alerts = [
  { id: '1', type: 'urgent', title: 'Unassigned Order #4521', desc: 'Waiting 45 minutes', tag: 'urgent' },
  { id: '2', type: 'late', title: 'Pickup Overdue', desc: 'Driver Daniel is 15 mins late', tag: 'late' },
  { id: '3', type: 'cancel', title: 'Vendor Cancelled', desc: 'Marina Fresh declined order #4518', tag: 'cancelled' },
]

const recentOrders = [
  { id: '#4523', client: 'Amara K.', vendor: 'Marina Fresh', status: 'in_wash', total: 45000 },
  { id: '#4522', client: 'Jabari M.', vendor: 'Bright & Fold', status: 'ready', total: 32000 },
  { id: '#4521', client: 'Nadia B.', vendor: 'Crisp Corner', status: 'pending', total: 28000 },
  { id: '#4520', client: 'Daniel O.', vendor: 'Marina Fresh', status: 'delivered', total: 55000 },
  { id: '#4519', client: 'Grace T.', vendor: 'Bright & Fold', status: 'out_for_delivery', total: 41000 },
]

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
}

const alertColors: Record<string, { border: string; bg: string; icon: string; tag: string; tagBg: string }> = {
  urgent: { border: '#C0553F', bg: '#FFF6F3', icon: '#C0553F', tag: '#C0553F', tagBg: '#F3D5CE' },
  late: { border: '#D4841A', bg: '#FFF9EF', icon: '#D4841A', tag: '#D4841A', tagBg: '#FDF3E3' },
  cancel: { border: '#1F5ECC', bg: '#F2F7FF', icon: '#1F5ECC', tag: '#1F5ECC', tagBg: '#E3EEFF' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Admin'

  return (
    <div>
      {/* Hero (matches original) */}
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
                <span className="hc-value">{kpi.value}</span>
                <span className={`hc-delta ${kpi.up ? 'pos' : 'warn'}`}>
                  {kpi.up ? '+' : ''}{kpi.change}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2-column grid (matches original) */}
      <div className="row row-8-4" style={{ marginTop: 18 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Orders Per Hour chart */}
          <div className="chart-card">
            <div className="chart-card-head">
              <div>
                <div className="chart-card-title">Orders Per Hour</div>
                <div className="chart-card-sub">Peak activity window</div>
              </div>
              <span className="status-pill" style={{ background: '#E8F2F1', color: '#1A5C58' }}>Today</span>
            </div>
            <div className="chart-card-body">
              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ordersPerHour} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EDE7D9" />
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <Tooltip
                      cursor={{ fill: '#1A5C58', fillOpacity: 0.06 }}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #EDE7D9',
                        borderRadius: '10px',
                        fontSize: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                    />
                    <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                      {ordersPerHour.map((entry, index) => (
                        <Cell key={index} fill={entry.orders === 65 ? '#D4841A' : '#1A5C58'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

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
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                      <td style={{ fontWeight: 700, color: '#2C3E50' }}>{order.id}</td>
                      <td style={{ color: '#64748B' }}>{order.client}</td>
                      <td style={{ color: '#64748B' }}>{order.vendor}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{ background: sc.bg, color: sc.fg }}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(order.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="dt-footer">View all orders →</div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Alerts */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Urgent Alerts</div>
                <div className="panel-sub">Needs attention</div>
              </div>
            </div>
            <div className="alert-list">
              {alerts.map((alert) => {
                const ac = alertColors[alert.type]
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
                    <span
                      className="alert-tag"
                      style={{ background: ac.tagBg, color: ac.tag }}
                    >
                      {alert.tag}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vendor Load */}
          <div className="panel">
            <div className="panel-head">
              <div>
                <div className="panel-title">Vendor Load</div>
                <div className="panel-sub">Current capacity share</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {vendorLoad.map((vendor) => (
                <div key={vendor.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{vendor.name}</span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#2C3E50' }}>{vendor.percentage}%</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: '#EDE7D9', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${vendor.percentage}%`,
                        borderRadius: 999,
                        background: vendor.percentage > 50 ? '#D4841A' : '#1A5C58',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16 }}>
              <a
                href="/reports/vendor-load"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#1A5C58',
                  textDecoration: 'none',
                  padding: '10px 0',
                  border: '1px solid #EDE7D9',
                  borderRadius: 10,
                  background: '#FFFFFF',
                }}
              >
                View Full Load Report <ExternalLink size={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
