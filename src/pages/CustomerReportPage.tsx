import { useState } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const customerGrowth = [
  { month: 'Jan', new: 45, returning: 120, total: 165 },
  { month: 'Feb', new: 52, returning: 135, total: 187 },
  { month: 'Mar', new: 61, returning: 148, total: 209 },
  { month: 'Apr', new: 48, returning: 142, total: 190 },
  { month: 'May', new: 67, returning: 165, total: 232 },
  { month: 'Jun', new: 74, returning: 178, total: 252 },
]

const retentionCohort = [
  { month: 'Month 1', retained: 100, churned: 0 },
  { month: 'Month 2', retained: 78, churned: 22 },
  { month: 'Month 3', retained: 65, churned: 35 },
  { month: 'Month 4', retained: 58, churned: 42 },
  { month: 'Month 5', retained: 52, churned: 48 },
  { month: 'Month 6', retained: 48, churned: 52 },
]

const customerSegments = [
  { name: 'One-time', value: 180, color: '#64748B' },
  { name: 'Occasional', value: 95, color: '#D4841A' },
  { name: 'Regular', value: 65, color: '#1F5ECC' },
  { name: 'Loyal', value: 35, color: '#1A5C58' },
]

const topCustomers = [
  { name: 'Amara Koroma', orders: 24, totalSpent: 1080000, lastOrder: '2026-08-23', favoriteVendor: 'Marina Fresh' },
  { name: 'Jabari Mensah', orders: 18, totalSpent: 720000, lastOrder: '2026-08-22', favoriteVendor: 'Bright & Fold' },
  { name: 'Nadia Bakari', orders: 15, totalSpent: 650000, lastOrder: '2026-08-21', favoriteVendor: 'Crisp Corner' },
  { name: 'Daniel Osei', orders: 12, totalSpent: 540000, lastOrder: '2026-08-20', favoriteVendor: 'Marina Fresh' },
  { name: 'Grace Tambo', orders: 10, totalSpent: 420000, lastOrder: '2026-08-19', favoriteVendor: 'Sparkle Wash' },
]

const deviceBreakdown = [
  { device: 'Android', percentage: 72 },
  { device: 'iOS', percentage: 24 },
  { device: 'Web', percentage: 4 },
]

export default function CustomerReportPage() {
  const [period, setPeriod] = useState('month')

  const totalCustomers = customerGrowth[customerGrowth.length - 1].total
  const totalNew = customerGrowth.reduce((s, m) => s + m.new, 0)
  const avgOrderPerCustomer = (topCustomers.reduce((s, c) => s + c.orders, 0) / topCustomers.length).toFixed(1)
  const avgLifetimeValue = Math.round(topCustomers.reduce((s, c) => s + c.totalSpent, 0) / topCustomers.length)

  return (
    <div>
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/reports" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Reports</a></li>
          <li className="sep">/</li>
          <li className="current">Customer Analytics</li>
        </ol>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {['week', 'month', 'quarter', 'year'].map((p) => (
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
          { label: 'Total Customers', value: String(totalCustomers), change: '+14.5%', up: true },
          { label: 'New Customers', value: String(totalNew), change: '+18%', up: true },
          { label: 'Avg Orders / Customer', value: avgOrderPerCustomer },
          { label: 'Avg Lifetime Value', value: formatCurrency(avgLifetimeValue) },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>{kpi.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>{kpi.value}</span>
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
            <div className="chart-card-title">Customer Growth</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="new" name="New Customers" fill="#1A5C58" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="returning" name="Returning" fill="#D4841A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Customer Segments</div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={customerSegments} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {customerSegments.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {customerSegments.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Retention & Device row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Customer Retention Curve</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={retentionCohort}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Line type="monotone" dataKey="retained" name="Retained" stroke="#1A5C5C" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="churned" name="Churned" stroke="#C0553F" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Device Breakdown</div>
          {deviceBreakdown.map((d) => (
            <div key={d.device} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{d.device}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>{d.percentage}%</span>
              </div>
              <div style={{ height: 8, background: '#F5F0E8', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.percentage}%`, background: '#1A5C58', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top customers table */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Top Customers</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Customer</th>
              <th style={{ textAlign: 'right' }}>Orders</th>
              <th style={{ textAlign: 'right' }}>Total Spent</th>
              <th>Last Order</th>
              <th>Favorite Vendor</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((c) => (
              <tr key={c.name}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar-chip" style={{ width: 30, height: 30, fontSize: 11 }}>{c.name.charAt(0)}</div>
                    <span style={{ fontWeight: 600, color: '#2C3E50' }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{c.orders}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(c.totalSpent)}</td>
                <td style={{ color: '#64748B' }}>{c.lastOrder}</td>
                <td style={{ color: '#64748B' }}>{c.favoriteVendor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
