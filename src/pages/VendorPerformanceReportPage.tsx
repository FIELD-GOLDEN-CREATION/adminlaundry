import { useState } from 'react'
import { Download, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const vendorPerformance = [
  { name: 'Marina Fresh', orders: 187, revenue: 8200000, avgTime: 2.4, rating: 4.8, reviews: 142, onTime: 96, cancellationRate: 3.2 },
  { name: 'Bright & Fold', orders: 156, revenue: 6900000, avgTime: 2.1, rating: 4.7, reviews: 118, onTime: 94, cancellationRate: 4.1 },
  { name: 'Crisp Corner', orders: 134, revenue: 5800000, avgTime: 2.8, rating: 4.5, reviews: 95, onTime: 91, cancellationRate: 5.2 },
  { name: 'Fresh Press Co.', orders: 98, revenue: 4300000, avgTime: 3.1, rating: 4.3, reviews: 72, onTime: 88, cancellationRate: 6.1 },
  { name: 'Sparkle Wash', orders: 72, revenue: 3200000, avgTime: 2.6, rating: 4.6, reviews: 58, onTime: 93, cancellationRate: 3.8 },
  { name: 'Quick Iron', orders: 45, revenue: 1900000, avgTime: 1.8, rating: 4.9, reviews: 38, onTime: 98, cancellationRate: 2.1 },
]

const monthlyPerformance = [
  { month: 'Jan', Marina: 28, Bright: 24, Crisp: 20 },
  { month: 'Feb', Marina: 32, Bright: 26, Crisp: 22 },
  { month: 'Mar', Marina: 35, Bright: 30, Crisp: 25 },
  { month: 'Apr', Marina: 30, Bright: 28, Crisp: 23 },
  { month: 'May', Marina: 38, Bright: 32, Crisp: 27 },
  { month: 'Jun', Marina: 42, Bright: 35, Crisp: 30 },
]

const topRated = vendorPerformance.sort((a, b) => b.rating - a.rating).slice(0, 5)

export default function VendorPerformanceReportPage() {
  const [sortBy, setSortBy] = useState('orders')

  const sorted = [...vendorPerformance].sort((a, b) => {
    if (sortBy === 'orders') return b.orders - a.orders
    if (sortBy === 'revenue') return b.revenue - a.revenue
    if (sortBy === 'rating') return b.rating - a.rating
    if (sortBy === 'onTime') return b.onTime - a.onTime
    return 0
  })

  return (
    <div>
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/reports" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Reports</a></li>
          <li className="sep">/</li>
          <li className="current">Vendor Performance</li>
        </ol>
        <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>
          <Download size={14} /> Export
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {[
          { label: 'Total Vendors', value: String(vendorPerformance.length) },
          { label: 'Avg Rating', value: (vendorPerformance.reduce((s, v) => s + v.rating, 0) / vendorPerformance.length).toFixed(1), suffix: '★' },
          { label: 'Avg Fulfillment', value: `${(vendorPerformance.reduce((s, v) => s + v.avgTime, 0) / vendorPerformance.length).toFixed(1)}h` },
          { label: 'Avg On-Time', value: `${Math.round(vendorPerformance.reduce((s, v) => s + v.onTime, 0) / vendorPerformance.length)}%` },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 18, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#1A5C58' }}>{kpi.value}{kpi.suffix || ''}</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginTop: 4 }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Orders by Vendor (Monthly)</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="Marina" name="Marina Fresh" fill="#1A5C58" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Bright" name="Bright & Fold" fill="#D4841A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Crisp" name="Crisp Corner" fill="#1F5ECC" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Revenue by Vendor</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformance} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={100} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                  <Bar dataKey="revenue" name="Revenue" fill="#1A5C58" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Sort pills */}
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { id: 'orders', label: 'By Orders' },
          { id: 'revenue', label: 'By Revenue' },
          { id: 'rating', label: 'By Rating' },
          { id: 'onTime', label: 'By On-Time %' },
        ].map((s) => (
          <button key={s.id} onClick={() => setSortBy(s.id)} style={{
            padding: '6px 14px', fontSize: 12, fontWeight: 600,
            color: sortBy === s.id ? '#FFFFFF' : '#64748B', background: sortBy === s.id ? '#1A5C58' : '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
          }}>{s.label}</button>
        ))}
      </div>

      {/* Vendor table */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Vendor Performance Details</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th style={{ textAlign: 'right' }}>Orders</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'center' }}>Avg Time</th>
              <th style={{ textAlign: 'center' }}>Rating</th>
              <th style={{ textAlign: 'center' }}>On-Time %</th>
              <th style={{ textAlign: 'center' }}>Cancel %</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((v) => (
              <tr key={v.name}>
                <td style={{ fontWeight: 600, color: '#2C3E50' }}>{v.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.orders}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(v.revenue)}</td>
                <td style={{ textAlign: 'center', color: '#64748B' }}>{v.avgTime}h</td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#FDF3E3', color: '#D4841A', padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                    <Star size={11} fill="#D4841A" /> {v.rating}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: v.onTime >= 95 ? '#1A7A5C' : v.onTime >= 90 ? '#D4841A' : '#C0553F', fontWeight: 700, fontSize: 13 }}>
                    {v.onTime}%
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span style={{ color: v.cancellationRate <= 3 ? '#1A7A5C' : v.cancellationRate <= 5 ? '#D4841A' : '#C0553F', fontWeight: 700, fontSize: 13 }}>
                    {v.cancellationRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
