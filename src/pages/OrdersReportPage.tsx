import { useState } from 'react'
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const weeklyOrders = [
  { day: 'Mon', completed: 42, cancelled: 3, refunded: 1 },
  { day: 'Tue', completed: 47, cancelled: 5, refunded: 2 },
  { day: 'Wed', completed: 44, cancelled: 4, refunded: 0 },
  { day: 'Thu', completed: 54, cancelled: 7, refunded: 3 },
  { day: 'Fri', completed: 49, cancelled: 6, refunded: 1 },
  { day: 'Sat', completed: 59, cancelled: 8, refunded: 2 },
  { day: 'Sun', completed: 38, cancelled: 4, refunded: 1 },
]

const statusBreakdown = [
  { name: 'Delivered', value: 520, color: '#1A7A5C' },
  { name: 'In Progress', value: 145, color: '#1F5ECC' },
  { name: 'Cancelled', value: 48, color: '#C0553F' },
  { name: 'Refunded', value: 22, color: '#64748B' },
  { name: 'Pending', value: 35, color: '#D4841A' },
]

const topVendors = [
  { name: 'Marina Fresh', orders: 187, revenue: 8200000, avgTime: '2.4h', rating: 4.8 },
  { name: 'Bright & Fold', orders: 156, revenue: 6900000, avgTime: '2.1h', rating: 4.7 },
  { name: 'Crisp Corner', orders: 134, revenue: 5800000, avgTime: '2.8h', rating: 4.5 },
  { name: 'Fresh Press Co.', orders: 98, revenue: 4300000, avgTime: '3.1h', rating: 4.3 },
  { name: 'Sparkle Wash', orders: 72, revenue: 3200000, avgTime: '2.6h', rating: 4.6 },
]

const recentOrders = [
  { id: '#4523', client: 'Amara K.', vendor: 'Marina Fresh', total: 45000, status: 'delivered', date: '2026-08-23' },
  { id: '#4522', client: 'Jabari M.', vendor: 'Bright & Fold', total: 32000, status: 'in_progress', date: '2026-08-23' },
  { id: '#4521', client: 'Nadia B.', vendor: 'Crisp Corner', total: 28000, status: 'pending', date: '2026-08-23' },
  { id: '#4520', client: 'Daniel O.', vendor: 'Marina Fresh', total: 55000, status: 'delivered', date: '2026-08-22' },
  { id: '#4519', client: 'Grace T.', vendor: 'Bright & Fold', total: 41000, status: 'cancelled', date: '2026-08-22' },
]

const statusColors: Record<string, { bg: string; fg: string }> = {
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  in_progress: { bg: '#E3EEFF', fg: '#1F5ECC' },
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
  refunded: { bg: '#F1F5F9', fg: '#64748B' },
}

export default function OrdersReportPage() {
  const [period, setPeriod] = useState('week')

  const totalOrders = weeklyOrders.reduce((s, d) => s + d.completed + d.cancelled + d.refunded, 0)
  const totalCompleted = weeklyOrders.reduce((s, d) => s + d.completed, 0)
  const totalCancelled = weeklyOrders.reduce((s, d) => s + d.cancelled, 0)
  const successRate = ((totalCompleted / totalOrders) * 100).toFixed(1)

  return (
    <div>
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/reports" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Reports</a></li>
          <li className="sep">/</li>
          <li className="current">Orders Report</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Period filter */}
      <div style={{ display: 'flex', gap: 4 }}>
        {['today', 'week', 'month', 'quarter'].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
            color: period === p ? '#FFFFFF' : '#64748B', background: period === p ? '#1A5C58' : '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
          }}>{p}</button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Orders', value: totalOrders.toLocaleString(), color: '#E8F2F1' },
          { label: 'Completed', value: totalCompleted.toLocaleString(), color: '#DFF5ED', change: '+8.3%', up: true },
          { label: 'Cancelled', value: totalCancelled.toLocaleString(), color: '#F3D5CE', change: '+4.2%', up: false },
          { label: 'Success Rate', value: `${successRate}%`, color: '#E3EEFF' },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{kpi.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#2C3E50' }}>{kpi.value}</span>
              {kpi.change && (
                <span style={{ fontSize: 11, fontWeight: 800, color: kpi.up ? '#1A7A5C' : '#C0553F', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.change}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Orders by Day</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyOrders}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="completed" name="Completed" fill="#1A7A5C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#C0553F" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="refunded" name="Refunded" fill="#64748B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Status Breakdown</div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {statusBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {statusBreakdown.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top vendors table */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Top Vendors by Orders</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th style={{ textAlign: 'right' }}>Orders</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'center' }}>Avg Time</th>
              <th style={{ textAlign: 'center' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topVendors.map((v) => (
              <tr key={v.name}>
                <td style={{ fontWeight: 600, color: '#2C3E50' }}>{v.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.orders}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(v.revenue)}</td>
                <td style={{ textAlign: 'center', color: '#64748B' }}>{v.avgTime}</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ background: '#FDF3E3', color: '#D4841A', padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    ★ {v.rating}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recent orders */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Recent Orders</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Client</th>
              <th>Vendor</th>
              <th>Status</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => {
              const sc = statusColors[o.status] || statusColors.pending
              return (
                <tr key={o.id}>
                  <td style={{ fontWeight: 700 }}>{o.id}</td>
                  <td>{o.client}</td>
                  <td style={{ color: '#64748B' }}>{o.vendor}</td>
                  <td><span className="status-pill" style={{ background: sc.bg, color: sc.fg }}>{o.status.replace(/_/g, ' ')}</span></td>
                  <td style={{ color: '#64748B' }}>{o.date}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(o.total)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
