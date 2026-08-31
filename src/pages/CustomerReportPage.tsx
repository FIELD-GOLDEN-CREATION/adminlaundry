import { useEffect, useState } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  phone?: string
  created_at?: string
  order_count?: number
  total_spent?: number
}

interface UsersResponse {
  success: boolean
  data: User[] | { users?: User[]; data?: User[] }
}

const pieColors = ['#64748B', '#D4841A', '#1F5ECC', '#1A5C58', '#C0553F']

export default function CustomerReportPage() {
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [customers, setCustomers] = useState<User[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const res = await adminApi.getUsers('customer')
        const raw = res.data
        let list: User[] = []
        if (Array.isArray(raw)) {
          list = raw
        } else if (raw?.data) {
          list = Array.isArray(raw.data) ? raw.data : (raw.data?.users ?? [])
        } else if (raw?.users) {
          list = raw.users
        }
        if (!cancelled) setCustomers(list)
      } catch {
        if (!cancelled) setError('Failed to load customer data.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const totalCustomers = customers.length

  const customersByMonth = customers.reduce<Record<string, { new: number; returning: number; total: number }>>((acc, c) => {
    if (c.created_at) {
      const d = new Date(c.created_at)
      const key = d.toLocaleString('en-US', { month: 'short' })
      if (!acc[key]) acc[key] = { new: 0, returning: 0, total: 0 }
      acc[key].new += 1
      acc[key].total += 1
    }
    return acc
  }, {})

  const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const customerGrowth = monthOrder
    .filter((m) => customersByMonth[m])
    .map((m) => ({ month: m, ...customersByMonth[m] }))

  const topCustomers = [...customers]
    .sort((a, b) => (b.order_count ?? b.total_spent ?? 0) - (a.order_count ?? a.total_spent ?? 0))
    .slice(0, 5)

  const totalOrders = customers.reduce((s, c) => s + (c.order_count ?? 0), 0)
  const avgOrderPerCustomer = totalCustomers > 0 ? (totalOrders / totalCustomers).toFixed(1) : '0'
  const totalSpent = customers.reduce((s, c) => s + (c.total_spent ?? 0), 0)
  const avgLifetimeValue = totalCustomers > 0 ? Math.round(totalSpent / totalCustomers) : 0

  const segments = [
    { name: 'One-time', value: customers.filter((c) => (c.order_count ?? 0) <= 1).length, color: '#64748B' },
    { name: 'Occasional', value: customers.filter((c) => (c.order_count ?? 0) > 1 && (c.order_count ?? 0) <= 5).length, color: '#D4841A' },
    { name: 'Regular', value: customers.filter((c) => (c.order_count ?? 0) > 5 && (c.order_count ?? 0) <= 15).length, color: '#1F5ECC' },
    { name: 'Loyal', value: customers.filter((c) => (c.order_count ?? 0) > 15).length, color: '#1A5C58' },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <div style={{ fontSize: 14, color: '#64748B' }}>Loading customer report...</div>
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
          { label: 'Total Orders', value: String(totalOrders), change: '+18%', up: true },
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
                  <Pie data={segments} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {segments.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {segments.map((s) => (
                <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#64748B' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />
                  {s.name} ({s.value})
                </div>
              ))}
            </div>
          </div>
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
              <th>Email</th>
              <th style={{ textAlign: 'right' }}>Orders</th>
              <th style={{ textAlign: 'right' }}>Total Spent</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B', padding: 16 }}>No customer data available.</td></tr>
            )}
            {topCustomers.map((c) => (
              <tr key={c.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="avatar-chip" style={{ width: 30, height: 30, fontSize: 11 }}>{c.name?.charAt(0) ?? '?'}</div>
                    <span style={{ fontWeight: 600, color: '#2C3E50' }}>{c.name}</span>
                  </div>
                </td>
                <td style={{ color: '#64748B' }}>{c.email}</td>
                <td style={{ textAlign: 'right', fontWeight: 700 }}>{c.order_count ?? 0}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(c.total_spent ?? 0)}</td>
                <td style={{ color: '#64748B' }}>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
