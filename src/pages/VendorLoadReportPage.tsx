import { useState } from 'react'
import { Download, Printer } from 'lucide-react'

const vendorData = [
  { name: 'Marina Fresh', ordersToday: 52, queue: 12, status: 'heavy' },
  { name: 'Bright & Fold', ordersToday: 38, queue: 8, status: 'healthy' },
  { name: 'Crisp Corner', ordersToday: 15, queue: 3, status: 'idle' },
]

const statusConfig: Record<string, { label: string; bg: string; fg: string }> = {
  healthy: { label: 'Healthy', bg: '#DFF5ED', fg: '#1A7A5C' },
  heavy: { label: 'Heavy', bg: '#F3D5CE', fg: '#C0553F' },
  idle: { label: 'Idle', bg: '#F1F5F9', fg: '#64748B' },
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
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/reports" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Reports</a></li>
          <li className="sep">/</li>
          <li className="current">Vendor Load Report</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}>
            <Download size={14} /> Export
          </button>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 14,
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
        flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Date Range</label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              width: '100%', height: 36, borderRadius: 9, border: '1px solid #EDE7D9',
              padding: '4px 10px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <div style={{ flex: 1, minWidth: 150 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Vendor</label>
          <select
            value={selectedVendor}
            onChange={(e) => setSelectedVendor(e.target.value)}
            style={{
              width: '100%', height: 36, borderRadius: 9, border: '1px solid #EDE7D9',
              padding: '4px 10px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
              outline: 'none',
            }}
          >
            <option value="all">All Vendors</option>
            {vendorData.map((v) => <option key={v.name} value={v.name}>{v.name}</option>)}
          </select>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        <div className="panel" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#1A5C58' }}>{totalOrders}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>Total Orders Today</div>
        </div>
        <div className="panel" style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#D4841A' }}>{totalQueue}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B', marginTop: 4 }}>Total Queue</div>
        </div>
      </div>

      {/* Table */}
      <div className="data-table-card">
        <div className="dt-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="dt-title">Vendor Load</span>
            <span className="dt-sub">{filteredVendors.length} vendors</span>
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Vendor</th>
              <th style={{ textAlign: 'center' }}>Orders Today</th>
              <th style={{ textAlign: 'center' }}>Queue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((vendor) => {
              const sc = statusConfig[vendor.status]
              return (
                <tr key={vendor.name}>
                  <td style={{ fontWeight: 600, color: '#2C3E50' }}>{vendor.name}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#2C3E50' }}>{vendor.ordersToday}</td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#2C3E50' }}>{vendor.queue}</td>
                  <td>
                    <span className="status-pill" style={{ background: sc.bg, color: sc.fg }}>
                      {sc.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="dt-footer">Vendor load report</div>
      </div>
    </div>
  )
}
