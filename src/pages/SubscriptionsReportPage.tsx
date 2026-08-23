import { useState } from 'react'
import { Download, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const planDistribution = [
  { name: 'Basic', value: 12, color: '#64748B' },
  { name: 'Pro', value: 24, color: '#1A5C58' },
  { name: 'Enterprise', value: 6, color: '#D4841A' },
]

const monthlyMRR = [
  { month: 'Jan', basic: 0, pro: 1425000, enterprise: 1200000, total: 2625000 },
  { month: 'Feb', basic: 0, pro: 1575000, enterprise: 1200000, total: 2775000 },
  { month: 'Mar', basic: 0, pro: 1725000, enterprise: 1600000, total: 3325000 },
  { month: 'Apr', basic: 0, pro: 1800000, enterprise: 1600000, total: 3400000 },
  { month: 'May', basic: 0, pro: 1875000, enterprise: 2000000, total: 3875000 },
  { month: 'Jun', basic: 0, pro: 1800000, enterprise: 2000000, total: 3800000 },
]

const vendorSubscriptions = [
  { vendor: 'Marina Fresh', plan: 'Enterprise', since: '2025-10-15', status: 'active', revenue: 1200000 },
  { vendor: 'Bright & Fold', plan: 'Pro', since: '2025-11-20', status: 'active', revenue: 75000 },
  { vendor: 'Crisp Corner', plan: 'Pro', since: '2025-12-01', status: 'active', revenue: 75000 },
  { vendor: 'Fresh Press Co.', plan: 'Basic', since: '2026-01-10', status: 'active', revenue: 0 },
  { vendor: 'Sparkle Wash', plan: 'Pro', since: '2026-02-05', status: 'active', revenue: 75000 },
  { vendor: 'Quick Iron', plan: 'Basic', since: '2026-03-12', status: 'active', revenue: 0 },
  { vendor: 'CleanPro', plan: 'Enterprise', since: '2026-04-18', status: 'active', revenue: 200000 },
  { vendor: 'LaundryHub', plan: 'Basic', since: '2026-05-22', status: 'cancelled', revenue: 0 },
]

const churnData = [
  { month: 'Jan', new: 3, churned: 1, net: 2 },
  { month: 'Feb', new: 2, churned: 0, net: 2 },
  { month: 'Mar', new: 4, churned: 1, net: 3 },
  { month: 'Apr', new: 2, churned: 2, net: 0 },
  { month: 'May', new: 3, churned: 1, net: 2 },
  { month: 'Jun', new: 2, churned: 1, net: 1 },
]

const planColors: Record<string, { bg: string; fg: string }> = {
  Basic: { bg: '#F1F5F9', fg: '#64748B' },
  Pro: { bg: '#E8F2F1', fg: '#1A5C58' },
  Enterprise: { bg: '#FDF3E3', fg: '#D4841A' },
}

export default function SubscriptionsReportPage() {
  const [period, setPeriod] = useState('month')

  const totalMRR = monthlyMRR[monthlyMRR.length - 1].total
  const activeVendors = vendorSubscriptions.filter((v) => v.status === 'active').length
  const avgRevenuePerVendor = Math.round(totalMRR / activeVendors)
  const churnRate = ((1 / (activeVendors + 1)) * 100).toFixed(1)

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
          { label: 'Active Subscriptions', value: String(activeVendors), change: '+2', up: true },
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
                  <Bar dataKey="pro" name="Pro" fill="#1A5C58" stackId="a" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="enterprise" name="Enterprise" fill="#D4841A" stackId="a" radius={[4, 4, 0, 0]} />
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

      {/* Churn chart */}
      <div className="chart-card">
        <div className="chart-card-head">
          <div className="chart-card-title">New vs Churned Subscriptions</div>
        </div>
        <div className="chart-card-body">
          <div style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={churnData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 10, fontSize: 12 }} />
                <Legend />
                <Line type="monotone" dataKey="new" name="New" stroke="#1A7A5C" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="churned" name="Churned" stroke="#C0553F" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="net" name="Net Growth" stroke="#1F5ECC" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Vendor subscriptions table */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Vendor Subscriptions</span>
          <span className="dt-sub">{vendorSubscriptions.length} vendors</span>
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
            {vendorSubscriptions.map((v) => {
              const pc = planColors[v.plan] || planColors.Basic
              return (
                <tr key={v.vendor}>
                  <td style={{ fontWeight: 600, color: '#2C3E50' }}>{v.vendor}</td>
                  <td><span className="status-pill" style={{ background: pc.bg, color: pc.fg }}>{v.plan}</span></td>
                  <td style={{ color: '#64748B' }}>{v.since}</td>
                  <td>
                    <span className="status-pill" style={{
                      background: v.status === 'active' ? '#DFF5ED' : '#F3D5CE',
                      color: v.status === 'active' ? '#1A7A5C' : '#C0553F',
                    }}>{v.status}</span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: v.revenue > 0 ? '#1A5C58' : '#64748B' }}>
                    {v.revenue > 0 ? formatCurrency(v.revenue) : 'Free'}
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
