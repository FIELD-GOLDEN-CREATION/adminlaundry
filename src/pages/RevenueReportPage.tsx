import { useState } from 'react'
import { Download, Printer, TrendingUp, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'
import { formatCurrency } from '@/lib/utils'

const monthlyRevenue = [
  { month: 'Jan', revenue: 8200000, expenses: 3100000, profit: 5100000 },
  { month: 'Feb', revenue: 9100000, expenses: 3400000, profit: 5700000 },
  { month: 'Mar', revenue: 10500000, expenses: 3800000, profit: 6700000 },
  { month: 'Apr', revenue: 9800000, expenses: 3600000, profit: 6200000 },
  { month: 'May', revenue: 11200000, expenses: 4100000, profit: 7100000 },
  { month: 'Jun', revenue: 12400000, expenses: 4500000, profit: 7900000 },
]

const paymentMethods = [
  { method: 'M-Pesa', count: 680, percentage: 52, total: 28600000 },
  { method: 'Tigo Pesa', count: 320, percentage: 24, total: 13400000 },
  { method: 'Cash', count: 180, percentage: 14, total: 7800000 },
  { method: 'Card', count: 130, percentage: 10, total: 5600000 },
]

const recentTransactions = [
  { id: 'TXN-8821', type: 'Order Payment', client: 'Amara K.', amount: 45000, method: 'M-Pesa', date: '2026-08-23', status: 'completed' },
  { id: 'TXN-8820', type: 'Vendor Payout', vendor: 'Marina Fresh', amount: 3200000, method: 'Bank Transfer', date: '2026-08-23', status: 'completed' },
  { id: 'TXN-8819', type: 'Refund', client: 'Daniel O.', amount: 12000, method: 'M-Pesa', date: '2026-08-22', status: 'completed' },
  { id: 'TXN-8818', type: 'Order Payment', client: 'Nadia B.', amount: 28000, method: 'Tigo Pesa', date: '2026-08-22', status: 'completed' },
  { id: 'TXN-8817', type: 'Subscription', vendor: 'Bright & Fold', amount: 75000, method: 'M-Pesa', date: '2026-08-22', status: 'completed' },
]

const refundReasons = [
  { reason: 'Item damaged', count: 8, amount: 96000 },
  { reason: 'Wrong item', count: 5, amount: 62000 },
  { reason: 'Late delivery', count: 4, amount: 48000 },
  { reason: 'Quality issue', count: 3, amount: 35000 },
]

export default function RevenueReportPage() {
  const [period, setPeriod] = useState('month')

  const totalRevenue = monthlyRevenue.reduce((s, m) => s + m.revenue, 0)
  const totalExpenses = monthlyRevenue.reduce((s, m) => s + m.expenses, 0)
  const totalProfit = monthlyRevenue.reduce((s, m) => s + m.profit, 0)
  const avgOrderValue = Math.round(totalRevenue / 1300)

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
          { label: 'Total Expenses', value: formatCurrency(totalExpenses), change: '+8.2%', up: false },
          { label: 'Net Profit', value: formatCurrency(totalProfit), change: '+15.3%', up: true },
          { label: 'Avg Order Value', value: formatCurrency(avgOrderValue) },
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
            <div className="chart-card-title">Revenue, Expenses & Profit</div>
            <div className="chart-card-sub">Monthly financial overview</div>
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
                <Bar dataKey="revenue" name="Revenue" fill="#1A5C58" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#C0553F" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#1F5ECC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Payment methods & refunds row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Payment methods */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Payment Methods</div>
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

        {/* Refund reasons */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Refund Reasons</div>
          {refundReasons.map((r) => (
            <div key={r.reason} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F0E8' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{r.reason}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{r.count} refunds</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#C0553F' }}>-{formatCurrency(r.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions table */}
      <div className="data-table-card">
        <div className="dt-head">
          <span className="dt-title">Recent Transactions</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Transaction</th>
              <th>Type</th>
              <th>Entity</th>
              <th>Method</th>
              <th>Date</th>
              <th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 700 }}>{t.id}</td>
                <td>
                  <span className="status-pill" style={{
                    background: t.type.includes('Payout') ? '#FDE8D4' : t.type === 'Refund' ? '#F3D5CE' : '#DFF5ED',
                    color: t.type.includes('Payout') ? '#CF6A2C' : t.type === 'Refund' ? '#C0553F' : '#1A7A5C',
                  }}>{t.type}</span>
                </td>
                <td style={{ color: '#64748B' }}>{t.client || t.vendor}</td>
                <td style={{ color: '#64748B' }}>{t.method}</td>
                <td style={{ color: '#64748B' }}>{t.date}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'Refund' ? '#C0553F' : '#1A5C58' }}>
                  {t.type === 'Refund' ? '-' : ''}{formatCurrency(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
