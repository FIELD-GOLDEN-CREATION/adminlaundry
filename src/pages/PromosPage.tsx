import { useState } from 'react'
import {
  Plus, Percent, Tag, Clock, Trash2, X, Search, Copy, CheckCheck,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface Promo {
  id: string
  code: string
  title: string
  description: string
  discountValue: number
  isPercentage: boolean
  appliesTo: string
  targetCategory?: string
  targetItem?: string
  audience: string
  minSpend: number
  maxRedemptions: number
  currentRedemptions: number
  isActive: boolean
  expiresAt: string
  vendorName: string
}

const allPromos: Promo[] = [
  { id: 'p1', code: 'MARINA20', title: '20% Off First Order', description: 'Get 20% off your first laundry order at Marina Fresh', discountValue: 20, isPercentage: true, appliesTo: 'entireOrder', audience: 'firstTimeCustomers', minSpend: 10000, maxRedemptions: 100, currentRedemptions: 43, isActive: true, expiresAt: '2026-03-31', vendorName: 'Marina Fresh' },
  { id: 'p2', code: 'IRON1000', title: 'TZS 1000 Off Ironing', description: 'Get TZS 1000 off all ironing services', discountValue: 1000, isPercentage: false, appliesTo: 'specificCategory', targetCategory: 'Iron', audience: 'allUsers', minSpend: 5000, maxRedemptions: 200, currentRedemptions: 87, isActive: true, expiresAt: '2026-02-28', vendorName: 'Marina Fresh' },
  { id: 'p3', code: 'BRIGHT30', title: '30% Off Bedding', description: 'Save 30% on all bedding and household items', discountValue: 30, isPercentage: true, appliesTo: 'specificCategory', targetCategory: 'Bedding', audience: 'allUsers', minSpend: 15000, maxRedemptions: 150, currentRedemptions: 62, isActive: true, expiresAt: '2026-04-15', vendorName: 'Bright & Fold' },
  { id: 'p4', code: 'FAMILY5K', title: 'TZS 5000 Off Family Bundle', description: 'TZS 5000 off the Family Bundle package', discountValue: 5000, isPercentage: false, appliesTo: 'specificItem', targetItem: 'Family Bundle', audience: 'returningCustomers', minSpend: 25000, maxRedemptions: 80, currentRedemptions: 31, isActive: true, expiresAt: '2026-05-01', vendorName: 'Bright & Fold' },
  { id: 'p5', code: 'CRISP15', title: '15% Off Sneaker Clean', description: 'Save 15% on professional sneaker cleaning', discountValue: 15, isPercentage: true, appliesTo: 'specificItem', targetItem: 'Sneaker Clean', audience: 'allUsers', minSpend: 8000, maxRedemptions: 100, currentRedemptions: 48, isActive: true, expiresAt: '2026-06-30', vendorName: 'Crisp Corner' },
  { id: 'p6', code: 'VIP50', title: '50% VIP Discount', description: 'Half price for our most loyal returning customers', discountValue: 50, isPercentage: true, appliesTo: 'entireOrder', audience: 'returningCustomers', minSpend: 20000, maxRedemptions: 50, currentRedemptions: 50, isActive: false, expiresAt: '2025-12-31', vendorName: 'Marina Fresh' },
  { id: 'p7', code: 'STUDENT10', title: '10% Student Discount', description: 'Special discount for students with valid ID', discountValue: 10, isPercentage: true, appliesTo: 'entireOrder', audience: 'allUsers', minSpend: 3000, maxRedemptions: 300, currentRedemptions: 124, isActive: true, expiresAt: '2026-12-31', vendorName: 'Crisp Corner' },
]

const vendorColors: Record<string, string> = {
  'Marina Fresh': '#1A5C58',
  'Bright & Fold': '#D4841A',
  'Crisp Corner': '#1F5ECC',
}

const audienceLabels: Record<string, string> = {
  allUsers: 'All Users',
  firstTimeCustomers: 'First-time',
  returningCustomers: 'Returning',
}

function generateCode(name: string): string {
  const prefix = name.replace(/[^a-zA-Z]/g, '').substring(0, 6).toUpperCase()
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${suffix}`
}

export default function PromosPage() {
  const { user } = useAuth()
  const isStaff = user?.role === 'staff'
  const [promos, setPromos] = useState(allPromos)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterVendor, setFilterVendor] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const vendors = [...new Set(promos.map((p) => p.vendorName))]

  const filteredPromos = promos.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.vendorName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesVendor = filterVendor === 'all' || p.vendorName === filterVendor
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && p.isActive) ||
      (filterStatus === 'expired' && !p.isActive)
    return matchesSearch && matchesVendor && matchesStatus
  })

  const togglePromo = (id: string) => {
    setPromos((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !p.isActive } : p))
  }

  const deletePromo = (id: string) => {
    if (!confirm('Delete this promo?')) return
    setPromos((prev) => prev.filter((p) => p.id !== id))
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const activeCount = promos.filter((p) => p.isActive).length
  const totalRedemptions = promos.reduce((s, p) => s + p.currentRedemptions, 0)

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

      {/* Promo cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        {filteredPromos.map((promo) => {
          const vc = vendorColors[promo.vendorName] || '#1A5C58'
          const redeemPct = promo.maxRedemptions > 0
            ? Math.round((promo.currentRedemptions / promo.maxRedemptions) * 100)
            : 0
          const isExpired = new Date(promo.expiresAt) < new Date()
          const daysLeft = Math.max(0, Math.ceil((new Date(promo.expiresAt).getTime() - Date.now()) / 86400000))

          return (
            <div key={promo.id} className="panel" style={{
              padding: 0, overflow: 'hidden',
              opacity: promo.isActive ? 1 : 0.55,
            }}>
              {/* Discount header */}
              <div style={{
                padding: '16px 18px',
                background: promo.isActive
                  ? `linear-gradient(135deg, ${vc} 0%, ${vc}DD 100%)`
                  : '#F1F5F9',
                color: promo.isActive ? '#FFFFFF' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {promo.isPercentage ? <Percent size={18} /> : <Tag size={18} />}
                  <span style={{ fontSize: 20, fontWeight: 800 }}>
                    {promo.isPercentage ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.8 }}>off</span>
                </div>
                {/* Toggle */}
                <button
                  onClick={() => togglePromo(promo.id)}
                  style={{
                    width: 40, height: 22, borderRadius: 999,
                    background: promo.isActive ? 'rgba(255,255,255,0.3)' : '#D7D2C6',
                    border: 'none', padding: 2, cursor: 'pointer',
                    display: 'flex', alignItems: 'center',
                    justifyContent: promo.isActive ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: 999,
                    background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '14px 18px' }}>
                {/* Vendor + code */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: vc }}>{promo.vendorName}</span>
                  <button
                    onClick={() => copyCode(promo.code)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 10px', borderRadius: 6,
                      background: '#FAF7F1', border: '1px solid #EDE7D9',
                      cursor: 'pointer', fontSize: 12, fontWeight: 700,
                      fontFamily: 'monospace', color: '#2C3E50', letterSpacing: '0.05em',
                    }}
                  >
                    {promo.code}
                    {copiedCode === promo.code
                      ? <CheckCheck size={12} style={{ color: '#1A7A5C' }} />
                      : <Copy size={12} style={{ color: '#64748B' }} />
                    }
                  </button>
                </div>

                {/* Title + description */}
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50', marginBottom: 4 }}>{promo.title}</div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>{promo.description}</p>

                {/* Meta badges */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    background: '#E8F2F1', color: '#1A5C58',
                  }}>
                    {promo.appliesTo === 'entireOrder' ? 'Entire Order' : promo.appliesTo === 'specificCategory' ? `Category: ${promo.targetCategory}` : `Item: ${promo.targetItem}`}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                    background: '#FDF3E3', color: '#D4841A',
                  }}>
                    {audienceLabels[promo.audience] || promo.audience}
                  </span>
                  {promo.minSpend > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                      background: '#F1F5F9', color: '#64748B',
                    }}>
                      Min {formatCurrency(promo.minSpend)}
                    </span>
                  )}
                </div>

                {/* Redemption bar */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>Redemptions</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: vc }}>
                      {promo.currentRedemptions}/{promo.maxRedemptions}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: '#EDE7D9', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${redeemPct}%`,
                      borderRadius: 999, background: redeemPct >= 90 ? '#C0553F' : vc,
                    }} />
                  </div>
                </div>

                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid #F5F0E8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: isExpired ? '#C0553F' : '#64748B' }}>
                    <Clock size={13} />
                    {isExpired ? 'Expired' : daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'}
                  </div>
                  {!isStaff && (
                    <button
                      onClick={() => deletePromo(promo.id)}
                      style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: '#C0553F', padding: 4, borderRadius: 4,
                      }}
                      title="Delete promo"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredPromos.length === 0 && (
        <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
          <Search size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No promos found</p>
          <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Try adjusting your search or create a new promo</p>
        </div>
      )}

      {/* ===== Create Promo Modal ===== */}
      {showCreateModal && <CreatePromoModal
        onClose={() => setShowCreateModal(false)}
        onCreate={(promo) => {
          setPromos((prev) => [promo, ...prev])
          setShowCreateModal(false)
        }}
        vendors={vendors}
      />}
    </div>
  )
}

