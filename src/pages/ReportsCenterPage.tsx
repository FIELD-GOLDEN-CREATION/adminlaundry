import { useNavigate } from 'react-router-dom'
import { BarChart3, ShoppingCart, CreditCard, Repeat, Wallet, FileText, Clock, Activity } from 'lucide-react'

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
    name: 'Vendor Payouts',
    reports: [
      { id: 'vendor-payout-summary', name: 'Payout Summary', description: 'Total payouts to vendors', available: false },
      { id: 'vendor-earnings', name: 'Vendor Earnings', description: 'Earnings by vendor', available: false },
      { id: 'payout-history', name: 'Payout History', description: 'Historical payout records', available: false },
      { id: 'pending-payouts', name: 'Pending Payouts', description: 'Awaiting payout processing', available: false },
    ],
  },
]

const categoryIcons: Record<string, typeof BarChart3> = {
  Operations: BarChart3, Orders: ShoppingCart, 'Payments & Refunds': CreditCard,
  'Vendor Payouts': Wallet, 'Recurring Pickups': Repeat, Taxes: FileText,
  'Drivers & Time Tracking': Clock, Activity: Activity,
}

export default function ReportsCenterPage() {
  const navigate = useNavigate()

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/reports" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Reports</a></li>
          <li className="sep">/</li>
          <li className="current">Reports Center</li>
        </ol>
      </div>

      {/* Search */}
      <div className="search-box" style={{ maxWidth: 320 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input placeholder="Search reports..." />
      </div>

      {/* Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {reportCategories.map((category) => {
          const Icon = categoryIcons[category.name] || BarChart3
          return (
            <div key={category.name}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Icon size={16} style={{ color: '#64748B' }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#2C3E50' }}>{category.name}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {category.reports.map((report) => (
                  <div
                    key={report.id}
                    className="panel"
                    style={{
                      padding: 16, cursor: report.available ? 'pointer' : 'default',
                      opacity: report.available ? 1 : 0.6,
                      transition: 'border-color 0.15s, background 0.15s',
                      ...(report.available ? {} : {}),
                    }}
                    onClick={() => report.available && navigate(`/reports/${report.id}`)}
                    onMouseEnter={(e) => {
                      if (report.available) {
                        e.currentTarget.style.borderColor = '#1A5C58'
                        e.currentTarget.style.background = '#F8FFFE'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#EDE7D9'
                      e.currentTarget.style.background = '#FFFFFF'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: '#2C3E50' }}>{report.name}</span>
                      {!report.available && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: '#64748B', background: '#F1F5F9',
                          padding: '3px 8px', borderRadius: 999,
                        }}>
                          Soon
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: '#64748B', margin: 0 }}>{report.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
