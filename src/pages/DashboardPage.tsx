import { Package, Truck, Store, DollarSign, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { cn, formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

const kpiCards = [
  { label: 'Active Orders', value: '128', change: 12, icon: Package, color: '#1A5C58', light: '#ecf4f3' },
  { label: 'Drivers Online', value: '19', change: 3, icon: Truck, color: '#D4841A', light: '#fbf1e3' },
  { label: 'Vendors Open', value: '42', change: 5, icon: Store, color: '#1A5C58', light: '#ecf4f3' },
  { label: 'Revenue Today', value: formatCurrency(24400000), change: 8, icon: DollarSign, color: '#D4841A', light: '#fbf1e3' },
]

const ordersPerHour = [
  { hour: '6AM', orders: 12 },
  { hour: '8AM', orders: 28 },
  { hour: '10AM', orders: 45 },
  { hour: '12PM', orders: 38 },
  { hour: '2PM', orders: 52 },
  { hour: '4PM', orders: 41 },
  { hour: '6PM', orders: 65 },
  { hour: '8PM', orders: 58 },
  { hour: '10PM', orders: 22 },
]

const vendorLoad = [
  { name: 'Marina Fresh', percentage: 52, color: '#1A5C58' },
  { name: 'Bright & Fold', percentage: 38.4, color: '#D4841A' },
  { name: 'Crisp Corner', percentage: 15.1, color: '#C0553F' },
]

const alerts = [
  { id: '1', type: 'error' as const, title: 'Unassigned Order #4521', message: 'Order has been waiting for 45 minutes', time: '2m ago' },
  { id: '2', type: 'warning' as const, title: 'Pickup Overdue', message: 'Driver Daniel is 15 mins late', time: '8m ago' },
  { id: '3', type: 'info' as const, title: 'Vendor Cancelled', message: 'Marina Fresh declined order #4518', time: '12m ago' },
]

const recentOrders = [
  { id: '#4523', client: 'Amara K.', vendor: 'Marina Fresh', status: 'in_wash', total: 45000 },
  { id: '#4522', client: 'Jabari M.', vendor: 'Bright & Fold', status: 'ready', total: 32000 },
  { id: '#4521', client: 'Nadia B.', vendor: 'Crisp Corner', status: 'pending', total: 28000 },
  { id: '#4520', client: 'Daniel O.', vendor: 'Marina Fresh', status: 'delivered', total: 55000 },
  { id: '#4519', client: 'Grace T.', vendor: 'Bright & Fold', status: 'out_for_delivery', total: 41000 },
]

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_wash: 'bg-blue-100 text-blue-700',
  ready: 'bg-green-100 text-green-700',
  out_for_delivery: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] || 'Admin'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[#D4841A] text-sm font-semibold uppercase tracking-wide">Overview</p>
          <h1 className="text-2xl font-bold text-[#2C3E50] mt-0.5">Welcome back, {firstName} 👋</h1>
          <p className="text-[#64748B] text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button className="self-start sm:self-auto px-4 py-2.5 bg-[#1A5C58] hover:bg-[#0F423F] text-white text-sm font-semibold rounded-xl shadow-sm transition-colors">
          + New Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div
            key={kpi.label}
            className="relative bg-white rounded-2xl border border-[#E2E8F0] p-5 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              className="absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-40 blur-2xl"
              style={{ backgroundColor: kpi.color }}
            />
            <div className="flex items-start justify-between relative">
              <div>
                <p className="text-sm text-[#64748B] font-medium">{kpi.label}</p>
                <p className="text-3xl font-bold text-[#2C3E50] mt-1.5">{kpi.value}</p>
              </div>
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: kpi.light }}
              >
                <kpi.icon size={22} style={{ color: kpi.color }} />
              </div>
            </div>
            {kpi.change && (
              <div className="flex items-center gap-1 mt-3">
                <span className="flex items-center gap-0.5 text-xs font-semibold text-green-600">
                  <ArrowUpRight size={13} />+{kpi.change}%
                </span>
                <span className="text-xs text-[#94A3B8]">vs yesterday</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-[#2C3E50]">Orders Per Hour</h2>
              <p className="text-xs text-[#94A3B8] mt-0.5">Peak activity window</p>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-[#1A5C58]/10 text-[#1A5C58] rounded-lg">Today</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ordersPerHour} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  cursor={{ fill: '#1A5C58', fillOpacity: 0.06 }}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                />
                <Bar dataKey="orders" radius={[6, 6, 0, 0]}>
                  {ordersPerHour.map((entry, index) => (
                    <Cell key={index} fill={entry.orders === 65 ? '#D4841A' : '#1A5C58'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#2C3E50]">Vendor Load</h2>
          <p className="text-xs text-[#94A3B8] mt-0.5 mb-5">Current capacity share</p>
          <div className="space-y-5">
            {vendorLoad.map((vendor) => (
              <div key={vendor.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#2C3E50]">{vendor.name}</span>
                  <span className="text-sm font-bold text-[#2C3E50]">{vendor.percentage}%</span>
                </div>
                <div className="h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${vendor.percentage}%`, backgroundColor: vendor.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-5 border-t border-[#E2E8F0]">
            <button className="w-full py-2.5 text-sm font-semibold text-[#1A5C58] bg-[#1A5C58]/10 hover:bg-[#1A5C58]/15 rounded-xl transition-colors">
              View All Vendors
            </button>
          </div>
        </div>
      </div>

      {/* Alerts + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2C3E50]">Urgent Alerts</h2>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#C0553F] bg-red-50 px-2.5 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C0553F] animate-pulse-dot"></span>
              Needs attention
            </span>
          </div>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  'p-3.5 rounded-xl border flex items-start gap-3 transition-colors hover:shadow-sm',
                  alert.type === 'error' && 'bg-red-50/70 border-red-200',
                  alert.type === 'warning' && 'bg-amber-50/70 border-amber-200',
                  alert.type === 'info' && 'bg-blue-50/70 border-blue-200'
                )}
              >
                <div
                  className={cn(
                    'mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                    alert.type === 'error' && 'bg-red-100 text-red-500',
                    alert.type === 'warning' && 'bg-amber-100 text-amber-500',
                    alert.type === 'info' && 'bg-blue-100 text-blue-500'
                  )}
                >
                  <AlertTriangle size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#2C3E50]">{alert.title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{alert.message}</p>
                </div>
                <span className="text-xs text-[#94A3B8] whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2C3E50]">Recent Orders</h2>
            <button className="text-sm text-[#1A5C58] hover:text-[#0F423F] font-semibold">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  <th className="text-left py-2.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Order</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Client</th>
                  <th className="text-left py-2.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Status</th>
                  <th className="text-right py-2.5 text-xs font-semibold text-[#94A3B8] uppercase tracking-wide">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[#E2E8F0]/60 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3 text-sm font-semibold text-[#1A5C58]">{order.id}</td>
                    <td className="py-3 text-sm text-[#64748B]">{order.client}</td>
                    <td className="py-3">
                      <span className={cn('px-2.5 py-1 text-xs font-semibold rounded-full', statusColors[order.status])}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-semibold text-[#2C3E50] text-right">{formatCurrency(order.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
