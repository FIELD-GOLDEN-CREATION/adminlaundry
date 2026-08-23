import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, MapPin, Clock, Phone, Mail, ShoppingBag,
  TrendingUp, Wallet, Tag, Percent, Check, X as XIcon, ChevronDown, ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type {
  VendorDetail, VendorCategory, VendorPromo, VendorOrder,
  PayoutRecord, VendorReview,
} from '@/types'

const mockVendor: VendorDetail = {
  id: 'v1', name: 'Marina Fresh', email: 'marina@freshfold.com', phone: '+255 712 345 678',
  ownerName: 'Amina Hassan', location: 'Kariakoo, Dar es Salaam',
  address: '123 Uhuru St, Kariakoo, Dar es Salaam',
  registeredAt: '2024-01-10', status: 'active',
  services: ['Wash', 'Iron', 'Dry clean'], badges: ['Free pickup', '24h turnaround', 'Eco detergent'],
  description: 'Premium laundry service with eco-friendly detergents and fast turnaround.',
  rating: 4.8, reviewCount: 312, totalOrders: 1847, totalRevenue: 42500000,
  balance: 8171280, commission: 6375000, platformFee: 4250000,
  isOpen: true, workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  openTime: '07:00', closeTime: '19:00', turnaround: '24h',
}

const mockCategories: VendorCategory[] = [
  {
    id: 'cat1', name: 'Standard Everyday Wear', items: [
      { id: 'i1', name: 'T-Shirt', price: 3000, unit: 'piece', available: true },
      { id: 'i2', name: 'Shirt', price: 4000, unit: 'piece', available: true },
      { id: 'i3', name: 'Trousers', price: 5000, unit: 'piece', available: true },
      { id: 'i4', name: 'Shorts', price: 3000, unit: 'piece', available: true },
      { id: 'i5', name: 'Underwear', price: 2000, unit: 'piece', available: true },
    ],
  },
  {
    id: 'cat2', name: 'Formal & Woolen', items: [
      { id: 'i6', name: 'Suit (2-piece)', price: 15000, unit: 'set', available: true },
      { id: 'i7', name: 'Blazer', price: 8000, unit: 'piece', available: true },
      { id: 'i8', name: 'Wool Sweater', price: 6000, unit: 'piece', available: true },
      { id: 'i9', name: 'Dress Shirt', price: 5000, unit: 'piece', available: true },
      { id: 'i10', name: 'Silk Blouse', price: 7000, unit: 'piece', available: true },
      { id: 'i11', name: 'Formal Trousers', price: 5000, unit: 'piece', available: true },
      { id: 'i12', name: 'Jacket', price: 8000, unit: 'piece', available: false },
    ],
  },
  {
    id: 'cat3', name: 'Footwear & Bags', items: [
      { id: 'i13', name: 'Sneakers', price: 10000, unit: 'pair', available: true },
      { id: 'i14', name: 'Leather Shoes', price: 12000, unit: 'pair', available: true },
      { id: 'i15', name: 'Canvas Bag', price: 8000, unit: 'piece', available: true },
      { id: 'i16', name: 'Backpack', price: 10000, unit: 'piece', available: true },
      { id: 'i17', name: 'Sandals', price: 6000, unit: 'pair', available: true },
    ],
  },
  {
    id: 'cat4', name: 'Bedding & Household', items: [
      { id: 'i18', name: 'Bed Sheet (Single)', price: 8000, unit: 'piece', available: true },
      { id: 'i19', name: 'Bed Sheet (Double)', price: 12000, unit: 'piece', available: true },
      { id: 'i20', name: 'Blanket', price: 15000, unit: 'piece', available: true },
      { id: 'i21', name: 'Pillowcase', price: 3000, unit: 'piece', available: true },
      { id: 'i22', name: 'Curtain (per panel)', price: 12000, unit: 'piece', available: true },
      { id: 'i23', name: 'Tablecloth', price: 8000, unit: 'piece', available: true },
    ],
  },
  {
    id: 'cat5', name: 'Bulk & Add-Ons', items: [
      { id: 'i24', name: 'Wash & Fold (per kg)', price: 3500, unit: 'kg', available: true },
      { id: 'i25', name: 'Stain Treatment', price: 2000, unit: 'piece', available: true },
      { id: 'i26', name: 'Fabric Softener', price: 1000, unit: 'piece', available: true },
      { id: 'i27', name: 'Express (same day)', price: 5000, unit: 'order', available: true },
    ],
  },
]

