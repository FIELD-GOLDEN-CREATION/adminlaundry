import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, BarChart3, ShoppingCart, CreditCard, Repeat, Wallet, FileText, Clock, Activity } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'

const reportCategories = [
  {
    name: 'Operations',
    reports: [
      { id: 'vendor-load', name: 'Vendor Load', description: 'Current vendor capacity and queue status', available: true },
      { id: 'driver-assignment', name: 'Driver Assignment', description: 'Driver availability and assignment rates', available: false },
      { id: 'peak-hours', name: 'Peak Hours', description: 'Order volume by hour of day', available: false },
    ],
  },
  {
    name: 'Orders',
    reports: [
      { id: 'order-summary', name: 'Order Summary', description: 'Overview of all orders by status', available: false },
      { id: 'order-trends', name: 'Order Trends', description: 'Order volume trends over time', available: false },
      { id: 'cancellation-rate', name: 'Cancellation Rate', description: 'Cancelled orders analysis', available: false },
      { id: 'avg-processing', name: 'Average Processing Time', description: 'Mean time from order to delivery', available: false },
      { id: 'order-value', name: 'Order Value Distribution', description: 'Breakdown of order values', available: false },
      { id: 'repeat-customers', name: 'Repeat Customers', description: 'Customer retention metrics', available: false },
    ],
  },
  {
    name: 'Payments & Refunds',
    reports: [
      { id: 'revenue', name: 'Revenue Report', description: 'Total revenue and breakdown', available: false },
      { id: 'refund-analysis', name: 'Refund Analysis', description: 'Refund reasons and trends', available: false },
      { id: 'payment-methods', name: 'Payment Methods', description: 'Payment method distribution', available: false },
    ],
  },
  {
    name: 'Recurring Pickups',
    reports: [
      { id: 'recurring-schedule', name: 'Recurring Schedule', description: 'Scheduled recurring pickups', available: false },
    ],
  },
  {
    name: 'Vendor Payouts',
    reports: [
      { id: 'vendor-payout-summary', name: 'Payout Summary', description: 'Total payouts to vendors', available: false },
      { id: 'vendor-earnings', name: 'Vendor Earnings', description: 'Earnings by vendor', available: false },
      { id: 'payout-history', name: 'Payout History', description: 'Historical payout records', available: false },
      { id: 'pending-payouts', name: 'Pending Payouts', description: 'Awaiting payout processing', available: false },
      { id: 'payout-schedule', name: 'Payout Schedule', description: 'Upcoming payout dates', available: false },
    ],
  },
  {
    name: 'Taxes',
    reports: [
      { id: 'tax-summary', name: 'Tax Summary', description: 'Tax collected and remitted', available: false },
    ],
  },
  {
    name: 'Drivers & Time Tracking',
    reports: [
      { id: 'driver-performance', name: 'Driver Performance', description: 'Individual driver metrics', available: false },
      { id: 'delivery-times', name: 'Delivery Times', description: 'Average delivery time by area', available: false },
      { id: 'driver-earnings', name: 'Driver Earnings', description: 'Earnings by driver', available: false },
      { id: 'time-tracking', name: 'Time Tracking', description: 'Driver hours and shifts', available: false },
    ],
  },
  {
    name: 'Activity',
    reports: [
      { id: 'admin-activity', name: 'Admin Activity', description: 'Admin actions and changes', available: false },
      { id: 'user-activity', name: 'User Activity', description: 'User engagement metrics', available: false },
      { id: 'system-logs', name: 'System Logs', description: 'System event logs', available: false },
      { id: 'error-logs', name: 'Error Logs', description: 'Error and exception logs', available: false },
      { id: 'audit-trail', name: 'Audit Trail', description: 'Complete audit trail', available: false },
    ],
  },
]

const categoryIcons: Record<string, typeof BarChart3> = {
  Operations: BarChart3,
  Orders: ShoppingCart,
  'Payments & Refunds': CreditCard,
  'Recurring Pickups': Repeat,
  'Vendor Payouts': Wallet,
  Taxes: FileText,
  'Drivers & Time Tracking': Clock,
  Activity: Activity,
}

export default function ReportsCenterPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const filteredCategories = reportCategories
    .map((category) => ({
      ...category,
      reports: category.reports.filter(
        (report) =>
          report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.reports.length > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Reports Center"
        description="Browse and access all available reports"
      />

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Search reports..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20 focus:border-[#1A5C58]"
        />
      </div>

      <div className="space-y-8">
        {filteredCategories.map((category) => {
          const IconComponent = categoryIcons[category.name] || FileText
          return (
            <div key={category.name}>
              <div className="flex items-center gap-2 mb-4">
                <IconComponent size={20} className="text-[#1A5C58]" />
                <h2 className="text-lg font-semibold text-[#2C3E50]">{category.name}</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.reports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => report.available && navigate(`/reports/${report.id}`)}
                    disabled={!report.available}
                    className={`text-left p-4 rounded-xl border transition-colors ${
                      report.available
                        ? 'bg-white border-[#E2E8F0] hover:border-[#1A5C58] hover:shadow-sm cursor-pointer'
                        : 'bg-[#F8FAFC] border-[#E2E8F0] opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <p className="text-sm font-medium text-[#2C3E50]">{report.name}</p>
                    <p className="text-xs text-[#64748B] mt-1">{report.description}</p>
                    {!report.available && (
                      <p className="text-xs text-[#94A3B8] mt-2">Coming soon</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
