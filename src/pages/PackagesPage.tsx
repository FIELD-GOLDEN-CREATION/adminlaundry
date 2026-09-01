import { useState, useEffect, useCallback } from 'react'
import { Package, Search, X, Loader2, AlertCircle, Trash2, ToggleLeft, ToggleRight, Eye, Tag, ShoppingBag, Check, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface PackageItem {
  id: number
  item_id: number
  item_name: string
  qty: number
  unit_price_tzs: string | number
  item?: { id: number; name: string; unit: string; default_price_tzs: string | number }
}

interface PackageInclusion {
  id: number
  label: string
}

interface PackageServiceTag {
  id: number
  tag: string
}

interface Shop {
  id: number
  name: string
  slug: string
}

interface PackageData {
  id: number
  shop_id: number
  name: string
  tagline: string | null
  kind: 'weight' | 'itemCount' | 'household' | 'subscription'
  price_tzs: string | number
  price_unit: string
  compare_at_tzs: string | number | null
  note: string | null
  tag: string | null
  is_active: boolean | number
  order_count: number
  created_at: string
  updated_at: string
  shop?: Shop
  items?: PackageItem[]
  inclusions?: PackageInclusion[]
  serviceTags?: PackageServiceTag[]
}

const kindLabels: Record<string, string> = {
  weight: 'By Weight',
  itemCount: 'Item Count',
  household: 'Household',
  subscription: 'Subscription',
}

const kindColors: Record<string, { bg: string; text: string }> = {
  weight: { bg: '#E8F2F1', text: '#1A5C58' },
  itemCount: { bg: '#E3EEFF', text: '#1F5ECC' },
  household: { bg: '#FDF3E3', text: '#D4841A' },
  subscription: { bg: '#F0EBFF', text: '#7C3AED' },
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<PackageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedKind, setSelectedKind] = useState('all')
  const [selectedPkg, setSelectedPkg] = useState<PackageData | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const loadPackages = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminApi.getPackages()
      const data = res.data.data
      setPackages(data?.data ?? data ?? [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load packages'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  const handleToggle = async (pkg: PackageData) => {
    try {
      setTogglingId(pkg.id)
      const res = await adminApi.togglePackage(pkg.id)
      const updated = res.data.data
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, ...updated } : p)))
      if (selectedPkg?.id === pkg.id) {
        setSelectedPkg((prev) => (prev ? { ...prev, ...updated } : null))
      }
    } catch {
      // ignore
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (pkg: PackageData) => {
    if (!confirm(`Delete package "${pkg.name}"?`)) return
    try {
      setDeletingId(pkg.id)
      await adminApi.deletePackage(pkg.id)
      setPackages((prev) => prev.filter((p) => p.id !== pkg.id))
      if (selectedPkg?.id === pkg.id) setSelectedPkg(null)
    } catch {
      // ignore
    } finally {
      setDeletingId(null)
    }
  }

  const kinds = [...new Set(packages.map((p) => p.kind))]
  const filtered = packages.filter((p) => {
    const q = searchQuery.toLowerCase()
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      (p.tagline ?? '').toLowerCase().includes(q) ||
      (p.shop?.name ?? '').toLowerCase().includes(q) ||
      (p.tag ?? '').toLowerCase().includes(q)
    const matchKind = selectedKind === 'all' || p.kind === selectedKind
    return matchSearch && matchKind
  })

  const totalPackages = packages.length
  const activePackages = packages.filter((p) => p.is_active).length
  const avgPrice = packages.length
    ? Math.round(packages.reduce((s, p) => s + Number(p.price_tzs), 0) / packages.length)
    : 0
  const totalOrders = packages.reduce((s, p) => s + (p.order_count ?? 0), 0)
  const cheapestPkg = [...packages].sort((a, b) => Number(a.price_tzs) - Number(b.price_tzs))[0]

  return (
    <div>
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Packages</li>
        </ol>
      </div>

      {loading && (
        <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: '#1A5C58', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>Loading packages...</p>
        </div>
      )}

      {error && (
        <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: '#C0553F', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#C0553F' }}>{error}</p>
          <button onClick={loadPackages} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 8, border: '1px solid #EDE7D9', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Hero overview */}
          <div className="hero" style={{ borderRadius: 20 }}>
            <div className="hero-top">
              <div>
                <p className="hero-eyebrow">Overview</p>
                <h1 className="hero-title">All Packages</h1>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginTop: 16 }}>
              <div className="hero-card">
                <div className="hc-label">Total Packages</div>
                <div className="hc-row"><span className="hc-value">{totalPackages}</span></div>
              </div>
              <div className="hero-card">
                <div className="hc-label">Active</div>
                <div className="hc-row">
                  <span className="hc-value">{activePackages}</span>
                  <span className="hc-delta pos">{totalPackages ? Math.round((activePackages / totalPackages) * 100) : 0}%</span>
                </div>
              </div>
              <div className="hero-card">
                <div className="hc-label">Total Orders</div>
                <div className="hc-row"><span className="hc-value">{totalOrders}</span></div>
              </div>
              <div className="hero-card">
                <div className="hc-label">Avg Price</div>
                <div className="hc-row"><span className="hc-value">{formatCurrency(avgPrice)}</span></div>
              </div>
            </div>
          </div>

          {/* Cheapest package banner */}
          {cheapestPkg && (
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
                <Package size={24} style={{ color: '#D4841A' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.6)' }}>
                  Most Affordable Package
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                  {cheapestPkg.name}
                  <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 10, color: '#D4841A' }}>
                    {formatCurrency(cheapestPkg.price_tzs)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.65)', marginTop: 2 }}>
                  {cheapestPkg.shop?.name ?? 'Unknown shop'} — {cheapestPkg.price_unit}
                </div>
              </div>
            </div>
          )}

          {/* Search + kind filter */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 14,
            boxShadow: '0 1px 2px rgba(15,23,34,0.05)', flexWrap: 'wrap',
          }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input placeholder="Search packages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setSelectedKind('all')}
                style={{
                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: selectedKind === 'all' ? '#FFFFFF' : '#64748B',
                  background: selectedKind === 'all' ? '#1A5C58' : '#FFFFFF',
                  border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                }}
              >All</button>
              {kinds.map((k) => (
                <button
                  key={k}
                  onClick={() => setSelectedKind(k)}
                  style={{
                    padding: '6px 12px', fontSize: 12, fontWeight: 600,
                    color: selectedKind === k ? '#FFFFFF' : (kindColors[k]?.text ?? '#64748B'),
                    background: selectedKind === k ? (kindColors[k]?.text ?? '#1A5C58') : '#FFFFFF',
                    border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                  }}
                >{kindLabels[k] ?? k}</button>
              ))}
            </div>
          </div>

          {/* Package cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
            {filtered.map((pkg) => {
              const isActive = !!pkg.is_active
              const kc = kindColors[pkg.kind] ?? { bg: '#F1F5F9', text: '#64748B' }
              const itemCount = pkg.items?.length ?? 0
              const hasCompare = pkg.compare_at_tzs && Number(pkg.compare_at_tzs) > Number(pkg.price_tzs)

              return (
                <div
                  key={pkg.id}
                  style={{
                    background: '#FFFFFF', border: '1px solid #EDE7D9',
                    borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                    position: 'relative',
                  }}
                  onClick={() => setSelectedPkg(pkg)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(15,23,34,0.10)'
                    e.currentTarget.style.borderColor = kc.text
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none'
                    e.currentTarget.style.borderColor = '#EDE7D9'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {/* Tag badge */}
                  {pkg.tag && (
                    <div style={{
                      position: 'absolute', top: 12, left: 12,
                      padding: '4px 10px', borderRadius: 999,
                      background: '#D4841A', color: '#FFFFFF',
                      fontSize: 10, fontWeight: 700, zIndex: 1,
                    }}>
                      {pkg.tag.toUpperCase()}
                    </div>
                  )}

                  {/* Inactive badge */}
                  {!isActive && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '4px 10px', borderRadius: 999,
                      background: '#FEE2E2', color: '#DC2626',
                      fontSize: 10, fontWeight: 700, zIndex: 1,
                    }}>
                      INACTIVE
                    </div>
                  )}

                  {/* Header */}
                  <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F5F0E8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: kc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: kc.text, flexShrink: 0,
                      }}>
                        <Package size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{pkg.name}</div>
                        <div style={{ fontSize: 11, color: kc.text, fontWeight: 600 }}>{kindLabels[pkg.kind] ?? pkg.kind}</div>
                      </div>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '14px 18px' }}>
                    {pkg.tagline && (
                      <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 10px', lineHeight: 1.5 }}>{pkg.tagline}</p>
                    )}

                    {/* Shop */}
                    <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 10 }}>
                      Shop: <span style={{ fontWeight: 600, color: '#64748B' }}>{pkg.shop?.name ?? 'N/A'}</span>
                    </div>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#2C3E50' }}>
                        {formatCurrency(pkg.price_tzs)}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{pkg.price_unit}</span>
                      {hasCompare && (
                        <span style={{ fontSize: 12, color: '#94A3B8', textDecoration: 'line-through' }}>
                          {formatCurrency(pkg.compare_at_tzs)}
                        </span>
                      )}
                    </div>

                    {/* Items count */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <ShoppingBag size={12} style={{ color: '#64748B' }} />
                      <span style={{ fontSize: 11, color: '#64748B' }}>
                        {itemCount} item{itemCount !== 1 ? 's' : ''} included
                      </span>
                    </div>

                    {/* Inclusions */}
                    {(pkg.inclusions?.length ?? 0) > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                        {pkg.inclusions!.slice(0, 3).map((inc) => (
                          <span key={inc.id} style={{
                            padding: '2px 8px', borderRadius: 999,
                            background: '#DFF5ED', color: '#1A7A5C',
                            fontSize: 10, fontWeight: 600,
                          }}>
                            <Check size={9} style={{ verticalAlign: 'middle', marginRight: 2 }} />{inc.label}
                          </span>
                        ))}
                        {(pkg.inclusions?.length ?? 0) > 3 && (
                          <span style={{ fontSize: 10, color: '#94A3B8', padding: '2px 4px' }}>
                            +{(pkg.inclusions?.length ?? 0) - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Status */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 10,
                      background: isActive ? '#DFF5ED' : '#FEE2E2',
                    }}>
                      {isActive ? <ToggleRight size={12} style={{ color: '#1A7A5C' }} /> : <ToggleLeft size={12} style={{ color: '#DC2626' }} />}
                      <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#1A7A5C' : '#DC2626' }}>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 'auto' }}>{pkg.order_count} orders</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
              <Search size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No packages found</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                {totalPackages === 0
                  ? 'Vendors haven\'t created any packages yet.'
                  : 'Try adjusting your search or filter'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Detail modal */}
      {selectedPkg && (
        <>
          <div
            onClick={() => setSelectedPkg(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,34,0.45)',
              zIndex: 100, backdropFilter: 'blur(4px)',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 20,
            width: '100%', maxWidth: 580, maxHeight: '90vh',
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
                  background: kindColors[selectedPkg.kind]?.bg ?? '#F1F5F9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: kindColors[selectedPkg.kind]?.text ?? '#64748B',
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50' }}>{selectedPkg.name}</div>
                  <div style={{ fontSize: 13, color: kindColors[selectedPkg.kind]?.text ?? '#64748B', fontWeight: 600 }}>
                    {kindLabels[selectedPkg.kind] ?? selectedPkg.kind}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPkg(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE7D9',
                  background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748B', flexShrink: 0,
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px 24px' }}>
              {/* Tags row */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: kindColors[selectedPkg.kind]?.bg ?? '#F1F5F9',
                  color: kindColors[selectedPkg.kind]?.text ?? '#64748B',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {kindLabels[selectedPkg.kind] ?? selectedPkg.kind}
                </span>
                <span style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: selectedPkg.is_active ? '#DFF5ED' : '#FEE2E2',
                  color: selectedPkg.is_active ? '#1A7A5C' : '#DC2626',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {selectedPkg.is_active ? 'Active' : 'Inactive'}
                </span>
                {selectedPkg.tag && (
                  <span style={{
                    padding: '5px 12px', borderRadius: 999,
                    background: '#FEF3C7', color: '#D4841A',
                    fontSize: 12, fontWeight: 700,
                  }}>
                    <Tag size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />{selectedPkg.tag}
                  </span>
                )}
              </div>

              {/* Tagline */}
              {selectedPkg.tagline && (
                <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 16px', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{selectedPkg.tagline}"
                </p>
              )}

              {/* Shop */}
              <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                Shop: <span style={{ fontWeight: 700, color: '#2C3E50' }}>{selectedPkg.shop?.name ?? 'N/A'}</span>
              </div>

              {/* Price card */}
              <div style={{
                padding: 16, borderRadius: 14,
                background: '#FAF7F1', border: '1px solid #EDE7D9',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#2C3E50' }}>
                    {formatCurrency(selectedPkg.price_tzs)}
                  </span>
                  <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>
                    {selectedPkg.price_unit}
                  </span>
                  {selectedPkg.compare_at_tzs && Number(selectedPkg.compare_at_tzs) > Number(selectedPkg.price_tzs) && (
                    <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through' }}>
                      {formatCurrency(selectedPkg.compare_at_tzs)}
                    </span>
                  )}
                </div>
                {selectedPkg.compare_at_tzs && Number(selectedPkg.compare_at_tzs) > Number(selectedPkg.price_tzs) && (
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1A7A5C', marginTop: 4 }}>
                    Save {formatCurrency(Number(selectedPkg.compare_at_tzs) - Number(selectedPkg.price_tzs))}
                  </div>
                )}
              </div>

              {/* Note */}
              {selectedPkg.note && (
                <div style={{
                  padding: 14, borderRadius: 14,
                  background: '#F0F9FF', border: '1px solid #BAE6FD',
                  marginBottom: 20, display: 'flex', gap: 10,
                }}>
                  <Info size={16} style={{ color: '#0284C7', flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 13, color: '#0369A1', margin: 0, lineHeight: 1.5 }}>{selectedPkg.note}</p>
                </div>
              )}

              {/* Items included */}
              {(selectedPkg.items?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ShoppingBag size={14} /> Items Included ({selectedPkg.items!.length})
                  </h3>
                  <div style={{
                    background: '#FAF7F1', border: '1px solid #EDE7D9',
                    borderRadius: 12, overflow: 'hidden',
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #EDE7D9' }}>
                          <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Item</th>
                          <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Qty</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Unit Price</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPkg.items!.map((item) => (
                          <tr key={item.id} style={{ borderBottom: '1px solid #F5F0E8' }}>
                            <td style={{ padding: '10px 14px', color: '#2C3E50', fontWeight: 600 }}>{item.item_name}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'center', color: '#64748B' }}>{item.qty}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B' }}>{formatCurrency(item.unit_price_tzs)}</td>
                            <td style={{ padding: '10px 14px', textAlign: 'right', color: '#2C3E50', fontWeight: 700 }}>
                              {formatCurrency(Number(item.unit_price_tzs) * item.qty)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Inclusions */}
              {(selectedPkg.inclusions?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Check size={14} /> What's Included
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedPkg.inclusions!.map((inc) => (
                      <span key={inc.id} style={{
                        padding: '6px 14px', borderRadius: 999,
                        background: '#DFF5ED', color: '#1A7A5C',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        <Check size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />{inc.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Service tags */}
              {(selectedPkg.serviceTags?.length ?? 0) > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Tag size={14} /> Service Tags
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedPkg.serviceTags!.map((st) => (
                      <span key={st.id} style={{
                        padding: '6px 14px', borderRadius: 999,
                        background: '#F0EBFF', color: '#7C3AED',
                        fontSize: 12, fontWeight: 600,
                      }}>
                        {st.tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stats grid */}
              <div style={{
                padding: 16, borderRadius: 14,
                background: '#FAF7F1', border: '1px solid #EDE7D9',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>{selectedPkg.order_count}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Total Orders</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>{selectedPkg.items?.length ?? 0}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Items</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>{selectedPkg.inclusions?.length ?? 0}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Inclusions</div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button
                  onClick={() => handleToggle(selectedPkg)}
                  disabled={togglingId === selectedPkg.id}
                  style={{
                    flex: 1, padding: '10px 16px', borderRadius: 10,
                    border: 'none', cursor: togglingId === selectedPkg.id ? 'wait' : 'pointer',
                    background: selectedPkg.is_active ? '#FEE2E2' : '#DFF5ED',
                    color: selectedPkg.is_active ? '#DC2626' : '#1A7A5C',
                    fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {selectedPkg.is_active ? <><ToggleLeft size={16} /> Deactivate</> : <><ToggleRight size={16} /> Activate</>}
                </button>
                <button
                  onClick={() => handleDelete(selectedPkg)}
                  disabled={deletingId === selectedPkg.id}
                  style={{
                    padding: '10px 16px', borderRadius: 10,
                    border: '1px solid #FEE2E2', cursor: deletingId === selectedPkg.id ? 'wait' : 'pointer',
                    background: '#FFFFFF', color: '#DC2626',
                    fontSize: 13, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
