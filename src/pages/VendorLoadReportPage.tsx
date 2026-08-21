import { useState } from 'react'
import { Download, Printer, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'

const vendorData = [
  { name: 'Marina Fresh', ordersToday: 52, queue: 12, status: 'heavy' },
  { name: 'Bright & Fold', ordersToday: 38, queue: 8, status: 'healthy' },
  { name: 'Crisp Corner', ordersToday: 15, queue: 3, status: 'idle' },
]

const statusConfig: Record<string, { label: string; color: string }> = {
  healthy: { label: 'Healthy', color: 'bg-green-100 text-green-700' },
  heavy: { label: 'Heavy', color: 'bg-amber-100 text-amber-700' },
  idle: { label: 'Idle', color: 'bg-gray-100 text-gray-700' },
}

export default function VendorLoadReportPage() {
  const [dateRange, setDateRange] = useState('today')
  const [selectedVendor, setSelectedVendor] = useState('all')

  const filteredVendors = selectedVendor === 'all'
    ? vendorData
    : vendorData.filter((v) => v.name === selectedVendor)

  const totalOrders = filteredVendors.reduce((sum, v) => sum + v.ordersToday, 0)
  const totalQueue = filteredVendors.reduce((sum, v) => sum + v.queue, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reports"
        title="Vendor Load Report"
        description="Current vendor capacity and queue status"
        backTo="/reports"
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-lg border border-[#E2E8F0] transition-colors">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 text-sm text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-lg border border-[#E2E8F0] transition-colors">
              <Printer size={16} />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        }
      />

      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-[#64748B] mb-1.5">Vendor</label>
            <select
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
            >
              <option value="all">All Vendors</option>
              {vendorData.map((v) => (
                <option key={v.name} value={v.name}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="pt-5">
            <button className="px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-lg hover:bg-[#0F423F] transition-colors">
              Run Report
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Vendor</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Orders Today</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Queue</th>
                <th className="text-center py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.name} className="border-b border-[#E2E8F0]/50 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4 text-sm font-medium text-[#2C3E50]">{vendor.name}</td>
                  <td className="py-3 px-4 text-sm text-[#2C3E50] text-center">{vendor.ordersToday}</td>
                  <td className="py-3 px-4 text-sm text-[#2C3E50] text-center">{vendor.queue}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full', statusConfig[vendor.status].color)}>
                      {statusConfig[vendor.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-[#F8FAFC] border-t border-[#E2E8F0] font-medium">
                <td className="py-3 px-4 text-sm text-[#2C3E50]">Total</td>
                <td className="py-3 px-4 text-sm text-[#2C3E50] text-center">{totalOrders}</td>
                <td className="py-3 px-4 text-sm text-[#2C3E50] text-center">{totalQueue}</td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