function CreatePromoModal({ onClose, onCreate, vendors }: {
  onClose: () => void
  onCreate: (promo: Promo) => void
  vendors: string[]
}) {
  const [promoName, setPromoName] = useState('')
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage')
  const [discountValue, setDiscountValue] = useState('')
  const [appliesTo, setAppliesTo] = useState('entireOrder')
  const [targetCategory, setTargetCategory] = useState('')
  const [targetItem, setTargetItem] = useState('')
  const [minSpend, setMinSpend] = useState('')
  const [audience, setAudience] = useState('allUsers')
  const [maxRedemptions, setMaxRedemptions] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedVendor, setSelectedVendor] = useState(vendors[0] || '')

  const canSubmit = promoName.trim() && discountValue.trim()

  const handleSubmit = () => {
    if (!canSubmit) return
    const promo: Promo = {
      id: `p${Date.now()}`,
      code: generateCode(promoName),
      title: promoName,
      description: promoName,
      discountValue: parseFloat(discountValue),
      isPercentage: discountType === 'percentage',
      appliesTo,
      targetCategory: appliesTo === 'specificCategory' ? targetCategory : undefined,
      targetItem: appliesTo === 'specificItem' ? targetItem : undefined,
      audience,
      minSpend: minSpend ? parseFloat(minSpend) : 0,
      maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : 999,
      currentRedemptions: 0,
      isActive: true,
      expiresAt: endDate || '2026-12-31',
      vendorName: selectedVendor,
    }
    onCreate(promo)
  }

  const chipStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', fontSize: 12, fontWeight: 600,
    color: active ? '#FFFFFF' : '#64748B',
    background: active ? '#1A5C58' : '#FFFFFF',
    border: `1px solid ${active ? '#1A5C58' : '#EDE7D9'}`,
    borderRadius: 8, cursor: 'pointer',
  })

  const inputStyle: React.CSSProperties = {
    width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
    padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: '#64748B',
    textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, display: 'block',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,34,0.45)', zIndex: 100, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#FFFFFF', borderRadius: 20,
        width: '100%', maxWidth: 560, maxHeight: '90vh',
        overflowY: 'auto', zIndex: 101,
        boxShadow: '0 24px 64px rgba(15,23,34,0.18)',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, background: '#FFFFFF',
          padding: '20px 24px 16px', borderBottom: '1px solid #EDE7D9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderRadius: '20px 20px 0 0', zIndex: 1,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50' }}>Create Promo</div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Set up a new promotional offer</div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid #EDE7D9',
            background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#64748B',
          }}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Vendor */}
          <div>
            <label style={labelStyle}>Vendor</label>
            <select value={selectedVendor} onChange={(e) => setSelectedVendor(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {vendors.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          {/* Promo Name */}
          <div>
            <label style={labelStyle}>Promo Name</label>
            <input
              value={promoName} onChange={(e) => setPromoName(e.target.value)}
              placeholder='e.g. "15% Off Suits"'
              style={inputStyle}
            />
          </div>

          {/* Discount Type */}
          <div>
            <label style={labelStyle}>Discount Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setDiscountType('percentage')} style={chipStyle(discountType === 'percentage')}>
                Percentage (%)
              </button>
              <button onClick={() => setDiscountType('fixed')} style={chipStyle(discountType === 'fixed')}>
                Fixed Amount (TZS)
              </button>
            </div>
          </div>

          {/* Discount Value */}
          <div>
            <label style={labelStyle}>{discountType === 'percentage' ? 'Percentage' : 'Amount (TZS)'}</label>
            <input
              type="number" value={discountValue} onChange={(e) => setDiscountValue(e.target.value)}
              placeholder={discountType === 'percentage' ? 'e.g. 15' : 'e.g. 5000'}
              style={inputStyle}
            />
          </div>

          {/* Applies To */}
          <div>
            <label style={labelStyle}>Applies To</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'entireOrder', label: 'Entire Order' },
                { id: 'specificCategory', label: 'Category' },
                { id: 'specificItem', label: 'Item' },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setAppliesTo(opt.id)} style={chipStyle(appliesTo === opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: Category or Item */}
          {appliesTo === 'specificCategory' && (
            <div>
              <label style={labelStyle}>Category Name</label>
              <input
                value={targetCategory} onChange={(e) => setTargetCategory(e.target.value)}
                placeholder='e.g. Iron, Bedding, Formal'
                style={inputStyle}
              />
            </div>
          )}
          {appliesTo === 'specificItem' && (
            <div>
              <label style={labelStyle}>Item Name</label>
              <input
                value={targetItem} onChange={(e) => setTargetItem(e.target.value)}
                placeholder='e.g. Suit Care Duo, Sneaker Clean'
                style={inputStyle}
              />
            </div>
          )}

          {/* Min Spend */}
          <div>
            <label style={labelStyle}>Minimum Spend (optional)</label>
            <input
              type="number" value={minSpend} onChange={(e) => setMinSpend(e.target.value)}
              placeholder='e.g. 20000'
              style={inputStyle}
            />
          </div>

          {/* Target Audience */}
          <div>
            <label style={labelStyle}>Target Audience</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'allUsers', label: 'All Users' },
                { id: 'firstTimeCustomers', label: 'First-time' },
                { id: 'returningCustomers', label: 'Returning' },
              ].map((opt) => (
                <button key={opt.id} onClick={() => setAudience(opt.id)} style={chipStyle(audience === opt.id)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Redemptions */}
          <div>
            <label style={labelStyle}>Max Redemptions (optional)</label>
            <input
              type="number" value={maxRedemptions} onChange={(e) => setMaxRedemptions(e.target.value)}
              placeholder='e.g. 100'
              style={inputStyle}
            />
          </div>

          {/* Date Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Start Date</label>
              <input
                type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>End Date</label>
              <input
                type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Preview */}
          {promoName && discountValue && (
            <div style={{
              padding: 14, borderRadius: 12,
              background: '#FAF7F1', border: '1px solid #EDE7D9',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Preview
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: '#1A5C58', color: '#FFFFFF',
                  fontSize: 14, fontWeight: 800,
                }}>
                  {discountType === 'percentage' ? `${discountValue}%` : formatCurrency(parseFloat(discountValue))}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{promoName}</div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    Code: <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{generateCode(promoName)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid #EDE7D9',
          display: 'flex', justifyContent: 'flex-end', gap: 8,
        }}>
          <button onClick={onClose} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 700, color: '#64748B',
            background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit} style={{
            padding: '10px 18px', fontSize: 13, fontWeight: 700, color: '#FFFFFF',
            background: canSubmit ? '#1A5C58' : '#CBD5E1',
            border: 'none', borderRadius: 9, cursor: canSubmit ? 'pointer' : 'not-allowed',
          }}>
            Create Promo
          </button>
        </div>
      </div>
    </>
  )
}
