import { useEffect, useState } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface Subscription {
  id: number
  vendor_name?: string
  shop_name?: string
  vendor?: { name?: string }
  plan?: string
  plan_name?: string
  status?: string
  created_at?: string
  subscribed_since?: string
  monthly_revenue?: number
  revenue?: number
}

interface SubscriptionsResponse {
  success?: boolean
  data?: Subscription[] | { subscriptions?: Subscription[]; data?: Subscription[] }
}

const pieColors = ['#64748B', '#1A5C58', '#D4841A', '#1F5ECC', '#C0553F']

const planColors: Record<string, { bg: string; fg: string }> = {
  Basic: { bg: '#F1F5F9', fg: '#64748B' },
  Pro: { bg: '#E8F2F1', fg: '#1A5C58' },
  Enterprise: { bg: '#FDF3E3', fg: '#D4841A' },
  free: { bg: '#F1F5F9', fg: '#64748B' },
}

export default function SubscriptionsReportPage() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await adminApi.getSubscriptions()
        const raw = res.data
        let list: Subscription[] = []
        if (Array.isArray(raw)) {
          list = raw
        } else if (raw?.data) {
          list = Array.isArray(raw.data) ? raw.data : (raw.data?.subscriptions ?? [])
        } else if (raw?.subscriptions) {
          list = raw.subscriptions
        }
        if (!cancelled) setSubscriptions(list)
      } catch {
        if (!cancelled) setError('Failed to load subscriptions data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const activeSubscriptions = subscriptions.filter((s) => s.status === 'active' || s.status === 'Active')

  const planCounts = subscriptions.reduce<Record<string, number>>((acc, s) => {
    const plan = s.plan ?? s.plan_name ?? 'Unknown'
    acc[plan] = (acc[plan] ?? 0) + 1
    return acc
  }, {})

  const planDistribution = Object.entries(planCounts).map(([name, value], i) => ({
    name,
    value,
    color: pieColors[i % pieColors.length],
  }))

  const totalMRR = subscriptions.reduce((s, sub) => s + (sub.monthly_revenue ?? sub.revenue ?? 0), 0)
  const avgRevenuePerVendor = activeSubscriptions.length > 0 ? Math.round(totalMRR / activeSubscriptions.length) : 0
  const churnRate = subscriptions.length > 0
    ? ((subscriptions.filter((s) => s.status === 'cancelled' || s.status === 'inactive').length / subscriptions.length) * 100).toFixed(1)
    : '0.0'

  const monthlyByPlan = subscriptions.reduce<Record<string, Record<string, number>>>((acc, s) => {
    const plan = s.plan ?? s.plan_name ?? 'Basic'
    const date = s.created_at ?? s.subscribed_since
    if (date) {
      const d = new Date(date)
      const key = d.toLocaleString('en-US', { month: 'short' })
      if (!acc[key]) acc[key] = {}
      acc[key][plan] = (acc[key][plan] ?? 0) + (s.monthly_revenue ?? s.revenue ?? 0)
    }
    return acc
  }, {})

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const monthlyMRR = monthOrder
    .filter((m) => monthlyByPlan[m])
    .map((m) => ({
      month: m,
      ...monthlyByPlan[m],
      total: Object.values(monthlyByPlan[m]).reduce((s, v) => s + v, 0),
    }))

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: '#64748B' }}>Loading subscriptions report...</div>
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
          <li className="current">Subscriptions Report</li>
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
          { label: 'Monthly Recurring Revenue', value: formatCurrency(totalMRR), change: '+5.1%', up: true },
          { label: 'Active Subscriptions', value: String(activeSubscriptions.length), change: '+2', up: true },
          { label: 'Avg Revenue / Vendor', value: formatCurrency(avgRevenuePerVendor) },
          { label: 'Churn Rate', value: `${churnRate}%`, change: '-0.3%', up: true },
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
            <div className="chart-card-title">Monthly Recurring Revenue</div>
          </div>
          <div className="chart-card-body">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyMRR}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} formatter={(v: number) => formatCurrency(v)} />
                  <Legend />
                  {Object.keys(planCounts).map((plan, i) => (
                    <Bar key={plan} dataKey={plan} name={plan} fill={pieColors[i % pieColors.length]} stackId="a" radius={i === Object.keys(planCounts).length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <div className="chart-card">
          <div className="chart-card-head">
            <div className="chart-card-title">Plan Distribution</div>
          </div>
          <div className="chart-card-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {planDistribution.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {planDistribution.map((p) => (
                <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
                  {p.name} ({p.value})
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vendor subscriptions table */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Vendor Subscriptions</span>
          <span className="dt-sub">{subscriptions.length} vendors</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th>Plan</th>
              <th>Subscribed Since</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Monthly Revenue</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 16 }}>No subscription data available.</td></tr>
            )}
            {subscriptions.map((v) => {
              const plan = v.plan ?? v.plan_name ?? 'Basic'
              const vendorName = v.vendor_name ?? v.shop_name ?? v.vendor?.name ?? 'Unknown'
              const since = v.subscribed_since ?? v.created_at
              const revenue = v.monthly_revenue ?? v.revenue ?? 0
              const status = v.status ?? 'active'
              const pc = planColors[plan] ?? planColors.Basic
              return (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600, color: '#2C3E50' }}>{vendorName}</td>
                  <td><span className="status-pill" style={{ background: pc.bg, color: pc.fg }}>{plan}</span></td>
                  <td style={{ color: '#64748B' }}>{since ? new Date(since).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className="status-pill" style={{
                      background: status === 'active' || status === 'Active' ? '#DFF5ED' : '#F3D5CE',
                      color: status === 'active' || status === 'Active' ? '#1A7A5C' : '#C0553F',
                    }}>{status}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: revenue > 0 ? '#1A5C58' : '#64748B' }}>
                    {revenue > 0 ? formatCurrency(revenue) : 'Free'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
