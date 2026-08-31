import { useState, useEffect } from 'react'
import { Package, TrendingUp, Star, Search, X, Check, Loader2, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface ApiItem {
  id: number | string
  category_id: number | string
  name: string
  name_swahili?: string
  description: string
  default_price_tzs: number
  unit: string
  is_available: boolean
  category?: { name: string }
}

const categoryColors: Record<string, string> = {
  'Wash & Fold': '#1A5C58',
  'Dry Clean': '#1F5ECC',
  'Ironing': '#D4841A',
  'Express': '#7C3AED',
  'Specialty': '#C0553F',
}

const categoryBgs: Record<string, string> = {
  'Wash & Fold': '#E8F2F1',
  'Dry Clean': '#E3EEFF',
  'Ironing': '#FDF3E3',
  'Express': '#F0EBFF',
  'Specialty': '#FDE8E4',
}

const fallbackColors = ['#1A5C58', '#1F5ECC', '#D4841A', '#7C3AED', '#C0553F', '#2C3E50']
const fallbackBgs = ['#E8F2F1', '#E3EEFF', '#FDF3E3', '#F0EBFF', '#FDE8E4', '#F1F5F9']

function getCategoryColor(name: string, idx: number): string {
  return categoryColors[name] || fallbackColors[idx % fallbackColors.length]
}

function getCategoryBg(name: string, idx: number): string {
  return categoryBgs[name] || fallbackBgs[idx % fallbackBgs.length]
}

export default function PackagesPage() {
  const [items, setItems] = useState<ApiItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState<ApiItem | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        setError(null)
        const res = await adminApi.getItems()
        if (!cancelled) {
          setItems(res.data.data ?? res.data)
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Failed to load packages'
          setError(message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const categories = [...new Set(items.map((i) => i.category?.name).filter(Boolean))] as string[]
  const categoryIdx = Object.fromEntries(categories.map((c, idx) => [c, idx]))

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCat = selectedCategory === 'all' || item.category?.name === selectedCategory
    return matchesSearch && matchesCat
  })

  const totalItems = items.length
  const availableItems = items.filter((i) => i.is_available).length
  const avgPrice = items.length
    ? Math.round(items.reduce((s, i) => s + i.default_price_tzs, 0) / items.length)
    : 0
  const bestItem = [...items].sort((a, b) => a.default_price_tzs - b.default_price_tzs)[0]

  const categoryStats = categories.map((cat) => {
    const catItems = items.filter((i) => i.category?.name === cat)
    return { category: cat, count: catItems.length }
  })

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
        </div>
      )}

      {!loading && !error && (
        <>
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
                <div className="hc-row">
                  <span className="hc-value">{totalItems}</span>
                </div>
              </div>
              <div className="hero-card">
                <div className="hc-label">Available</div>
                <div className="hc-row">
                  <span className="hc-value">{availableItems}</span>
                  <span className="hc-delta pos">{totalItems ? Math.round((availableItems / totalItems) * 100) : 0}%</span>
                </div>
              </div>
              <div className="hero-card">
                <div className="hc-label">Lowest Price</div>
                <div className="hc-row">
                  <span className="hc-value" style={{ fontSize: 18 }}>{bestItem ? formatCurrency(bestItem.default_price_tzs) : '-'}</span>
                </div>
                <div style={{ fontSize: 11, color: 'rgba(245,240,232,0.55)', marginTop: 4 }}>
                  {bestItem?.name}
                </div>
              </div>
              <div className="hero-card">
                <div className="hc-label">Avg Price</div>
                <div className="hc-row">
                  <span className="hc-value">{formatCurrency(avgPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
            {categoryStats.map((cs) => {
              const idx = categoryIdx[cs.category] ?? 0
              const vc = getCategoryColor(cs.category, idx)
              return (
                <div key={cs.category} className="panel" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: vc,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Package size={18} style={{ color: '#FFFFFF' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{cs.category}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{cs.count} items</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

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
                onClick={() => setSelectedCategory('all')}
                style={{
                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                  color: selectedCategory === 'all' ? '#FFFFFF' : '#64748B',
                  background: selectedCategory === 'all' ? '#1A5C58' : '#FFFFFF',
                  border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                }}
              >
                All
              </button>
              {categories.map((cat) => {
                const idx = categoryIdx[cat] ?? 0
                const vc = getCategoryColor(cat, idx)
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '6px 12px', fontSize: 12, fontWeight: 600,
                      color: selectedCategory === cat ? '#FFFFFF' : '#64748B',
                      background: selectedCategory === cat ? vc : '#FFFFFF',
                      border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>

          {bestItem && (
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
                  Most Affordable Package
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
                  {bestItem.name}
                  <span style={{ fontSize: 14, fontWeight: 600, marginLeft: 10, color: '#D4841A' }}>
                    {formatCurrency(bestItem.default_price_tzs)}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.65)', marginTop: 2 }}>
                  {bestItem.category?.name} — {bestItem.unit}
                </div>
              </div>
              <div style={{
                padding: '8px 14px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: 10, fontSize: 12, fontWeight: 700, color: '#8FD6C4',
              }}>
                <TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                Best Price
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
            {filteredItems.map((item) => {
              const catName = item.category?.name ?? 'Other'
              const catIdx = categoryIdx[catName] ?? 0
              const vc = getCategoryColor(catName, catIdx)
              const vbg = getCategoryBg(catName, catIdx)
              const isActive = item.is_available

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    background: '#FFFFFF', border: '1px solid #EDE7D9',
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
                    e.currentTarget.style.borderColor = '#EDE7D9'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  {!isActive && (
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      padding: '4px 10px', borderRadius: 999,
                      background: '#F1F5F9', color: '#64748B',
                      fontSize: 10, fontWeight: 700, zIndex: 1,
                    }}>
                      UNAVAILABLE
                    </div>
                  )}

                  <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #F5F0E8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: vbg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: vc, flexShrink: 0,
                      }}>
                        <Package size={16} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{item.name}</div>
                        <div style={{ fontSize: 11, color: vc, fontWeight: 600 }}>{catName}</div>
                      </div>
                      {item.name_swahili && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                          background: '#F1F5F9', color: '#64748B',
                        }}>
                          {item.name_swahili}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ padding: '14px 18px' }}>
                    {item.description && (
                      <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: '#2C3E50' }}>
                        {formatCurrency(item.default_price_tzs)}
                      </span>
                      <span style={{ fontSize: 12, color: '#64748B' }}>{item.unit}</span>
                    </div>

                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 12px', borderRadius: 10,
                      background: isActive ? '#DFF5ED' : '#F1F5F9',
                    }}>
                      <Check size={12} style={{ color: isActive ? '#1A7A5C' : '#64748B' }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? '#1A7A5C' : '#64748B' }}>
                        {isActive ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="panel" style={{ padding: 48, textAlign: 'center' }}>
              <Search size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No packages found</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}

      {selectedItem && (
        <>
          <div
            onClick={() => setSelectedItem(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(15,23,34,0.45)',
              zIndex: 100, backdropFilter: 'blur(4px)',
            }}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 20,
            width: '100%', maxWidth: 520, maxHeight: '90vh',
            overflowY: 'auto', zIndex: 101,
            boxShadow: '0 24px 64px rgba(15,23,34,0.18), 0 4px 16px rgba(15,23,34,0.08)',
          }}>
            <div style={{
              position: 'sticky', top: 0, background: '#FFFFFF',
              padding: '20px 24px 16px', borderBottom: '1px solid #EDE7D9',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
              borderRadius: '20px 20px 0 0', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: getCategoryBg(selectedItem.category?.name ?? '', 0),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: getCategoryColor(selectedItem.category?.name ?? '', 0),
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50' }}>{selectedItem.name}</div>
                  <div style={{ fontSize: 13, color: getCategoryColor(selectedItem.category?.name ?? '', 0), fontWeight: 600 }}>
                    {selectedItem.category?.name}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
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
              {selectedItem.name_swahili && (
                <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 4px', lineHeight: 1.6 }}>
                  Swahili: {selectedItem.name_swahili}
                </p>
              )}

              {selectedItem.description && (
                <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 20px', lineHeight: 1.6 }}>
                  {selectedItem.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                <span style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: getCategoryColor(selectedItem.category?.name ?? '', 0) + '14',
                  color: getCategoryColor(selectedItem.category?.name ?? '', 0),
                  fontSize: 12, fontWeight: 700,
                }}>
                  {selectedItem.category?.name}
                </span>
                <span style={{
                  padding: '5px 12px', borderRadius: 999,
                  background: selectedItem.is_available ? '#DFF5ED' : '#F1F5F9',
                  color: selectedItem.is_available ? '#1A7A5C' : '#64748B',
                  fontSize: 12, fontWeight: 700,
                }}>
                  {selectedItem.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>

              <div style={{
                padding: 16, borderRadius: 14,
                background: '#FAF7F1', border: '1px solid #EDE7D9',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 28, fontWeight: 700, color: '#2C3E50' }}>
                    {formatCurrency(selectedItem.default_price_tzs)}
                  </span>
                  <span style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>
                    {selectedItem.unit}
                  </span>
                </div>
              </div>

              <div style={{
                marginTop: 20, padding: 16, borderRadius: 14,
                background: '#FAF7F1', border: '1px solid #EDE7D9',
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: getCategoryColor(selectedItem.category?.name ?? '', 0) }}>
                    {selectedItem.category?.name ?? '-'}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Category</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>
                    {selectedItem.unit}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Unit</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>
                    {selectedItem.is_available ? 'Yes' : 'No'}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Available</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
