import { useEffect, useState } from 'react'
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface RevenueDay {
  day: string
  revenue_tzs: number
  orders: number
}

interface ShopEntry {
  shop_name?: string
  name?: string
  total_revenue?: number
  revenue?: number
  order_count?: number
  orders?: number
  average_rating?: number
}

interface ReportsData {
  revenue_by_day: RevenueDay[]
  top_shops: ShopEntry[]
  orders_by_status: Record<string, number>
  users_by_role: Record<string, number>
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  in_progress: { bg: '#E3EEFF', fg: '#1F5ECC' },
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
  refunded: { bg: '#F1F5F9', fg: '#64748B' },
  completed: { bg: '#DFF5ED', fg: '#1A7A5C' },
  active: { bg: '#DFF5ED', fg: '#1A7A5C' },
}

const pieColors = ['#1A7A5C', '#1F5ECC', '#C0553F', '#64748B', '#D4841A', '#8B5CF6']

export default function OrdersReportPage() {
  const [period, setPeriod] = useState('week')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revenueByDay, setRevenueByDay] = useState<RevenueDay[]>([])
  const [topShops, setTopShops] = useState<ShopEntry[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await adminApi.getReports()
        const d: ReportsData = res.data?.data ?? res.data
        if (!cancelled) {
          setRevenueByDay(d.revenue_by_day ?? [])
          setTopShops(d.top_shops ?? [])
          setOrdersByStatus(d.orders_by_status ?? {})
        }
      } catch {
        if (!cancelled) setError('Failed to load orders report.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const weeklyOrders = revenueByDay.map((r) => ({
    day: r.day,
    completed: r.orders,
    revenue: r.revenue_tzs,
  }))

  const totalOrders = revenueByDay.reduce((s, r) => s + r.orders, 0)
  const statusBreakdown = Object.entries(ordersByStatus).map(([name, value], i) => ({
    name,
    value,
    color: pieColors[i % pieColors.length],
  }))

  const totalStatusOrders = statusBreakdown.reduce((s, e) => s + e.value, 0)
  const deliveredCount = ordersByStatus['delivered'] ?? ordersByStatus['completed'] ?? 0
  const successRate = totalStatusOrders > 0 ? ((deliveredCount / totalStatusOrders) * 100).toFixed(1) : '0.0'

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: '#64748B' }}>Loading orders report...</div>
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
          { label: 'Delivered', value: deliveredCount.toLocaleString(), color: '#DFF5ED', change: '+8.3%', up: true },
          { label: 'Cancelled', value: (ordersByStatus['cancelled'] ?? 0).toLocaleString(), color: '#F3D5CE', change: '+4.2%', up: false },
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
                  <Bar dataKey="completed" name="Orders" fill="#1A7A5C" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue (TZS)" fill="#1F5ECC" radius={[4, 4, 0, 0]} />
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
          <span className="dt-title">Top Shops by Orders</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Shop</th>
              <th style={{ textAlign: 'right' }}>Orders</th>
              <th style={{ textAlign: 'right' }}>Revenue</th>
              <th style={{ textAlign: 'center' }}>Rating</th>
            </tr>
          </thead>
          <tbody>
            {topShops.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748B', padding: 16 }}>No shop data available.</td></tr>
            )}
            {topShops.map((v) => (
              <tr key={v.shop_name ?? v.name}>
                <td style={{ fontWeight: 600, color: '#2C3E50' }}>{v.shop_name ?? v.name}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{v.order_count ?? v.orders ?? 0}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(v.total_revenue ?? v.revenue ?? 0)}</td>
                <td style={{ textAlign: 'center' }}>
                  {v.average_rating != null && (
                    <span style={{ background: '#FDF3E3', color: '#D4841A', padding: '3px 8px', borderRadius: 8, fontSize: 12, fontWeight: 700 }}>
                      ★ {v.average_rating}
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
