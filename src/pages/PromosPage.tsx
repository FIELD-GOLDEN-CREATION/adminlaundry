import { useState, useEffect } from 'react'
import {
  Plus, Percent, Tag, Clock, Trash2, X, Search, Copy, CheckCheck,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { adminApi } from '@/services/api'

const vendorColors: Record<string, string> = {
  'Marina Fresh': '#1A5C58',
  'Bright & Fold': '#D4841A',
  'Crisp Corner': '#1F5ECC',
}

function generateCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${suffix}`
}

export default function PromosPage() {
  const { user } = useAuth()
  const isStaff = user?.role === 'staff'
  const [promos, setPromos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVendor, setFilterVendor] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // New promo form state
  const [newTitle, setNewTitle] = useState('')
  const [newCode, setNewCode] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newDiscountValue, setNewDiscountValue] = useState('')
  const [newIsPercentage, setNewIsPercentage] = useState(true)
  const [newTargetCategory, setNewTargetCategory] = useState('')
  const [newMinSpend, setNewMinSpend] = useState('')
  const [newMaxRedemptions, setNewMaxRedemptions] = useState('')
  const [newExpiresAt, setNewExpiresAt] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminApi.getPromos()
        setPromos(res.data.data || [])
      } catch (err) {
        console.error('Failed to load promos:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const vendors = [...new Set(promos.map((p) => p.vendor?.name || p.shop?.name).filter(Boolean))]

  const filteredPromos = promos.filter((p) => {
    const name = p.vendor?.name || p.shop?.name || ''
    const code = p.code || p.title || ''
    const title = p.title || ''
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVendor = filterVendor === 'all' || name === filterVendor
    const isActive = p.is_active ?? p.isActive ?? true
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && isActive) ||
      (filterStatus === 'expired' && !isActive)
    return matchesSearch && matchesVendor && matchesStatus
  })

  const togglePromo = async (id: string) => {
    setPromos((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !(p.is_active ?? p.isActive) } : p))
    try {
      const promo = promos.find((p) => p.id === id)
      await adminApi.updatePromo(id, { is_active: !(promo?.is_active ?? promo?.isActive ?? true) })
    } catch (err) {
      console.error('Failed to toggle promo:', err)
    }
  }

  const deletePromo = async (id: string) => {
    if (!confirm('Delete this promo?')) return
    setPromos((prev) => prev.filter((p) => p.id !== id))
    try {
      await adminApi.deletePromo(id)
    } catch (err) {
      console.error('Failed to delete promo:', err)
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
        description: newDescription,
        discount_value: Number(newDiscountValue),
        is_percentage: newIsPercentage,
        target_category: newTargetCategory || null,
        min_spend: Number(newMinSpend) || 0,
        max_redemptions: Number(newMaxRedemptions) || 100,
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
      setNewTargetCategory('')
      setNewMinSpend('')
      setNewMaxRedemptions('')
      setNewExpiresAt('')
    } catch (err) {
      console.error('Failed to create promo:', err)
    } finally {
      setCreating(false)
    }
  }

  const activeCount = promos.filter((p) => p.is_active ?? p.isActive ?? true).length
  const totalRedemptions = promos.reduce((s, p) => s + (p.current_redemptions ?? p.currentRedemptions ?? 0), 0)

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

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        {[
          { label: 'Total Promos', value: loading ? '...' : promos.length.toString() },
          { label: 'Active', value: loading ? '...' : activeCount.toString() },
          { label: 'Total Redemptions', value: loading ? '...' : totalRedemptions.toLocaleString() },
          { label: 'Vendors with Promos', value: loading ? '...' : vendors.length.toString() },
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
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
        flexWrap: 'wrap',
      }}>
        <div className="search-box" style={{ flex: 1, minWidth: 200, maxWidth: 320 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <input placeholder="Search promos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', ...vendors].map((v) => (
            <button
              key={v}
              onClick={() => setFilterVendor(v)}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                color: filterVendor === v ? '#FFFFFF' : '#64748B',
                background: filterVendor === v ? (vendorColors[v] || '#1A5C58') : '#FFFFFF',
                border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
              }}
            >
              {v === 'all' ? 'All Vendors' : v}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'active', 'expired'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              style={{
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                color: filterStatus === s ? '#FFFFFF' : '#64748B',
                background: filterStatus === s ? '#1A5C58' : '#FFFFFF',
                border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading promos...</div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ display: 'flex', alignItems: 'center', gap: 4 }}>Code <Percent size={12} /></th>
                  <th>Promo</th>
                  <th>Audience</th>
                  <th>Redemptions</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Discount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromos.map((promo) => {
                  const isActive = promo.is_active ?? promo.isActive ?? true
                  const vendorName = promo.vendor?.name || promo.shop?.name || '—'
                  return (
                    <tr key={promo.id}>
                      <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 700, color: '#1A5C58' }}>
                        {promo.code || promo.title}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#2C3E50' }}>{promo.title}</div>
                        <div style={{ fontSize: 12, color: '#64748B' }}>{vendorName}</div>
                      </td>
                      <td style={{ fontSize: 13, color: '#64748B' }}>{promo.audience || 'allUsers'}</td>
                      <td style={{ fontSize: 13, color: '#64748B' }}>
                        {promo.current_redemptions ?? promo.currentRedemptions ?? 0} / {promo.max_redemptions ?? promo.maxRedemptions ?? '∞'}
                      </td>
                      <td>
                        <span className={`status-pill`} style={{
                          background: isActive ? '#DFF5ED' : '#F3D5CE',
                          color: isActive ? '#1A7A5C' : '#C0553F',
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>
                        {promo.discount_value} {(promo.is_percentage ?? promo.isPercentage) ? '%' : 'TZS'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => togglePromo(promo.id)} title="Toggle status" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', marginRight: 8 }}>
                          {isActive ? '✓' : '○'}
                        </button>
                        <button onClick={() => copyCode(promo.code || promo.title)} title="Copy code" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B', marginRight: 8 }}>
                          {copiedCode === (promo.code || promo.title) ? <CheckCheck size={14} color="#1A7A5C" /> : <Copy size={14} />}
                        </button>
                        <button onClick={() => deletePromo(promo.id)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0553F' }}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredPromos.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>No promos found</td></tr>
                )}
              </tbody>
            </table>
            <div className="dt-footer">
              Showing {filteredPromos.length} of {promos.length} promos
            </div>
          </>
        )}
      </div>

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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Target Category</label>
                  <input value={newTargetCategory} onChange={(e) => setNewTargetCategory(e.target.value)} placeholder="Optional" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Min Spend (TZS)</label>
                  <input value={newMinSpend} onChange={(e) => setNewMinSpend(e.target.value)} placeholder="0" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Max Redemptions</label>
                  <input value={newMaxRedemptions} onChange={(e) => setNewMaxRedemptions(e.target.value)} placeholder="100" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Expires At</label>
                <input type="date" value={newExpiresAt} onChange={(e) => setNewExpiresAt(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
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
