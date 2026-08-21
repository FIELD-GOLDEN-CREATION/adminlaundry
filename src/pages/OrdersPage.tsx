import { useState } from 'react'
import { RefreshCw, Filter, Download, Printer, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'

const orders = [
  { id: '#4523', client: 'Amara K.', avatar: 'A', vendor: 'Marina Fresh', status: 'in_wash', total: 45000, date: '2024-01-15' },
  { id: '#4522', client: 'Jabari M.', avatar: 'J', vendor: 'Bright & Fold', status: 'ready', total: 32000, date: '2024-01-15' },
  { id: '#4521', client: 'Nadia B.', avatar: 'N', vendor: 'Crisp Corner', status: 'pending', total: 28000, date: '2024-01-15' },
  { id: '#4520', client: 'Daniel O.', avatar: 'D', vendor: 'Marina Fresh', status: 'delivered', total: 55000, date: '2024-01-15' },
  { id: '#4519', client: 'Grace T.', avatar: 'G', vendor: 'Bright & Fold', status: 'out_for_delivery', total: 41000, date: '2024-01-15' },
  { id: '#4518', client: 'Ibrahim S.', avatar: 'I', vendor: 'Marina Fresh', status: 'cancelled', total: 38000, date: '2024-01-14' },
  { id: '#4517', client: 'Fatima H.', avatar: 'F', vendor: 'Crisp Corner', status: 'refunded', total: 29000, date: '2024-01-14' },
  { id: '#4516', client: 'Kofi A.', avatar: 'K', vendor: 'Bright & Fold', status: 'delivered', total: 52000, date: '2024-01-14' },
  { id: '#4515', client: 'Lila M.', avatar: 'L', vendor: 'Marina Fresh', status: 'in_wash', total: 36000, date: '2024-01-14' },
  { id: '#4514', client: 'Omar N.', avatar: 'O', vendor: 'Crisp Corner', status: 'ready', total: 44000, date: '2024-01-14' },
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

const stats = [
  { label: 'Orders Today', value: '128', color: '#1A5C58' },
  { label: 'Revenue Today', value: formatCurrency(24400000), color: '#D4841A' },
  { label: 'In Wash', value: '34', color: '#3B82F6' },
  { label: 'Unassigned', value: '8', color: '#C0553F' },
  { label: 'Out for Delivery', value: '21', color: '#8B5CF6' },
  { label: 'Refunded', value: '3', color: '#64748B' },
]

export default function OrdersPage() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus !== 'all' && order.status !== selectedStatus) return false
    if (selectedVendor !== 'all' && order.vendor !== selectedVendor) return false
    return true
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Orders"
        description="Manage and track all orders"
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-lg border border-[#E2E8F0] transition-colors">
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors',
                showFilters
                  ? 'bg-[#1A5C58] text-white border-[#1A5C58]'
                  : 'text-[#64748B] hover:text-[#2C3E50] hover:bg-white border-[#E2E8F0]'
              )}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-lg border border-[#E2E8F0] transition-colors">
              <Download size={16} />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-lg border border-[#E2E8F0] transition-colors">
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-[#E2E8F0] p-4 shadow-sm">
            <p className="text-xs text-[#64748B]">{stat.label}</p>
            <p className="text-lg font-bold mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_wash">In Wash</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-[#64748B] mb-1.5">Vendor</label>
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
              >
                <option value="all">All Vendors</option>
                <option value="Marina Fresh">Marina Fresh</option>
                <option value="Bright & Fold">Bright & Fold</option>
                <option value="Crisp Corner">Crisp Corner</option>
              </select>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">
                  <input type="checkbox" className="rounded border-[#E2E8F0]" />
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Client</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Vendor</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Status</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Total</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-[#E2E8F0]/50 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4">
                    <input type="checkbox" className="rounded border-[#E2E8F0]" />
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-[#2C3E50]">{order.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#1A5C58]/10 flex items-center justify-center">
                        <span className="text-xs font-medium text-[#1A5C58]">{order.avatar}</span>
                      </div>
                      <span className="text-sm text-[#2C3E50]">{order.client}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#64748B]">{order.vendor}</td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', statusColors[order.status])}>
                      {order.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#2C3E50] text-right">{formatCurrency(order.total)}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-sm text-[#1A5C58] hover:text-[#0F423F] font-medium">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#E2E8F0]">
          <p className="text-sm text-[#64748B]">
            Showing 1-10 of {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-[#64748B] hover:text-[#2C3E50] hover:bg-[#F1F5F9] rounded-lg transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="px-3 py-1.5 bg-[#1A5C58] text-white text-sm font-medium rounded-lg">1</button>
            <button className="px-3 py-1.5 text-[#64748B] hover:bg-[#F1F5F9] text-sm font-medium rounded-lg transition-colors">2</button>
            <button className="px-3 py-1.5 text-[#64748B] hover:bg-[#F1F5F9] text-sm font-medium rounded-lg transition-colors">3</button>
            <button className="p-2 text-[#64748B] hover:text-[#2C3E50] hover:bg-[#F1F5F9] rounded-lg transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