const mockPromos: VendorPromo[] = [
  { id: 'p1', code: 'MARINA20', title: '20% Off First Order', description: 'Get 20% off your first laundry order', discountValue: 20, isPercentage: true, appliesTo: 'entireOrder', audience: 'firstTimeCustomers', minSpend: 10000, maxRedemptions: 100, currentRedemptions: 43, isActive: true, expiresAt: '2026-03-31' },
  { id: 'p2', code: 'IRON10', title: 'TZS 1000 Off Ironing', description: 'TZS 1000 off ironing services', discountValue: 1000, isPercentage: false, appliesTo: 'specificCategory', targetCategory: 'Iron', audience: 'allUsers', minSpend: 5000, maxRedemptions: 200, currentRedemptions: 87, isActive: true, expiresAt: '2026-02-28' },
  { id: 'p3', code: 'VIP50', title: '50% VIP Discount', description: 'Half price for returning VIP customers', discountValue: 50, isPercentage: true, appliesTo: 'entireOrder', audience: 'returningCustomers', minSpend: 20000, maxRedemptions: 50, currentRedemptions: 50, isActive: false, expiresAt: '2025-12-31' },
]

const mockOrders: VendorOrder[] = [
  { id: '#4523', customer: 'Amara K.', items: '3× T-Shirt, 1× Trousers', total: 14000, status: 'in_wash', date: '2026-08-21' },
  { id: '#4522', customer: 'Jabari M.', items: '1× Suit (2-piece), 2× Shirts', total: 23000, status: 'ready', date: '2026-08-21' },
  { id: '#4519', customer: 'Grace T.', items: '2× Bed Sheet, 1× Blanket', total: 39000, status: 'out_for_delivery', date: '2026-08-20' },
  { id: '#4516', customer: 'Kofi A.', items: '5× T-Shirt, 3× Shirts', total: 27000, status: 'delivered', date: '2026-08-20' },
  { id: '#4515', customer: 'Lila M.', items: '1× Sneakers, 1× Backpack', total: 20000, status: 'delivered', date: '2026-08-19' },
  { id: '#4512', customer: 'Omar N.', items: '4× Shirt, 2× Trousers', total: 26000, status: 'delivered', date: '2026-08-19' },
]

const mockPayouts: PayoutRecord[] = [
  { date: '2026-08-15', ref: 'PAY-2026-0815', amount: 1250000 },
  { date: '2026-08-01', ref: 'PAY-2026-0801', amount: 1870000 },
  { date: '2026-07-15', ref: 'PAY-2026-0715', amount: 980000 },
  { date: '2026-07-01', ref: 'PAY-2026-0701', amount: 2100000 },
]

const mockReviews: VendorReview[] = [
  { id: 'r1', customer: 'Amara K.', rating: 5, comment: 'Excellent service! My clothes were perfectly cleaned and delivered on time.', date: '2026-08-20' },
  { id: 'r2', customer: 'Jabari M.', rating: 4, comment: 'Good quality but delivery took a bit longer than expected.', date: '2026-08-19' },
  { id: 'r3', customer: 'Nadia B.', rating: 5, comment: 'Always reliable. The eco detergent smells amazing!', date: '2026-08-18' },
]

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

