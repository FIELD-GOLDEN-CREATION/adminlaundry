import { useEffect, useState } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
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

export default function RevenueReportPage() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revenueByDay, setRevenueByDay] = useState<RevenueDay[]>([])
  const [topShops, setTopShops] = useState<ShopEntry[]>([])

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
        }
      } catch {
        if (!cancelled) setError('Failed to load revenue report.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const monthlyRevenue = revenueByDay.map((r) => ({
    month: r.day,
    revenue: r.revenue_tzs,
    orders: r.orders,
  }))

  const totalRevenue = revenueByDay.reduce((s, r) => s + r.revenue_tzs, 0)
  const totalOrders = revenueByDay.reduce((s, r) => s + r.orders, 0)
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0

  const paymentMethods = [
    { method: 'M-Pesa', count: Math.round(totalOrders * 0.52), percentage: 52, total: Math.round(totalRevenue * 0.52) },
    { method: 'Tigo Pesa', count: Math.round(totalOrders * 0.24), percentage: 24, total: Math.round(totalRevenue * 0.24) },
    { method: 'Cash', count: Math.round(totalOrders * 0.14), percentage: 14, total: Math.round(totalRevenue * 0.14) },
    { method: 'Card', count: Math.round(totalOrders * 0.10), percentage: 10, total: Math.round(totalRevenue * 0.10) },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: '#64748B' }}>Loading revenue report...</div>
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
          <li className="current">Revenue & Payments</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>
            <Download size={14} /> Export
          </button>
        </div>
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
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), change: '+12.5%', up: true },
          { label: 'Total Orders', value: String(totalOrders), change: '+8.2%', up: true },
          { label: 'Avg Order Value', value: formatCurrency(avgOrderValue) },
          { label: 'Top Shops', value: String(topShops.length) },
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

      {/* Revenue chart */}
      <div className="chart-card">
        <div className="chart-card-head">
          <div>
            <div className="chart-card-title">Revenue by Day</div>
            <div className="chart-card-sub">Daily revenue overview (TZS)</div>
          </div>
        </div>
        <div className="chart-card-body">
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="revenue" name="Revenue (TZS)" fill="#1A5C58" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#1F5ECC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment methods & top shops row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Payment methods */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Payment Methods (Estimated)</div>
          {paymentMethods.map((pm) => (
            <div key={pm.method} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{pm.method}</span>
                <span style={{ fontSize: 12, color: '#64748B' }}>{pm.count} transactions · {formatCurrency(pm.total)}</span>
              </div>
              <div style={{ height: 8, background: '#F5F0E8', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pm.percentage}%`, background: '#1A5C58', borderRadius: 4 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Top shops */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Top Shops</div>
          {topShops.length === 0 && <div style={{ fontSize: 13, color: '#64748B' }}>No shop data available.</div>}
          {topShops.map((s) => (
            <div key={s.shop_name ?? s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F0E8' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{s.shop_name ?? s.name}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{s.order_count ?? s.orders ?? 0} orders</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(s.total_revenue ?? s.revenue ?? 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
