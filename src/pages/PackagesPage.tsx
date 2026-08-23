import { useState } from 'react'
import { Package, TrendingUp, Star, Search, X, Check, Tag, Clock, ShoppingBag, Home, Calendar, Weight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Package as PackageType, PackageKind } from '@/types'

const kindConfig: Record<PackageKind, { label: string; icon: typeof Package; color: string }> = {
  weight: { label: 'Weight Package', icon: Weight, color: '#1A5C58' },
  itemCount: { label: 'Item Package', icon: ShoppingBag, color: '#1F5ECC' },
  household: { label: 'Household', icon: Home, color: '#D4841A' },
  subscription: { label: 'Subscription', icon: Calendar, color: '#7C3AED' },
}

const allPackages: PackageType[] = [
  {
    id: 'student-bag', name: 'The Student Bag', tagline: 'Up to 5kg of everyday wear',
    kind: 'weight', priceTzs: 34000, priceUnit: '/ bag',
    inclusions: ['Wash & fold', 'Fabric softener', '48h turnaround'],
    compareAtTzs: 45500, note: 'Max 5kg per bag. Delicates excluded.',
    tag: 'Popular', serviceTags: ['wash'], active: true,
    vendor: 'Marina Fresh', vendorId: 'v1', orderCount: 142,
  },
  {
    id: 'premium-care', name: 'Premium Care', tagline: 'Gentle wash with fabric softener & ironing',
    kind: 'itemCount', priceTzs: 15000, priceUnit: '/ pack',
    inclusions: ['Gentle wash', 'Fabric softener', 'Ironing', 'Stain treatment', '48h turnaround'],
    note: 'Up to 5 items per pack. Silk & wool handled separately.',
    serviceTags: ['wash', 'iron'], active: true,
    vendor: 'Marina Fresh', vendorId: 'v1', orderCount: 98,
  },
  {
    id: 'express-clean', name: 'Express Clean', tagline: 'Same-day wash and fold service',
    kind: 'weight', priceTzs: 12000, priceUnit: '/ bag',
    inclusions: ['Same-day service', 'Wash & fold', 'Express handling'],
    compareAtTzs: 16000, note: 'Max 3kg. Orders before 10AM only.',
    tag: 'Best value', serviceTags: ['wash'], active: true,
    vendor: 'Marina Fresh', vendorId: 'v1', orderCount: 76,
  },
  {
    id: 'delicate-plus', name: 'Delicate Plus', tagline: 'Special care for delicate fabrics',
    kind: 'itemCount', priceTzs: 20000, priceUnit: '/ piece',
    inclusions: ['Hand wash', 'Low-temp dry', 'Garment bag'],
    note: 'Silk, lace, cashmere only. No machine wash.',
    serviceTags: ['wash'], active: true,
    vendor: 'Marina Fresh', vendorId: 'v1', orderCount: 34,
  },
  {
    id: 'family-bag', name: 'The Family Bag', tagline: 'Full family laundry — up to 10kg',
    kind: 'weight', priceTzs: 72000, priceUnit: '/ bag',
    inclusions: ['Wash & fold', 'Fabric softener', 'Stain pre-treat', '48h turnaround'],
    compareAtTzs: 100100, note: 'Max 10kg. Mixed fabrics OK.',
    tag: 'Popular', serviceTags: ['wash'], active: true,
    vendor: 'Bright & Fold', vendorId: 'v2', orderCount: 118,
  },
  {
    id: 'office-wear', name: 'Office Wear', tagline: 'Shirts, trousers & formal wear',
    kind: 'itemCount', priceTzs: 14000, priceUnit: '/ pack',
    inclusions: ['Dry clean', 'Pressing', 'Garment bag', '48h turnaround'],
    note: 'Up to 4 pieces. Suits charged separately.',
    serviceTags: ['dry clean', 'iron'], active: true,
    vendor: 'Bright & Fold', vendorId: 'v2', orderCount: 91,
  },
  {
    id: 'quick-iron', name: 'Quick Iron', tagline: 'Press & iron only — no wash',
    kind: 'itemCount', priceTzs: 6000, priceUnit: '/ piece',
    inclusions: ['Steam press', 'Crease set', '24h turnaround'],
    note: 'Clean garments only. No stain treatment.',
    serviceTags: ['iron'], active: true,
    vendor: 'Bright & Fold', vendorId: 'v2', orderCount: 87,
  },
  {
    id: 'stain-rescue', name: 'Stain Rescue', tagline: 'Deep stain treatment & wash',
    kind: 'weight', priceTzs: 18000, priceUnit: '/ bag',
    inclusions: ['Stain pre-treat', 'Deep wash', 'Enzyme soak', '72h turnaround'],
    compareAtTzs: 24000, note: 'Max 5kg. Stubborn stains may need repeat.',
    serviceTags: ['wash'], active: true,
    vendor: 'Bright & Fold', vendorId: 'v2', orderCount: 64,
  },
  {
    id: 'bedding-refresh', name: 'King Bedding Refresh', tagline: 'Sheets, blankets & pillowcases',
    kind: 'household', priceTzs: 46000, priceUnit: '/ set',
    inclusions: ['Hot wash', 'Sanitise cycle', 'Fabric softener', '72h turnaround'],
    compareAtTzs: 54600, note: '1 fitted sheet, 1 flat sheet, 2 pillowcases, 1 blanket.',
    serviceTags: ['wash'], active: true,
    vendor: 'Crisp Corner', vendorId: 'v3', orderCount: 53,
  },
  {
    id: 'sneaker-clean', name: 'Sneaker Clean', tagline: 'Deep clean for sneakers & shoes',
    kind: 'itemCount', priceTzs: 10000, priceUnit: '/ pair',
    inclusions: ['Deep clean', 'Deodorise', 'Sole scrub', '48h turnaround'],
    note: 'Leather shoes not included. Max 2 pairs per order.',
    serviceTags: ['wash'], active: true,
    vendor: 'Crisp Corner', vendorId: 'v3', orderCount: 72,
  },
  {
    id: 'student-saver', name: 'Student Saver', tagline: 'Budget wash & fold for students',
    kind: 'weight', priceTzs: 5000, priceUnit: '/ bag',
    inclusions: ['Wash & fold', '72h turnaround'],
    compareAtTzs: 8000, note: 'Max 3kg. Student ID required. Mon–Fri only.',
    tag: 'Best value', serviceTags: ['wash'], active: true,
    vendor: 'Crisp Corner', vendorId: 'v3', orderCount: 104,
  },
  {
    id: 'curtain-wash', name: 'Curtain Wash', tagline: 'Curtains & drapes deep clean',
    kind: 'household', priceTzs: 30000, priceUnit: '/ set',
    inclusions: ['Gentle wash', 'Anti-shrink treat', 'Steam finish', '5-day turnaround'],
    note: 'Max 3 curtains per set. Rails not included.',
    serviceTags: ['wash'], active: false,
    vendor: 'Crisp Corner', vendorId: 'v3', orderCount: 28,
  },
]

