import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Percent, Tag, Clock, Trash2, X, Search, Copy, CheckCheck,
  Loader2, AlertCircle, Eye, Users, TrendingUp, RotateCcw, ToggleLeft, ToggleRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/services/api'

interface PromoData {
  id: number
  shop_id: number | null
  code: string
  title: string
  description: string | null
  discount_value: string | number
  is_percentage: boolean
  applies_to: string | null
  audience: string | null
  min_spend_tzs: string | number | null
  max_redemptions: number | null
  current_redemptions: number
  starts_at: string | null
  expires_at: string | null
  is_active: boolean
  shop?: { id: number; name: string; slug: string } | null
  redemptions?: PromoRedemption[]
  created_at: string
}

interface PromoRedemption {
  id: number
  order_id: number
  customer_id: number
  discount_amount_tzs: string | number
  redeemed_at: string
  customer?: { id: number; name: string; email: string }
  order?: { id: number; order_number: string; total_tzs: string | number }
}

const audienceLabels: Record<string, string> = {
  allUsers: 'All Users',
  firstTimeCustomers: 'First-Time Customers',
  returningCustomers: 'Returning Customers',
}

export default function PromosPage() {
  const { user } = useAuth()
  const isStaff = user?.role === 'staff'
  const [promos, setPromos] = useState<PromoData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVendor, setFilterVendor] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [selectedPromo, setSelectedPromo] = useState<PromoData | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // Create form state
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDiscountValue, setNewDiscountValue] = useState('')
  const [newIsPercentage, setNewIsPercentage] = useState(true)
  const [newAudience, setNewAudience] = useState('allUsers')
  const [newMinSpend, setNewMinSpend] = useState('')
  const [newMaxRedemptions, setNewMaxRedemptions] = useState('')
  const [newExpiresAt, setNewExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)

  const loadPromos = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await adminApi.getPromos()
      const raw = res.data?.data
      setPromos(Array.isArray(raw) ? raw : [])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load promos'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadPromos() }, [loadPromos])

  const loadPromoDetail = async (promo: PromoData) => {
    setSelectedPromo(promo)
    if (!promo.redemptions) {
      try {
        setDetailLoading(true)
        const res = await adminApi.getPromo(promo.id)
        setSelectedPromo(res.data.data)
      } catch {
        // keep what we have
      } finally {
        setDetailLoading(false)
      }
    }
  }

  const vendors = [...new Set(promos.map((p) => p.shop?.name).filter(Boolean))] as string[]

  const filteredPromos = promos.filter((p) => {
    const name = p.shop?.name || ''
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVendor = filterVendor === 'all' || name === filterVendor
    const isActive = p.is_active
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'expired' && !isActive)
    return matchesSearch && matchesVendor && matchesStatus
  })

  const togglePromo = async (promo: PromoData) => {
    setPromos((prev) => prev.map((p) => p.id === promo.id ? { ...p, is_active: !p.is_active } : p))
    try {
      await adminApi.updatePromo(promo.id, { is_active: !promo.is_active })
    } catch {
      setPromos((prev) => prev.map((p) => p.id === promo.id ? { ...p, is_active: promo.is_active } : p))
    }
  }

  const deletePromo = async (promo: PromoData) => {
    if (!confirm(`Delete promo "${promo.title}"?`)) return
    setPromos((prev) => prev.filter((p) => p.id !== promo.id))
    if (selectedPromo?.id === promo.id) setSelectedPromo(null)
    try {
      await adminApi.deletePromo(promo.id)
    } catch {
      loadPromos()
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleCreatePromo = async () => {
    if (!newTitle || !newCode || !newDiscountValue) return
    setCreating(true)
    try {
      const res = await adminApi.createPromo({
        title: newTitle,
        code: newCode,
        description: newDescription || null,
        discount_value: Number(newDiscountValue),
        is_percentage: newIsPercentage,
        audience: newAudience,
        min_spend_tzs: Number(newMinSpend) || null,
        max_redemptions: Number(newMaxRedemptions) || null,
        expires_at: newExpiresAt || null,
      })
      if (res.data?.data) {
        setPromos((prev) => [res.data.data, ...prev])
      }
      setShowCreateModal(false)
      setNewTitle('')
      setNewCode('')
      setNewDescription('')
      setNewDiscountValue('')
      setNewIsPercentage(true)
      setNewAudience('allUsers')
      setNewMinSpend('')
      setNewMaxRedemptions('')
      setNewExpiresAt('')
    } catch (err) {
      console.error('Failed to create promo:', err)
    } finally {
      setCreating(false)
    }
  }

  const activeCount = promos.filter((p) => p.is_active).length
  const totalRedemptions = promos.reduce((s, p) => s + (p.current_redemptions ?? 0), 0)

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Promos</li>
        </ol>
        {!isStaff && (
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
              border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> Create Promo
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
          <Loader2 size={32} style={{ color: '#1A5C58', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>Loading promos...</p>
        </div>
      )}

      {error && (
        <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
          <AlertCircle size={32} style={{ color: '#C0553F', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#C0553F' }}>{error}</p>
          <button onClick={loadPromos} style={{ marginTop: 8, padding: '6px 16px', borderRadius: 8, border: '1px solid #EDE7D9', background: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* KPI tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
            {[
              { label: 'Total Promos', value: promos.length.toString() },
              { label: 'Active', value: activeCount.toString() },
              { label: 'Total Redemptions', value: totalRedemptions.toLocaleString() },
              { label: 'Vendors with Promos', value: vendors.length.toString() },
            ].map((kpi) => (
              <div key={kpi.label} className="panel" style={{ padding: 16, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1A5C58' }}>{kpi.value}</div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{kpi.label}</div>
              </div>
            ))}
          </div>

          {/* Search + filters */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 14,
            boxShadow: '0 1px 2px rgba(15,23,34,0.05)', flexWrap: 'wrap',
          }}>
            <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input placeholder="Search promos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => setFilterVendor('all')} style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                color: filterVendor === 'all' ? '#FFFFFF' : '#64748B',
                background: filterVendor === 'all' ? '#1A5C58' : '#FFFFFF',
                border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
              }}>All Shops</button>
              {vendors.map((v) => (
                <button key={v} onClick={() => setFilterVendor(v)} style={{
                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: filterVendor === v ? '#FFFFFF' : '#64748B',
                  background: filterVendor === v ? '#1A5C58' : '#FFFFFF',
                  border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                }}>{v}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', 'active', 'expired'].map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: filterStatus === s ? '#FFFFFF' : '#64748B',
                  background: filterStatus === s ? '#1A5C58' : '#FFFFFF',
                  border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                  textTransform: 'capitalize',
                }}>{s === 'all' ? 'All Status' : s}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="data-table-card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Promo</th>
                  <th>Shop</th>
                  <th>Audience</th>
                  <th>Redemptions</th>
                  <th>Discount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map((promo) => (
                  <tr
                    key={promo.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => loadPromoDetail(promo)}
                  >
                    <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, color: '#1A5C58' }}>
                      {promo.code}
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#2C3E50' }}>{promo.title}</div>
                      {promo.description && (
                        <div style={{ fontSize: 11, color: '#94A3B8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {promo.description}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 13, color: '#64748B' }}>{promo.shop?.name ?? 'Platform-wide'}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999,
                        background: '#F0F9FF', color: '#0369A1',
                        fontSize: 11, fontWeight: 600,
                      }}>
                        {audienceLabels[promo.audience ?? ''] ?? 'All Users'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: '#64748B' }}>
                      {promo.current_redemptions ?? 0} / {promo.max_redemptions ?? '∞'}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {Number(promo.discount_value)} {promo.is_percentage ? '%' : 'TZS'}
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 10px', borderRadius: 999,
                        background: promo.is_active ? '#DFF5ED' : '#FEE2E2',
                        color: promo.is_active ? '#1A7A5C' : '#DC2626',
                        fontSize: 12, fontWeight: 700,
                      }}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => togglePromo(promo)} title="Toggle" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', marginRight: 6 }}>
                        {promo.is_active ? <ToggleRight size={16} color="#1A7A5C" /> : <ToggleLeft size={16} color="#DC2626" />}
                      </button>
                      <button onClick={() => copyCode(promo.code)} title="Copy code" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', marginRight: 6 }}>
                        {copiedCode === promo.code ? <CheckCheck size={14} color="#1A7A5C" /> : <Copy size={14} />}
                      </button>
                      <button onClick={() => deletePromo(promo)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0553F' }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredPromos.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>
                    {promos.length === 0 ? 'No promos created yet' : 'No promos match your filters'}
                  </td></tr>
                )}
              </tbody>
            </table>
            <div className="dt-footer">
              Showing {filteredPromos.length} of {promos.length} promos
            </div>
          </div>
        </>
      )}

      {/* Detail modal */}
      {selectedPromo && (
        <>
          <div onClick={() => setSelectedPromo(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,34,0.45)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 20, width: '100%', maxWidth: 620,
            maxHeight: '90vh', overflowY: 'auto', zIndex: 101,
            boxShadow: '0 24px 64px rgba(15,23,34,0.18), 0 4px 16px rgba(15,23,34,0.08)',
          }}>
            {/* Header */}
            <div style={{
              position: 'sticky', top: 0, background: '#FFFFFF',
              padding: '20px 24px 16px', borderBottom: '1px solid #EDE7D9',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              borderRadius: '20px 20px 0 0', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#D4841A',
                }}>
                  <Tag size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50' }}>{selectedPromo.title}</div>
                  <div style={{ fontSize: 13, color: '#1A5C58', fontFamily: 'ui-monospace, monospace', fontWeight: 700 }}>
                    {selectedPromo.code}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedPromo(null)} style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE7D9',
                background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#64748B',
              }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px 24px 24px' }}>
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: 32 }}>
                  <Loader2 size={24} style={{ color: '#1A5C58', animation: 'spin 1s linear infinite' }} />
                  <p style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>Loading details...</p>
                </div>
              ) : (
                <>
                  {/* Tags */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                    <span style={{ padding: '5px 12px', borderRadius: 999, background: selectedPromo.is_active ? '#DFF5ED' : '#FEE2E2', color: selectedPromo.is_active ? '#1A7A5C' : '#DC2626', fontSize: 12, fontWeight: 700 }}>
                      {selectedPromo.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span style={{ padding: '5px 12px', borderRadius: 999, background: '#F0F9FF', color: '#0369A1', fontSize: 12, fontWeight: 700 }}>
                      {audienceLabels[selectedPromo.audience ?? ''] ?? 'All Users'}
                    </span>
                    {selectedPromo.applies_to && (
                      <span style={{ padding: '5px 12px', borderRadius: 999, background: '#F0EBFF', color: '#7C3AED', fontSize: 12, fontWeight: 700 }}>
                        {selectedPromo.applies_to}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {selectedPromo.description && (
                    <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 16px', lineHeight: 1.6 }}>{selectedPromo.description}</p>
                  )}

                  {/* Shop */}
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
                    Shop: <span style={{ fontWeight: 700, color: '#2C3E50' }}>{selectedPromo.shop?.name ?? 'Platform-wide'}</span>
                  </div>

                  {/* Discount card */}
                  <div style={{
                    padding: 16, borderRadius: 14, background: '#FAF7F1', border: '1px solid #EDE7D9', marginBottom: 20,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ fontSize: 32, fontWeight: 700, color: '#1A5C58' }}>
                        {Number(selectedPromo.discount_value)}{selectedPromo.is_percentage ? '%' : ''}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>
                          {selectedPromo.is_percentage ? 'Percentage Off' : 'Fixed Discount'}
                        </div>
                        {selectedPromo.min_spend_tzs && Number(selectedPromo.min_spend_tzs) > 0 && (
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                            Min. spend: {formatCurrency(selectedPromo.min_spend_tzs)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div style={{
                    padding: 16, borderRadius: 14, background: '#FAF7F1', border: '1px solid #EDE7D9',
                    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#1A5C58' }}>{selectedPromo.current_redemptions ?? 0}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Redeemed</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>{selectedPromo.max_redemptions ?? '∞'}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Max Allowed</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>
                        {selectedPromo.expires_at ? new Date(selectedPromo.expires_at).toLocaleDateString() : '∞'}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Expires</div>
                    </div>
                  </div>

                  {/* Redemptions list */}
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={14} /> Redemption History
                    </h3>
                    {(selectedPromo.redemptions?.length ?? 0) > 0 ? (
                      <div style={{ background: '#FAF7F1', border: '1px solid #EDE7D9', borderRadius: 12, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid #EDE7D9' }}>
                              <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Customer</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Discount</th>
                              <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#64748B', fontSize: 11 }}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedPromo.redemptions!.map((r) => (
                              <tr key={r.id} style={{ borderBottom: '1px solid #F5F0E8' }}>
                                <td style={{ padding: '10px 14px' }}>
                                  <div style={{ fontWeight: 600, color: '#2C3E50' }}>{r.customer?.name ?? `Customer #${r.customer_id}`}</div>
                                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{r.customer?.email}</div>
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#1A7A5C' }}>
                                  -{formatCurrency(r.discount_amount_tzs)}
                                </td>
                                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748B', fontSize: 12 }}>
                                  {new Date(r.redeemed_at).toLocaleDateString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: 24, textAlign: 'center', background: '#FAF7F1', border: '1px solid #EDE7D9', borderRadius: 12 }}>
                        <RotateCcw size={20} style={{ color: '#CBD5E1', margin: '0 auto 8px' }} />
                        <p style={{ fontSize: 13, color: '#94A3B8' }}>No redemptions yet</p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => { togglePromo(selectedPromo); setSelectedPromo({ ...selectedPromo, is_active: !selectedPromo.is_active }); }}
                      style={{
                        flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        background: selectedPromo.is_active ? '#FEE2E2' : '#DFF5ED',
                        color: selectedPromo.is_active ? '#DC2626' : '#1A7A5C',
                        fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      {selectedPromo.is_active ? <><ToggleLeft size={16} /> Deactivate</> : <><ToggleRight size={16} /> Activate</>}
                    </button>
                    <button
                      onClick={() => deletePromo(selectedPromo)}
                      style={{
                        padding: '10px 16px', borderRadius: 10, border: '1px solid #FEE2E2', cursor: 'pointer',
                        background: '#FFFFFF', color: '#DC2626', fontSize: 13, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* Create Promo Modal */}
      {showCreateModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowCreateModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480,
            maxHeight: '90vh', overflowY: 'auto', zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50' }}>Create Promo</div>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Title</label>
                <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. 20% Off First Order" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Code</label>
                  <input value={newCode} onChange={(e) => setNewCode(e.target.value.toUpperCase())} placeholder="e.g. SAVE20" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, fontFamily: 'ui-monospace, monospace', color: '#1A5C58', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Discount</label>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <input value={newDiscountValue} onChange={(e) => setNewDiscountValue(e.target.value)} placeholder="20" style={{ flex: 1, height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                    <button onClick={() => setNewIsPercentage(!newIsPercentage)} style={{ height: 38, padding: '0 10px', borderRadius: 9, border: '1px solid #EDE7D9', background: newIsPercentage ? '#E8F2F1' : '#FFFFFF', color: '#1A5C58', fontWeight: 700, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {newIsPercentage ? '%' : 'TZS'}
                    </button>
                  </div>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Description</label>
                <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={2} style={{ width: '100%', borderRadius: 9, border: '1px solid #EDE7D9', padding: '8px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Audience</label>
                  <select value={newAudience} onChange={(e) => setNewAudience(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }}>
                    <option value="allUsers">All Users</option>
                    <option value="firstTimeCustomers">First-Time Customers</option>
                    <option value="returningCustomers">Returning Customers</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Min Spend (TZS)</label>
                  <input value={newMinSpend} onChange={(e) => setNewMinSpend(e.target.value)} placeholder="0" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Max Redemptions</label>
                  <input value={newMaxRedemptions} onChange={(e) => setNewMaxRedemptions(e.target.value)} placeholder="100" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Expires At</label>
                  <input type="date" value={newExpiresAt} onChange={(e) => setNewExpiresAt(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowCreateModal(false)} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCreatePromo} disabled={!newTitle || !newCode || !newDiscountValue || creating} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer', opacity: (!newTitle || !newCode || !newDiscountValue || creating) ? 0.6 : 1 }}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
