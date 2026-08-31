import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus, ArrowRight, BarChart3, ShoppingCart, CreditCard, Repeat, Users, Truck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { adminApi } from '@/services/api'

const quickLinks = [
  { label: 'Orders Report', description: 'Order trends, status breakdown, cancellation analysis', icon: ShoppingCart, path: '/reports/orders', color: '#E3EEFF', fg: '#1F5ECC' },
  { label: 'Revenue & Payments', description: 'Revenue trends, payment methods, refund analysis', icon: CreditCard, path: '/reports/revenue', color: '#DFF5ED', fg: '#1A7A5C' },
  { label: 'Subscriptions', description: 'Plan distribution, MRR, churn, upgrade rates', icon: Repeat, path: '/reports/subscriptions', color: '#F3EEFF', fg: '#8B5CF6' },
  { label: 'Vendor Performance', description: 'Vendor ratings, load, earnings, fulfillment times', icon: Truck, path: '/reports/vendor-performance', color: '#FDE8D4', fg: '#CF6A2C' },
  { label: 'Customer Analytics', description: 'New vs returning, retention, lifetime value', icon: Users, path: '/reports/customers', color: '#FDF3E3', fg: '#D4841A' },
  { label: 'Vendor Load', description: 'Current vendor capacity and queue status', icon: BarChart3, path: '/reports/vendor-load', color: '#F1F5F9', fg: '#64748B' },
]

function formatTZS(value: number): string {
  if (value >= 1_000_000) return `TZS ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `TZS ${(value / 1_000).toFixed(1)}K`
  return `TZS ${value.toLocaleString()}`
}

export default function ReportsPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [overviewMetrics, setOverviewMetrics] = useState<{ label: string; value: string; change: number; trend: 'up' | 'down' | 'neutral'; color: string }[]>([])
  const [weeklyData, setWeeklyData] = useState<{ day: string; revenue: number; orders: number; cancelled: number }[]>([])

  useEffect(() => {
    let cancelled = false

    async function fetchReports() {
      try {
        setLoading(true)
        setError(null)
        const res = await adminApi.getReports()
        if (cancelled) return

        if (res.data?.success) {
          const { revenue_by_day, top_shops, orders_by_status, users_by_role } = res.data.data

          const totalRevenue = revenue_by_day.reduce((s: number, d: any) => s + (d.revenue_tzs || 0), 0)
          const totalOrders = revenue_by_day.reduce((s: number, d: any) => s + (d.orders || 0), 0)
          const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
          const totalCancelled = orders_by_status?.cancelled ?? 0
          const totalDelivered = orders_by_status?.delivered ?? 0
          const successRate = totalDelivered + totalCancelled > 0 ? ((totalDelivered / (totalDelivered + totalCancelled)) * 100) : 0

          const activeVendors = users_by_role?.vendor ?? 0
          const activeSubscriptions = res.data.data.users_by_role?.vendor ?? 0

          setOverviewMetrics([
            { label: 'Total Revenue', value: formatTZS(totalRevenue), change: 0, trend: 'neutral', color: '#1A5C58' },
            { label: 'Total Orders', value: totalOrders.toLocaleString(), change: 0, trend: 'neutral', color: '#1F5ECC' },
            { label: 'Active Vendors', value: String(activeVendors), change: 0, trend: 'neutral', color: '#D4841A' },
            { label: 'Active Subscriptions', value: String(activeSubscriptions), change: 0, trend: 'neutral', color: '#8B5CF6' },
            { label: 'Success Rate', value: `${successRate.toFixed(1)}%`, change: 0, trend: 'neutral', color: '#64748B' },
            { label: 'Avg Order Value', value: formatTZS(avgOrderValue), change: 0, trend: 'neutral', color: '#1A7A5C' },
          ])

          setWeeklyData(
            revenue_by_day.map((d: any) => ({
              day: d.day,
              revenue: d.revenue_tzs || 0,
              orders: d.orders || 0,
              cancelled: 0,
            }))
          )
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.response?.data?.message || err?.message || 'Failed to load reports')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchReports()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#64748B', fontSize: 14 }}>
        Loading reports...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: '#C0553F', fontSize: 14 }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Reports</li>
        </ol>
      </div>

      {/* Overview metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {overviewMetrics.map((metric) => (
          <div key={metric.label} className="panel" style={{ padding: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>{metric.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#2C3E50' }}>{metric.value}</span>
              {metric.trend === 'up' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#1A7A5C' }}>
                  <TrendingUp size={11} /> +{metric.change}%
                </span>
              )}
              {metric.trend === 'down' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#C0553F' }}>
                  <TrendingDown size={11} /> -{metric.change}%
                </span>
              )}
              {metric.trend === 'neutral' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 800, color: '#64748B' }}>
                  <Minus size={11} /> --
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
            <div className="chart-card-title">Weekly Revenue & Orders</div>
            <div className="chart-card-sub">Revenue trend with order volume overlay</div>
          </div>
        </div>
        <div className="chart-card-body">
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }}
                  formatter={(value: number, name: string) => [
                    name === 'revenue' ? `TZS ${(value / 1000000).toFixed(1)}M` : value,
                    name === 'revenue' ? 'Revenue' : name === 'orders' ? 'Orders' : 'Cancelled',
                  ]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#1A5C58" radius={[4, 4, 0, 0]} />
                <Bar dataKey="orders" name="Orders" fill="#1F5ECC" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#C0553F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick access report cards */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50' }}>Browse Reports</div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>Detailed analytics for every area of your business</div>
          </div>
          <button
            onClick={() => navigate('/reports/center')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
              fontSize: 12, fontWeight: 700, color: '#1A5C58', background: '#E8F2F1',
              border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            View All <ArrowRight size={13} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {quickLinks.map((link) => (
            <div
              key={link.label}
              className="panel"
              style={{ padding: 18, cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s' }}
              onClick={() => navigate(link.path)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = link.fg; e.currentTarget.style.boxShadow = `0 4px 12px ${link.fg}15` }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE7D9'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,34,0.05)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: link.color,
                }}>
                  <link.icon size={18} style={{ color: link.fg }} />
                </div>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{link.label}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.5 }}>{link.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, fontSize: 12, fontWeight: 700, color: link.fg }}>
                View Report <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
