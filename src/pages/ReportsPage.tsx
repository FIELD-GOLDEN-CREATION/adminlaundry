import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { PageHeader } from '@/components/layout/PageHeader'

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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports"
        description="Performance metrics and analytics"
        action={
          <button
            onClick={() => navigate('/reports/center')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-xl hover:bg-[#0F423F] transition-colors shadow-sm"
          >
            Browse All Reports
            <ArrowRight size={16} />
          </button>
        }
      />

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748B]">Agent:</span>
          <div className="flex gap-1">
            {agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedAgent === agent.id
                    ? 'bg-[#1A5C58] text-white'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                {agent.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#64748B]">Period:</span>
          <div className="flex gap-1">
            {periods.map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  selectedPeriod === period.id
                    ? 'bg-[#1A5C58] text-white'
                    : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F1F5F9]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <p className="text-sm text-[#64748B]">{metric.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-3xl font-bold text-[#2C3E50]">{metric.value}</p>
              {metric.trend === 'up' && (
                <span className="flex items-center gap-1 text-sm text-green-600 mb-1">
                  <TrendingUp size={14} />
                  +{metric.change}%
                </span>
              )}
              {metric.trend === 'down' && (
                <span className="flex items-center gap-1 text-sm text-red-600 mb-1">
                  <TrendingDown size={14} />
                  +{metric.change}%
                </span>
              )}
              {metric.trend === 'neutral' && (
                <span className="flex items-center gap-1 text-sm text-[#64748B] mb-1">
                  <Minus size={14} />
                  --
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
        <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Orders vs Cancellations</h2>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
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

      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#1A5C58] hover:bg-[#1A5C58]/10 rounded-lg transition-colors">
          Export PDF
        </button>
      </div>
    </div>
  )
}
