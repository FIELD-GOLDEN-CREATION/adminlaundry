import { useEffect, useState } from 'react'
import { Download, TrendingUp, TrendingDown, Star } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface ShopEntry {
  shop_name?: string
  name?: string
  total_revenue?: number
  revenue?: number
  order_count?: number
  orders?: number
  average_rating?: number
  status?: string
  created_at?: string
}

interface ReportsData {
  revenue_by_day: { day: string; revenue_tzs: number; orders: number }[]
  top_shops: ShopEntry[]
  orders_by_status: Record<string, number>
  users_by_role: Record<string, number>
}

export default function VendorPerformanceReportPage() {
  const [sortBy, setSortBy] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [topShops, setTopShops] = useState<ShopEntry[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await adminApi.getReports()
        const d: ReportsData = res.data?.data ?? res.data
        if (!cancelled) setTopShops(d.top_shops ?? [])
      } catch {
        if (!cancelled) setError('Failed to load vendor performance data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const vendorPerformance = topShops.map((s) => ({
    name: s.shop_name ?? s.name ?? 'Unknown',
    orders: s.order_count ?? s.orders ?? 0,
    revenue: s.total_revenue ?? s.revenue ?? 0,
    rating: s.average_rating ?? 0,
  }))

  const sorted = [...vendorPerformance].sort((a, b) => {
    if (sortBy === 'orders') return b.orders - a.orders
    if (sortBy === 'revenue') return b.revenue - a.revenue
    if (sortBy === 'rating') return b.rating - a.rating
    return 0
  })

  const avgRating = vendorPerformance.length > 0
    ? (vendorPerformance.reduce((s, v) => s + v.rating, 0) / vendorPerformance.length).toFixed(1)
    : '0.0'

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: '#64748B' }}>Loading vendor performance...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: '#C0553F' }}>{error}</div>
      </div>
    )
  }

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
          { label: 'Avg Rating', value: avgRating, suffix: '★' },
          { label: 'Total Orders', value: vendorPerformance.reduce((s, v) => s + v.orders, 0).toLocaleString() },
          { label: 'Total Revenue', value: formatCurrency(vendorPerformance.reduce((s, v) => s + v.revenue, 0)) },
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
            <div className="chart-card-title">Orders by Vendor</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendorPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                  <Legend />
                  <Bar dataKey="orders" name="Orders" fill="#1A5C58" radius={[4, 4, 0, 0]} />
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
                  <Bar dataKey="revenue" name="Revenue (TZS)" fill="#1A5C58" radius={[0, 4, 4, 0]} />
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
              <th style={{ textAlign: 'center' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: 16 }}>No vendor data available.</td></tr>
            )}
            {sorted.map((v) => (
              <tr key={v.name}>
                <td style={{ fontWeight: 600, color: '#2C3E50' }}>{v.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.orders}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(v.revenue)}</td>
                <td style={{ textAlign: 'center' }}>
                  {v.rating > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: '#FDF3E3', color: '#D4841A', padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      <Star size={11} fill="#D4841A" /> {v.rating}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
