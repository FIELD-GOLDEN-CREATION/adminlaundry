import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Phone, Mail, ShoppingBag,
  TrendingUp, Tag, Percent, Check, X as XIcon, ChevronDown, ChevronRight, AlertTriangle,
  Edit, KeyRound,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { adminApi } from '@/services/api'

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
}

const vendorStatusColors: Record<string, { bg: string; fg: string }> = {
  active: { bg: '#DFF5ED', fg: '#1A7A5C' },
  suspended: { bg: '#F3D5CE', fg: '#C0553F' },
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
}

interface ShopData {
  id: string
  name: string
  slug: string
  description: string
  phone: string
  email: string
  address: string
  owner: { name: string; email: string }
  rating_avg: number
  rating_count: number
  total_orders: number
  total_revenue: number
  status: string
  is_open: boolean
  created_at: string
  recent_orders: { id: string; status: string; total_tzs: string; created_at: string; customer?: { name: string } }[]
  reviews: { id: string; rating: number; comment: string; created_at: string; customer?: { name: string } }[]
  vendor_categories: {
    id: number
    shop_id: number
    category_id: number
    name?: string
    category?: {
      id: number
      name: string
      items: { id: number; name: string; default_price_tzs: string; unit: string; is_available: boolean }[]
    }
  }[]
}