const vendorColors: Record<string, string> = {
  'Marina Fresh': '#1A5C58',
  'Bright & Fold': '#D4841A',
  'Crisp Corner': '#1F5ECC',
}

const vendorBgs: Record<string, string> = {
  'Marina Fresh': '#E8F2F1',
  'Bright & Fold': '#FDF3E3',
  'Crisp Corner': '#E3EEFF',
}

const tagColors: Record<string, { bg: string; fg: string }> = {
  'Popular': { bg: '#E8F2F1', fg: '#1A5C58' },
  'Best value': { bg: '#FDF3E3', fg: '#D4841A' },
}

export default function PackagesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedVendor, setSelectedVendor] = useState('all')
  const [selectedPackage, setSelectedPackage] = useState<PackageType | null>(null)

  const vendors = [...new Set(allPackages.map((p) => p.vendor))]

  const filteredPackages = allPackages.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVendor = selectedVendor === 'all' || p.vendor === selectedVendor
    return matchesSearch && matchesVendor
  })

  const totalOrders = allPackages.reduce((sum, p) => sum + p.orderCount, 0)
  const bestPackage = [...allPackages].sort((a, b) => b.orderCount - a.orderCount)[0]
  const avgOrders = Math.round(totalOrders / allPackages.length)

  const vendorStats = vendors.map((vendor) => {
    const pkgs = allPackages.filter((p) => p.vendor === vendor)
    const orders = pkgs.reduce((sum, p) => sum + p.orderCount, 0)
    return { vendor, packageCount: pkgs.length, totalOrders: orders }
  })

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Packages</li>
        </ol>
      </div>

      {/* Hero KPIs */}
      <div className="hero" style={{ borderRadius: 20 }}>
        <div className="hero-top">
          <div>
            <p className="hero-eyebrow">Overview</p>
            <h1 className="hero-title">All Vendor Packages</h1>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginTop: 16 }}>
          <div className="hero-card">
            <div className="hc-label">Total Packages</div>
            <div className="hc-row">
              <span className="hc-value">{allPackages.length}</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="hc-label">Total Orders</div>
            <div className="hc-row">
              <span className="hc-value">{totalOrders.toLocaleString()}</span>
              <span className="hc-delta pos">+12%</span>
            </div>
          </div>
          <div className="hero-card">
            <div className="hc-label">Best Package</div>
            <div className="hc-row">
              <span className="hc-value" style={{ fontSize: 18 }}>{bestPackage.name}</span>
            </div>
            <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', marginTop: 4 }}>
              {bestPackage.vendor} — {bestPackage.orderCount} orders
            </div>
          </div>
          <div className="hero-card">
            <div className="hc-label">Avg Orders/Package</div>
            <div className="hc-row">
              <span className="hc-value">{avgOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vendor summary tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        {vendorStats.map((vs) => (
          <div key={vs.vendor} className="panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: vendorColors[vs.vendor] || '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Package size={18} style={{ color: '#FFFFFF' }} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{vs.vendor}</div>
                <div style={{ fontSize: 11, color: '#64748B' }}>{vs.packageCount} packages</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#2C3E50' }}>{vs.totalOrders}</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>orders</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 14,
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
        flexWrap: 'wrap',
      }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            placeholder="Search packages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setSelectedVendor('all')}
            style={{
              padding: '6px 12px', fontSize: 12, fontWeight: 600,
              color: selectedVendor === 'all' ? '#FFFFFF' : '#64748B',
              background: selectedVendor === 'all' ? '#1A5C58' : '#FFFFFF',
              border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
            }}
          >
            All Vendors
          </button>
          {vendors.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVendor(v)}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                color: selectedVendor === v ? '#FFFFFF' : '#64748B',
                background: selectedVendor === v ? vendorColors[v] : '#FFFFFF',
                border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Best Package banner */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
        background: 'linear-gradient(135deg, #1A5C58 0%, #0F423F 100%)',
        borderRadius: 16, color: '#F5F0E8',
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Star size={24} style={{ color: '#D4841A' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.6)' }}>
            Best Performing Package
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
            {bestPackage.name}
            <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 10, color: '#D4841A' }}>
              {bestPackage.orderCount} orders
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.65)', marginTop: 2 }}>
            by {bestPackage.vendor} — {formatCurrency(bestPackage.priceTzs)} {bestPackage.priceUnit}
          </div>
        </div>
        <div style={{
          padding: '8px 14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
          borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#8FD6C4',
        }}>
          <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          +18% vs last week
        </div>
      </div>

      {/* Package cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        {filteredPackages.map((pkg) => {
          const isBest = pkg.id === bestPackage.id
          const vc = vendorColors[pkg.vendor] || '#64748B'
          const vbg = vendorBgs[pkg.vendor] || '#F1F5F9'
          const popularityPct = Math.round((pkg.orderCount / bestPackage.orderCount) * 100)
          const kc = kindConfig[pkg.kind]
          const KindIcon = kc.icon
          const savings = pkg.compareAtTzs ? Math.round(((pkg.compareAtTzs - pkg.priceTzs) / pkg.compareAtTzs) * 100) : 0

          return (
            <div
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg)}
              style={{
                background: '#FFFFFF', border: isBest ? `2px solid ${vc}` : '1px solid #EDE7D9',
                borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,34,0.10)'
                e.currentTarget.style.borderColor = vc
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = isBest ? vc : '#EDE7D9'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {isBest && (
                <div style={{
                  position: 'absolute', top: 12, right: 12,
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '4px 10px', borderRadius: 999,
                  background: '#D4841A', color: '#FFFFFF',
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', zIndex: 1,
                }}>
                  <Star size={10} /> BEST
                </div>
              )}

              {!pkg.active && (
                <div style={{
                  position: 'absolute', top: 12, right: isBest ? 72 : 12,
                  padding: '4px 10px', borderRadius: 999,
                  background: '#F1F5F9', color: '#64748B',
                  fontSize: 10, fontWeight: 700, zIndex: 1,
                }}>
                  PAUSED
                </div>
              )}

              {/* Header */}
              <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F5F0E8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: vbg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: vc, flexShrink: 0,
                  }}>
                    <KindIcon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{pkg.name}</div>
                    <div style={{ fontSize: 11, color: vc, fontWeight: 600 }}>{pkg.vendor}</div>
                  </div>
                  {pkg.tag && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                      background: tagColors[pkg.tag]?.bg || '#F1F5F9',
                      color: tagColors[pkg.tag]?.fg || '#64748B',
                    }}>
                      {pkg.tag}
                    </span>
                  )}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '14px 18px' }}>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>
                  {pkg.tagline}
                </p>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#2C3E50' }}>
                    {formatCurrency(pkg.priceTzs)}
                  </span>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{pkg.priceUnit}</span>
                  {savings > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 999,
                      background: '#DFF5ED', color: '#1A7A5C',
                    }}>
                      Save {savings}%
                    </span>
                  )}
                </div>

                {/* Inclusions preview (max 3) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
                  {pkg.inclusions.slice(0, 3).map((inc) => (
                    <div key={inc} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
                      <Check size={12} style={{ color: vc, flexShrink: 0 }} />
                      <span>{inc}</span>
                    </div>
                  ))}
                  {pkg.inclusions.length > 3 && (
                    <span style={{ fontSize: 11, color: vc, fontWeight: 600, paddingLeft: 18 }}>
                      +{pkg.inclusions.length - 3} more
                    </span>
                  )}
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, paddingTop: 12, borderTop: '1px solid #F5F0E8' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Orders</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: vc, marginTop: 2 }}>{pkg.orderCount}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Type</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#2C3E50', marginTop: 4 }}>{kc.label}</div>
                  </div>
                </div>

                {/* Popularity bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>Popularity</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: vc }}>{popularityPct}%</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: '#EDE7D9', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${popularityPct}%`,
                      borderRadius: 999, background: vc,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredPackages.length === 0 && (
        <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
          <Search size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No packages found</p>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Try adjusting your search or filter</p>
        </div>
      )}

      {/* ===== Package Detail Modal ===== */}
      {selectedPackage && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedPackage(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,34,0.45)',
              zIndex: 100, backdropFilter: 'blur(4px)',
            }}
          />
          {/* Modal body */}
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 20,
            width: '100%', maxWidth: 520, maxHeight: '90vh',
            overflowY: 'auto', zIndex: 101,
            boxShadow: '0 24px 64px rgba(15,23,34,0.18), 0 4px 16px rgba(15,23,34,0.08)',
          }}>
            {/* Modal header */}
            <div style={{
              position: 'sticky', top: 0, background: '#FFFFFF',
              padding: '20px 24px 16px', borderBottom: '1px solid #EDE7D9',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              borderRadius: '20px 20px 0 0', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: vendorBgs[selectedPackage.vendor],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: vendorColors[selectedPackage.vendor],
                }}>
                  {(() => { const I = kindConfig[selectedPackage.kind].icon; return <I size={20} /> })()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50' }}>{selectedPackage.name}</div>
                  <div style={{ fontSize: 13, color: vendorColors[selectedPackage.vendor], fontWeight: 600 }}>
                    {selectedPackage.vendor}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE7D9',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748B', flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal content */}
            <div style={{ padding: '20px 24px 24px' }}>
              {/* Tagline */}
              <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px', lineHeight: 1.6 }}>
                {selectedPackage.tagline}
              </p>

              {/* Tags row */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '5px 12px', borderRadius: 999,
                  background: kindConfig[selectedPackage.kind].color + '14',
                  color: kindConfig[selectedPackage.kind].color,
                  fontSize: 12, fontWeight: 700,
                }}>
                  {(() => { const I = kindConfig[selectedPackage.kind].icon; return <I size={13} /> })()}
                  {kindConfig[selectedPackage.kind].label}
                </span>
                {selectedPackage.tag && (
                  <span style={{
                    padding: '5px 12px', borderRadius: 999,
                    background: tagColors[selectedPackage.tag]?.bg || '#F1F5F9',
                    color: tagColors[selectedPackage.tag]?.fg || '#64748B',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    {selectedPackage.tag}
                  </span>
                )}
                <span style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: selectedPackage.active ? '#DFF5ED' : '#F1F5F9',
                  color: selectedPackage.active ? '#1A7A5C' : '#64748B',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {selectedPackage.active ? 'Active' : 'Paused'}
                </span>
              </div>

              {/* Price block */}
              <div style={{
                padding: 16, borderRadius: 14,
                background: '#FAF7F1', border: '1px solid #EDE7D9',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#2C3E50' }}>
                    {formatCurrency(selectedPackage.priceTzs)}
                  </span>
                  <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>
                    {selectedPackage.priceUnit}
                  </span>
                </div>
                {selectedPackage.compareAtTzs && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                    <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through' }}>
                      {formatCurrency(selectedPackage.compareAtTzs)}
                    </span>
                    <span style={{
                      fontSize: 12, fontWeight: 800, padding: '3px 8px', borderRadius: 999,
                      background: '#DFF5ED', color: '#1A7A5C',
                    }}>
                      Save {Math.round(((selectedPackage.compareAtTzs - selectedPackage.priceTzs) / selectedPackage.compareAtTzs) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Inclusions */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  What's included
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedPackage.inclusions.map((inc) => (
                    <div key={inc} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 10,
                      background: '#F8FFFE', border: '1px solid #E8F2F1',
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: vendorColors[selectedPackage.vendor] + '18',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: vendorColors[selectedPackage.vendor], flexShrink: 0,
                      }}>
                        <Check size={12} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Service tags */}
              {selectedPackage.serviceTags.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                    Service tags
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {selectedPackage.serviceTags.map((tag) => (
                      <span key={tag} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', borderRadius: 999,
                        background: '#F1F5F9', color: '#64748B',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Fine print */}
              {selectedPackage.note && (
                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: '#FFF9EF', border: '1px solid #FDF3E3',
                  display: 'flex', gap: 8,
                }}>
                  <Clock size={14} style={{ color: '#D4841A', flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#D4841A', marginBottom: 2 }}>Fine print</div>
                    <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{selectedPackage.note}</div>
                  </div>
                </div>
              )}

              {/* Order stats */}
              <div style={{
                marginTop: 20, padding: 16, borderRadius: 14,
                background: '#FAF7F1', border: '1px solid #EDE7D9',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: vendorColors[selectedPackage.vendor] }}>
                    {selectedPackage.orderCount}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Total Orders</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>
                    {Math.round((selectedPackage.orderCount / bestPackage.orderCount) * 100)}%
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>vs Best</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>
                    {selectedPackage.inclusions.length}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Inclusions</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