export default function VendorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedCategory, setExpandedCategory] = useState<string | null>('cat1')

  const vendor = mockVendor
  const categories = mockCategories
  const promos = mockPromos
  const orders = mockOrders
  const payouts = mockPayouts
  const reviews = mockReviews

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'categories', label: 'Categories & Items' },
    { id: 'promos', label: 'Promos' },
    { id: 'earnings', label: 'Earnings' },
  ]

  const vs = vendorStatusColors[vendor.status]
  const totalCategoryItems = categories.reduce((sum, c) => sum + c.items.length, 0)
  const availableItems = categories.reduce((sum, c) => sum + c.items.filter((i) => i.available).length, 0)

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/members/vendors" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Vendors</a></li>
          <li className="sep">/</li>
          <li className="current">{vendor.name}</li>
        </ol>
        <button
          onClick={() => navigate('/members/vendors')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Back to Vendors
        </button>
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
              {vendor.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{vendor.name}</h1>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: vs.bg, color: vs.fg,
                  fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                }}>
                  {vendor.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', marginTop: 4 }}>
                {vendor.description}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                {vendor.services.map((s) => (
                  <span key={s} style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.18)',
                    fontSize: 11, fontWeight: 600,
                  }}>
                    {s}
                  </span>
                ))}
                {vendor.badges.map((b) => (
                  <span key={b} style={{
                    padding: '4px 10px', borderRadius: 999,
                    background: 'rgba(212,132,26,0.25)', border: '1px solid rgba(212,132,26,0.35)',
                    fontSize: 11, fontWeight: 600, color: '#FDF3E3',
                  }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <Star size={18} style={{ color: '#D4841A', fill: '#D4841A' }} />
                <span style={{ fontSize: 22, fontWeight: 700 }}>{vendor.rating}</span>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.6)' }}>
                {vendor.reviewCount} reviews
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        {[
          { label: 'Total Orders', value: vendor.totalOrders.toLocaleString(), icon: ShoppingBag, color: '#1A5C58' },
          { label: 'Total Revenue', value: formatCurrency(vendor.totalRevenue), icon: TrendingUp, color: '#D4841A' },
          { label: 'Balance', value: formatCurrency(vendor.balance), icon: Wallet, color: '#1F5ECC' },
          { label: 'Rating', value: `${vendor.rating} / 5.0`, icon: Star, color: '#7C3AED' },
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
              borderBottom: activeTab === tab.id ? '2px solid #1A5C58' : '2px solid transparent',
              background: 'transparent', border: 'none', cursor: 'pointer',
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
                { label: 'Owner', value: vendor.ownerName },
                { label: 'Email', value: vendor.email, icon: Mail },
                { label: 'Phone', value: vendor.phone, icon: Phone },
                { label: 'Location', value: vendor.location, icon: MapPin },
                { label: 'Address', value: vendor.address },
                { label: 'Registered', value: new Date(vendor.registeredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) },
                { label: 'Turnaround', value: vendor.turnaround, icon: Clock },
                { label: 'Working Days', value: vendor.workingDays.join(', ') },
                { label: 'Hours', value: `${vendor.openTime} – ${vendor.closeTime}` },
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
              <div className="panel-sub">Last 6 orders</div>
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
                {orders.map((order) => {
                  const sc = statusColors[order.status] || statusColors.pending
                  return (
                    <tr key={order.id}>
                      <td style={{ fontWeight: 700, color: '#2C3E50' }}>{order.id}</td>
                      <td style={{ color: '#64748B' }}>{order.customer}</td>
                      <td>
                        <span className="status-pill" style={{ background: sc.bg, color: sc.fg, fontSize: 10 }}>
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatCurrency(order.total)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="dt-footer">View all orders</div>
          </div>

          {/* Reviews */}
          <div className="panel" style={{ padding: 0, gridColumn: 'span 2' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE7D9' }}>
              <div className="panel-title">Recent Reviews</div>
              <div className="panel-sub">{vendor.reviewCount} total reviews</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
              {reviews.map((review) => (
                <div key={review.id} style={{ padding: 16, borderRight: '1px solid #F5F0E8' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div className="avatar-chip" style={{ width: 28, height: 28, fontSize: 11 }}>
                      {review.customer.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{review.customer}</div>
                      <div style={{ fontSize: 11, color: '#64748B' }}>{review.date}</div>
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
            const catAvailable = cat.items.filter((i) => i.available).length
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
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{cat.name}</div>
                    <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>
                      {catAvailable}/{cat.items.length} items available
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                    background: '#E8F2F1', color: '#1A5C58',
                  }}>
                    {cat.items.length} items
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
                      {cat.items.map((item) => (
                        <tr key={item.id} style={{ opacity: item.available ? 1 : 0.5 }}>
                          <td style={{ fontWeight: 600, color: '#2C3E50' }}>{item.name}</td>
                          <td style={{ textAlign: 'center', color: '#64748B' }}>{item.unit}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#2C3E50' }}>
                            {formatCurrency(item.price)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {item.available ? (
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
        </div>
      )}

      {/* ===== Promos Tab ===== */}
      {activeTab === 'promos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 14 }}>
          {promos.map((promo) => (
            <div key={promo.id} className="panel" style={{
              padding: 0, overflow: 'hidden',
              opacity: promo.isActive ? 1 : 0.55,
            }}>
              {/* Promo header */}
              <div style={{
                padding: '14px 18px',
                background: promo.isActive ? 'linear-gradient(135deg, #1A5C58, #0F423F)' : '#F1F5F9',
                color: promo.isActive ? '#F5F0E8' : '#64748B',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {promo.isPercentage ? <Percent size={16} /> : <Tag size={16} />}
                  <span style={{ fontSize: 16, fontWeight: 700 }}>
                    {promo.isPercentage ? `${promo.discountValue}%` : formatCurrency(promo.discountValue)}
                  </span>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 999,
                  background: promo.isActive ? 'rgba(255,255,255,0.2)' : '#E2E8F0',
                }}>
                  {promo.isActive ? 'ACTIVE' : 'EXPIRED'}
                </span>
              </div>

              {/* Promo body */}
              <div style={{ padding: '14px 18px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50', marginBottom: 4 }}>
                  {promo.title}
                </div>
                <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 12px', lineHeight: 1.5 }}>
                  {promo.description}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: '#2C3E50' }}>
                    <span style={{ fontWeight: 700 }}>Code:</span>{' '}
                    <span style={{ fontFamily: 'monospace', background: '#FAF7F1', padding: '2px 6px', borderRadius: 4 }}>
                      {promo.code}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    <span style={{ fontWeight: 700 }}>Applies to:</span> {promo.appliesTo}
                    {promo.targetCategory && ` → ${promo.targetCategory}`}
                    {promo.targetItem && ` → ${promo.targetItem}`}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    <span style={{ fontWeight: 700 }}>Audience:</span> {promo.audience.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    <span style={{ fontWeight: 700 }}>Min spend:</span> {formatCurrency(promo.minSpend)}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    <span style={{ fontWeight: 700 }}>Expires:</span> {promo.expiresAt}
                  </div>
                </div>

                {/* Redemption bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B' }}>Redemptions</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#1A5C58' }}>
                      {promo.currentRedemptions}/{promo.maxRedemptions}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 999, background: '#EDE7D9', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.round((promo.currentRedemptions / promo.maxRedemptions) * 100)}%`,
                      borderRadius: 999, background: '#1A5C58',
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ===== Earnings Tab ===== */}
      {activeTab === 'earnings' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {/* Balance card */}
          <div className="panel" style={{
            padding: 0, overflow: 'hidden', background: 'linear-gradient(135deg, #1A5C58, #0F423F)',
            color: '#F5F0E8',
          }}>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.6)' }}>
                Available Balance
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, marginTop: 6 }}>
                {formatCurrency(vendor.balance)}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(245,240,232,0.6)', marginTop: 4 }}>
                Last payout: {mockPayouts[0].date}
              </div>
            </div>
          </div>

          {/* Earnings breakdown */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 14 }}>Earnings Breakdown</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Gross Revenue', value: vendor.totalRevenue, color: '#1A5C58' },
                { label: 'Platform Commission (15%)', value: vendor.commission, color: '#C0553F' },
                { label: 'Platform Fee', value: vendor.platformFee, color: '#D4841A' },
                { label: 'Net Earnings', value: vendor.totalRevenue - vendor.commission - vendor.platformFee, color: '#1A5C58' },
              ].map((item) => (
                <div key={item.label} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', borderRadius: 10,
                  background: '#FAF7F1',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>{item.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: item.color }}>
                    {formatCurrency(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payout history */}
          <div className="panel" style={{ padding: 0, gridColumn: 'span 2' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE7D9' }}>
              <div className="panel-title">Payout History</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Reference</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout.ref}>
                    <td style={{ color: '#64748B' }}>{payout.date}</td>
                    <td style={{ fontWeight: 600, color: '#2C3E50', fontFamily: 'monospace', fontSize: 12 }}>{payout.ref}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#1A5C58' }}>
                      {formatCurrency(payout.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="dt-footer">Payout history</div>
          </div>
        </div>
      )}
    </div>
  )
}