export default function VendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [shop, setShop] = useState<ShopData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', address: '', description: '' })
  const [showPinModal, setShowPinModal] = useState(false)
  const [newPin, setNewPin] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [pinSaving, setPinSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    adminApi.getShop(id)
      .then((res) => {
        setShop(res.data.data)
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to load vendor details')
      })
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (expandedCategory === null && shop?.vendor_categories?.length) {
      setExpandedCategory(shop.vendor_categories[0].id)
    }
  }, [shop, expandedCategory])

  const openEditModal = () => {
    if (!shop) return
    setEditForm({
      name: shop.name || '',
      email: shop.email || '',
      phone: shop.phone || '',
      address: shop.address || '',
      description: shop.description || '',
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!id || !shop) return
    setEditSaving(true)
    try {
      await adminApi.updateShop(id, {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
        description: editForm.description,
      })
      setShop({ ...shop, ...editForm })
      setShowEditModal(false)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save')
    } finally {
      setEditSaving(false)
    }
  }

  const handleSavePin = async () => {
    if (!id || !newPin || newPin.length < 4) return
    setPinSaving(true)
    try {
      await adminApi.updateUser(id, { password: newPin })
      setShowPinModal(false)
      setNewPin('')
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to update PIN')
    } finally {
      setPinSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: '#64748B', fontSize: 14, fontWeight: 600 }}>
        Loading vendor details...
      </div>
    )
  }

  if (error || !shop) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 12 }}>
        <AlertTriangle size={32} style={{ color: '#C0553F' }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{error || 'Vendor not found'}</div>
        <button
          onClick={() => navigate('/members/vendors')}
          style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}
        >
          Back to Vendors
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'categories', label: 'Categories & Items' },
    { id: 'reviews', label: 'Reviews' },
  ]

  const vs = vendorStatusColors[shop.status] || vendorStatusColors.pending
  const categories = shop.vendor_categories || []
  const totalCategoryItems = categories.reduce((sum, c) => sum + (c.category?.items?.length || 0), 0)
  const availableItems = categories.reduce((sum, c) => sum + (c.category?.items?.filter((i) => i.is_available !== false).length || 0), 0)

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/members/vendors" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Vendors</a></li>
          <li className="sep">/</li>
          <li className="current">{shop.name}</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={openEditModal}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#1A5C58', background: '#E8F2F1',
              border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            <Edit size={14} /> Edit
          </button>
          <button
            onClick={() => setShowPinModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#D4841A', background: '#FDF3E3',
              border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            <KeyRound size={14} /> Reset PIN
          </button>
          <button
            onClick={() => navigate('/members/vendors')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
              border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
            }}
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>
      </div>

      {/* Profile header */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A5C58 0%, #0F423F 100%)',
          padding: '24px 28px', color: '#F5F0E8',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18,
              background: 'rgba(255,255,255,0.18)', border: '2px solid rgba(255,255,255,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, fontWeight: 800,
            }}>
              {shop.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{shop.name}</h1>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: vs.bg, color: vs.fg,
                  fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                }}>
                  {shop.status}
                </span>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: shop.is_open ? 'rgba(26,122,92,0.25)' : 'rgba(192,85,63,0.25)',
                  border: `1px solid ${shop.is_open ? 'rgba(26,122,92,0.35)' : 'rgba(192,85,63,0.35)'}`,
                  fontSize: 11, fontWeight: 600,
                }}>
                  {shop.is_open ? 'Open' : 'Closed'}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', marginTop: 4 }}>
                {shop.description}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <Star size={18} style={{ color: '#D4841A', fill: '#D4841A' }} />
                <span style={{ fontSize: 22, fontWeight: 700 }}>{Number(shop.rating_avg || 0).toFixed(1)}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.6)' }}>
                {shop.rating_count || 0} reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
        {[
          { label: 'Total Orders', value: (shop.total_orders || 0).toLocaleString(), icon: ShoppingBag, color: '#1A5C58' },
          { label: 'Total Revenue', value: formatCurrency(shop.total_revenue || 0), icon: TrendingUp, color: '#D4841A' },
          { label: 'Rating', value: `${Number(shop.rating_avg || 0).toFixed(1)} / 5.0`, icon: Star, color: '#7C3AED' },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: kpi.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: kpi.color,
              }}>
                <kpi.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50', marginTop: 2 }}>
                  {kpi.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #EDE7D9',
        background: '#FFFFFF', borderRadius: '14px 14px 0 0', padding: '0 16px',
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '14px 16px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? '#1A5C58' : '#64748B',
              borderBottom: activeTab === tab.id ? '2px solid #1A5C58' : '2px solid transparent', background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== Overview Tab ===== */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Registration details */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 16 }}>Registration Details</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Owner', value: shop.owner?.name || '—' },
                { label: 'Email', value: shop.email, icon: Mail },
                { label: 'Phone', value: shop.phone, icon: Phone },
                { label: 'Address', value: shop.address, icon: MapPin },
                { label: 'Registered', value: shop.created_at ? new Date(shop.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
              ].map((field) => (
                <div key={field.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  {field.icon && <field.icon size={14} style={{ color: '#64748B', marginTop: 3, flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 2 }}>{field.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent orders */}
          <div className="panel" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE7D9' }}>
              <div className="panel-title">Recent Orders</div>
              <div className="panel-sub">Last {shop.recent_orders?.length || 0} orders</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(shop.recent_orders || []).map((order) => {
                  const sc = statusColors[order.status] || statusColors.pending
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: '#2C3E50' }}>#{order.id}</td>
                      <td style={{ color: '#64748B' }}>{order.customer?.name || '—'}</td>
                      <td>
                        <span className="status-pill" style={{ background: sc.bg, color: sc.fg, fontSize: 10 }}>
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(order.total_tzs)}</td>
                    </tr>
                  )
                })}
                {(!shop.recent_orders || shop.recent_orders.length === 0) && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 20, color: '#64748B', fontSize: 13 }}>No recent orders</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Reviews */}
          <div className="panel" style={{ padding: 0, gridColumn: 'span 2' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE7D9' }}>
              <div className="panel-title">Recent Reviews</div>
              <div className="panel-sub">{shop.rating_count || 0} total reviews</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(shop.reviews?.length || 0, 3)}, 1fr)`, gap: 0 }}>
              {(shop.reviews || []).slice(0, 3).map((review) => (
                <div key={review.id} style={{ padding: 16, borderRight: '1px solid #F5F0E8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div className="avatar-chip" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {(review.customer?.name || '?').charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{review.customer?.name || 'Anonymous'}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</div>
                    </div>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={12} style={{
                          color: i < review.rating ? '#D4841A' : '#E2E8F0',
                          fill: i < review.rating ? '#D4841A' : 'transparent',
                        }} />
                      ))}
                    </div>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B', margin: 0, lineHeight: 1.5 }}>
                    {review.comment}
                  </p>
                </div>
              ))}
              {(!shop.reviews || shop.reviews.length === 0) && (
                <div style={{ padding: 20, textAlign: 'center', color: '#64748B', fontSize: 13, gridColumn: 'span 3' }}>No reviews yet</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Categories & Items Tab ===== */}
      {activeTab === 'categories' && (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="panel" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A5C58' }}>{categories.length}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Categories</div>
            </div>
            <div className="panel" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#2C3E50' }}>{totalCategoryItems}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Total Items</div>
            </div>
            <div className="panel" style={{ padding: '12px 16px', flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#1A7A5C' }}>{availableItems}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Available</div>
            </div>
          </div>

          {categories.map((cat) => {
            const isExpanded = expandedCategory === cat.id
            const catItems = cat.category?.items || []
            const catAvailable = catItems.filter((i) => i.is_available !== false).length
            return (
              <div key={cat.id} className="panel" style={{ padding: 0, marginBottom: 12, overflow: 'hidden' }}>
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 18px', background: '#FAF7F1', border: 'none',
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  {isExpanded ? <ChevronDown size={16} style={{ color: '#64748B' }} /> : <ChevronRight size={16} style={{ color: '#64748B' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{cat.category?.name || cat.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {catAvailable}/{catItems.length} items available
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: '#E8F2F1', color: '#1A5C58',
                  }}>
                    {catItems.length} items
                  </span>
                </button>
                {isExpanded && (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style={{ textAlign: 'center' }}>Unit</th>
                        <th style={{ textAlign: 'right' }}>Price</th>
                        <th style={{ textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {catItems.map((item) => (
                        <tr key={item.id} style={{ opacity: item.is_available !== false ? 1 : 0.5 }}>
                          <td style={{ fontWeight: 600, color: '#2C3E50' }}>{item.name}</td>
                          <td style={{ textAlign: 'center', color: '#64748B' }}>{item.unit}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#2C3E50' }}>
                            {formatCurrency(item.default_price_tzs)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {item.is_available !== false ? (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#1A7A5C' }}>
                                <Check size={12} /> Active
                              </span>
                            ) : (
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#C0553F' }}>
                                <XIcon size={12} /> Unavailable
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )
          })}

          {categories.length === 0 && (
            <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
              No categories configured for this vendor.
            </div>
          )}
        </div>
      )}

      {/* ===== Reviews Tab ===== */}
      {activeTab === 'reviews' && (
        <div>
          <div className="panel" style={{ padding: 0, marginBottom: 16 }}>
            <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#2C3E50' }}>{Number(shop.rating_avg || 0).toFixed(1)}</div>
                <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} style={{
                      color: i < Math.round(shop.rating_avg || 0) ? '#D4841A' : '#E2E8F0',
                      fill: i < Math.round(shop.rating_avg || 0) ? '#D4841A' : 'transparent',
                    }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{shop.rating_count || 0} reviews</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(shop.reviews || []).map((review) => (
              <div key={review.id} className="panel" style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="avatar-chip" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {(review.customer?.name || '?').charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{review.customer?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: 11, color: '#64748B' }}>{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} style={{
                        color: i < review.rating ? '#D4841A' : '#E2E8F0',
                        fill: i < review.rating ? '#D4841A' : 'transparent',
                      }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#2C3E50', margin: 0, lineHeight: 1.6 }}>
                  {review.comment}
                </p>
              </div>
            ))}
            {(!shop.reviews || shop.reviews.length === 0) && (
              <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
                No reviews yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowEditModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 480,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Edit Vendor</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Shop Name', key: 'name' },
                { label: 'Email', key: 'email' },
                { label: 'Phone', key: 'phone' },
                { label: 'Address', key: 'address' },
                { label: 'Description', key: 'description' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>{field.label}</label>
                  <input
                    value={(editForm as any)[field.key]}
                    onChange={(e) => setEditForm((p) => ({ ...p, [field.key]: e.target.value }))}
                    style={{
                      width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                      padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowEditModal(false)} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveEdit} disabled={editSaving} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 9, cursor: editSaving ? 'wait' : 'pointer', opacity: editSaving ? 0.6 : 1 }}>{editSaving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </>
      )}

      {/* Reset PIN Modal */}
      {showPinModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowPinModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Reset PIN / Password</div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>New Password</label>
              <input
                type="password"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new password (min 6 chars)"
                style={{
                  width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                  padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => { setShowPinModal(false); setNewPin(''); }} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSavePin} disabled={pinSaving || newPin.length < 6} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#D4841A', border: 'none', borderRadius: 9, cursor: pinSaving ? 'wait' : 'pointer', opacity: pinSaving || newPin.length < 6 ? 0.6 : 1 }}>{pinSaving ? 'Saving...' : 'Update PIN'}</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
