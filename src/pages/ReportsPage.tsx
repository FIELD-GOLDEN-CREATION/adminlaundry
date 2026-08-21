import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const agents = [
  { id: 'all', label: 'All Agents' },
  { id: 'selma', label: 'Selma D.' },
  { id: 'kofi', label: 'Kofi A.' },
  { id: 'nadia', label: 'Nadia B.' },
]

const periods = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'quarter', label: 'Quarter' },
]

const metrics = [
  { label: 'New Clients', value: '214', change: 18, trend: 'up' as const },
  { label: 'Cancelled Orders', value: '37', change: 4.2, trend: 'down' as const },
  { label: 'Success Rate', value: '94.6%', change: 0, trend: 'neutral' as const },
]

const chartData = [
  { day: 'Mon', orders: 45, cancelled: 3 },
  { day: 'Tue', orders: 52, cancelled: 5 },
  { day: 'Wed', orders: 48, cancelled: 4 },
  { day: 'Thu', orders: 61, cancelled: 7 },
  { day: 'Fri', orders: 55, cancelled: 6 },
  { day: 'Sat', orders: 67, cancelled: 8 },
  { day: 'Sun', orders: 42, cancelled: 4 },
]

export default function ReportsPage() {
  const [selectedAgent, setSelectedAgent] = useState('all')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const navigate = useNavigate()

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Reports</li>
        </ol>
        <button
          onClick={() => navigate('/reports/center')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
            border: 'none', borderRadius: 9, cursor: 'pointer',
          }}
        >
          Browse All Reports
        </button>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Agent:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                style={{
                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: selectedAgent === agent.id ? '#FFFFFF' : '#64748B',
                  background: selectedAgent === agent.id ? '#1A5C58' : '#FFFFFF',
                  border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                }}
              >
                {agent.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Period:</span>
          <div style={{ display: 'flex', gap: 4 }}>
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                style={{
                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: selectedPeriod === period.id ? '#FFFFFF' : '#64748B',
                  background: selectedPeriod === period.id ? '#1A5C58' : '#FFFFFF',
                  border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                }}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {metrics.map((metric) => (
          <div key={metric.label} className="panel" style={{ padding: 20 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#64748B' }}>{metric.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6 }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#2C3E50' }}>{metric.value}</span>
              {metric.trend === 'up' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#1A7A5C' }}>
                  <TrendingUp size={12} /> +{metric.change}%
                </span>
              )}
              {metric.trend === 'down' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#C0553F' }}>
                  <TrendingDown size={12} /> +{metric.change}%
                </span>
              )}
              {metric.trend === 'neutral' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 800, color: '#64748B' }}>
                  <Minus size={12} /> --
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="chart-card">
        <div className="chart-card-head">
          <div className="chart-card-title">Orders vs Cancellations</div>
        </div>
        <div className="chart-card-body">
          <div style={{ height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE7D9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EDE7D9',
                    borderRadius: '10px',
                    fontSize: '12px',
                  }}
                />
                <Legend />
                <Bar dataKey="orders" name="Orders" fill="#1A5C58" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill="#C0553F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Export */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
          fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
          border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
        }}>
          Export PDF
        </button>
      </div>
    </div>
  )
}
