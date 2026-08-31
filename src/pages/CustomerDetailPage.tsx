import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Mail, Phone, MapPin, Clock, ShoppingBag, Heart,
  CreditCard, Shield, Star, TrendingUp, Check, Store,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useVendorApplications } from '@/contexts/VendorApplicationContext'
import { adminApi } from '@/services/api'
import type { CustomerDetail, FavoriteVendor } from '@/types'

interface OrderRow {
  id: string
  vendor: string
  items: string
  total: number
  status: string
  date: string
  payment: string
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
}

const vendorColors: Record<string, string> = {
  'Marina Fresh': '#1A5C58',
  'Bright & Fold': '#D4841A',
}

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function CustomerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [showVendorApp, setShowVendorApp] = useState(false)
  const [vendorApp, setVendorApp] = useState({ officeName: '', officeLocation: '', contactPhone: '', contactWhatsApp: '' })

  const { getClientApplication, addApplication } = useVendorApplications()
  const existingApp = getClientApplication(id || '')

  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)

    Promise.all([
      adminApi.getUser(id),
      adminApi.getDashboardOrders(),
    ])
      .then(([userRes, ordersRes]) => {
        const u = userRes.data.data
        const mapped: CustomerDetail = {
          id: String(u.id),
          name: u.name,
          email: u.email,
          phone: u.phone || '',
          authProvider: u.firebase_uid ? 'google' : 'email',
          photoUrl: u.photo_url,
          registeredAt: u.created_at,
          lastLoginAt: u.created_at,
          status: 'active',
          totalOrders: u.total_orders ?? 0,
          totalSpent: u.total_spent ?? 0,
          favoriteVendorIds: [],
          addresses: [],
          preferences: [
            { label: 'Push notifications', enabled: true },
            { label: 'Eco detergent by default', enabled: true },
            { label: 'Contactless pickup', enabled: false },
          ],
          paymentMethods: [],
        }
        setCustomer(mapped)

        const allOrders = ordersRes.data.data ?? []
        const filtered = allOrders
          .filter((o: any) => String(o.client?.id) === String(u.id) || String(o.user_id) === String(u.id))
          .map((o: any) => ({
            id: `#${o.id}`,
            vendor: o.vendor_name || o.shop_name || o.vendor || 'Unknown',
            items: typeof o.items === 'number' ? `${o.items} items` : (o.items_summary || `${o.items ?? 0} items`),
            total: o.total ?? 0,
            status: o.status ?? 'pending',
            date: o.created_at?.slice(0, 10) ?? '',
            payment: o.payment_method || o.payment || 'M-Pesa',
          }))
        setOrders(filtered)
      })
      .catch(() => setError('Failed to load customer details.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, border: '3px solid #EDE7D9', borderTopColor: '#1A5C58', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <span style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>Loading customer details...</span>
        </div>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#C0553F', fontWeight: 600 }}>{error || 'Customer not found'}</p>
          <button
            onClick={() => navigate('/members/clients')}
            style={{
              marginTop: 12, padding: '9px 14px', fontSize: 12.5, fontWeight: 700,
              color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9',
              borderRadius: 9, cursor: 'pointer',
            }}
          >
            Back to Clients
          </button>
        </div>
      </div>
    )
  }

  const favVendors: FavoriteVendor[] = []
  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    { id: 'favorites', label: 'Favorite Vendors' },
  ]

  const avgOrderValue = customer.totalOrders > 0
    ? Math.round(customer.totalSpent / customer.totalOrders)
    : 0

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/members/clients" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Clients</a></li>
          <li className="sep">/</li>
          <li className="current">{customer.name}</li>
        </ol>
        <button
          onClick={() => navigate('/members/clients')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Back to Clients
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
              {customer.name.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{customer.name}</h1>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: customer.status === 'active' ? '#DFF5ED' : '#F3D5CE',
                  color: customer.status === 'active' ? '#1A7A5C' : '#C0553F',
                  fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                }}>
                  {customer.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', marginTop: 4 }}>
                {customer.email}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 999,
                background: customer.authProvider === 'google' ? 'rgba(255,255,255,0.15)' : 'rgba(212,132,26,0.3)',
                border: customer.authProvider === 'google' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(212,132,26,0.4)',
                fontSize: 12, fontWeight: 700,
              }}>
                {customer.authProvider === 'google' ? <GoogleIcon /> : <Mail size={13} />}
                {customer.authProvider === 'google' ? 'Google' : 'Email'}
              </span>
              <div style={{ marginTop: 8 }}>
                {existingApp ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '6px 14px', borderRadius: 9,
                    fontSize: 12, fontWeight: 700,
                    background: existingApp.status === 'approved' ? '#DFF5ED' : existingApp.status === 'rejected' ? '#F3D5CE' : '#FDF3E3',
                    color: existingApp.status === 'approved' ? '#1A7A5C' : existingApp.status === 'rejected' ? '#C0553F' : '#D4841A',
                    border: `1px solid ${existingApp.status === 'approved' ? '#1A5C5830' : existingApp.status === 'rejected' ? '#C0553F30' : '#D4841A30'}`,
                  }}>
                    <Store size={13} />
                    {existingApp.status === 'approved' ? 'Vendor Approved' : existingApp.status === 'rejected' ? 'Application Rejected' : 'Application Pending'}
                  </span>
                ) : (
                  <button
                    onClick={() => setShowVendorApp(true)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 9,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: 'rgba(255,255,255,0.15)', color: '#F5F0E8',
                      border: '1px solid rgba(255,255,255,0.25)',
                    }}
                  >
                    <Store size={13} /> Apply as Vendor
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI tiles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        {[
          { label: 'Total Orders', value: customer.totalOrders.toString(), icon: ShoppingBag, color: '#1A5C58' },
          { label: 'Total Spent', value: `TZS ${customer.totalSpent.toLocaleString()}`, icon: TrendingUp, color: '#D4841A' },
          { label: 'Favorite Vendors', value: customer.favoriteVendorIds.length.toString(), icon: Heart, color: '#C0553F' },
          { label: 'Avg Order Value', value: `TZS ${avgOrderValue.toLocaleString()}`, icon: CreditCard, color: '#1F5ECC' },
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
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
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
                { label: 'Full Name', value: customer.name },
                { label: 'Email', value: customer.email, icon: Mail },
                { label: 'Phone', value: customer.phone, icon: Phone },
                { label: 'Auth Provider', value: customer.authProvider === 'google' ? 'Google Sign-In' : 'Email & Password', icon: Shield },
                { label: 'Registered', value: new Date(customer.registeredAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: Clock },
                { label: 'Last Login', value: new Date(customer.lastLoginAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), icon: Clock },
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

          {/* Addresses */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 16 }}>Saved Addresses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.addresses.length > 0 ? customer.addresses.map((addr) => (
                <div key={addr.label} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '12px 14px', borderRadius: 10,
                  background: '#FAF7F1', border: '1px solid #EDE7D9',
                }}>
                  <MapPin size={14} style={{ color: '#1A5C58', marginTop: 2, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#1A5C58' }}>{addr.label}</div>
                    <div style={{ fontSize: 13, color: '#2C3E50', marginTop: 2 }}>{addr.line}</div>
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: 13, color: '#94A3B8' }}>No saved addresses</p>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 16 }}>Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.preferences.map((pref) => (
                <div key={pref.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', borderRadius: 10,
                  background: '#FAF7F1', border: '1px solid #EDE7D9',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50' }}>{pref.label}</span>
                  <span style={{
                    width: 36, height: 20, borderRadius: 999,
                    background: pref.enabled ? '#1A5C58' : '#D7D2C6',
                    display: 'flex', alignItems: 'center', padding: 2,
                    justifyContent: pref.enabled ? 'flex-end' : 'flex-start',
                    cursor: 'pointer',
                  }}>
                    <span style={{
                      width: 16, height: 16, borderRadius: 999,
                      background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }} />
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment methods */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 16 }}>Payment Methods</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {customer.paymentMethods.length > 0 ? customer.paymentMethods.map((pm) => (
                <div key={pm.label} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10,
                  background: '#FAF7F1', border: '1px solid #EDE7D9',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: '#E8F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A5C58',
                  }}>
                    <CreditCard size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{pm.label}</div>
                    {pm.last4 && (
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>**** {pm.last4}</div>
                    )}
                  </div>
                  <Check size={14} style={{ color: '#1A7A5C' }} />
                </div>
              )) : (
                <p style={{ fontSize: 13, color: '#94A3B8' }}>No payment methods on file</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== Orders Tab ===== */}
      {activeTab === 'orders' && (
        <div className="data-table-card">
          <div className="dt-head">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="dt-title">Order History</span>
              <span className="dt-sub">{orders.length} orders</span>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Date</th>
                <th>Payment</th>
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
                    <td>
                      <span style={{
                        fontSize: 13, fontWeight: 600,
                        color: vendorColors[order.vendor] || '#64748B',
                      }}>
                        {order.vendor}
                      </span>
                    </td>
                    <td style={{ color: '#64748B', fontSize: 12 }}>{order.items}</td>
                    <td style={{ color: '#64748B' }}>{order.date}</td>
                    <td>
                      <span style={{
                        fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 999,
                        background: '#F1F5F9', color: '#64748B',
                      }}>
                        {order.payment}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill" style={{ background: sc.bg, color: sc.fg, fontSize: 10 }}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>TZS {order.total.toLocaleString()}</td>
                  </tr>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#94A3B8', fontSize: 13 }}>
                    No orders found for this customer
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="dt-footer">Order history for {customer.name}</div>
        </div>
      )}

      {/* ===== Favorite Vendors Tab ===== */}
      {activeTab === 'favorites' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 }}>
          {favVendors.map((vendor) => {
            const vc = vendorColors[vendor.name] || '#1A5C58'
            return (
              <div key={vendor.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Vendor header */}
                <div style={{
                  padding: '16px 20px', borderBottom: '1px solid #F5F0E8',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: vc, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFFFFF', fontSize: 16, fontWeight: 800,
                  }}>
                    {vendor.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#2C3E50' }}>{vendor.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Star size={12} style={{ color: '#D4841A', fill: '#D4841A' }} />
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50' }}>{vendor.rating}</span>
                    </div>
                  </div>
                  <Heart size={18} style={{ color: '#C0553F', fill: '#C0553F' }} />
                </div>

                {/* Vendor stats */}
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: vc }}>{vendor.ordersCount}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Orders</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#2C3E50' }}>TZS {vendor.totalSpent.toLocaleString()}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Total Spent</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>{vendor.lastOrderDate}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 2 }}>Last Order</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {favVendors.length === 0 && (
            <div className="panel" style={{ padding: 48, textAlign: 'center', gridColumn: 'span 2' }}>
              <Heart size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No favorite vendors</p>
              <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>This client hasn't favorited any vendors yet</p>
            </div>
          )}
        </div>
      )}

      {/* Vendor Application Modal */}
      {showVendorApp && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowVendorApp(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 440,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: '#E8F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A5C58',
              }}>
                <Store size={20} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50' }}>Apply as Vendor</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Submit your vendor application</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Office / Shop Name', key: 'officeName', placeholder: 'e.g. Koroma Cleaners' },
                { label: 'Office Location', key: 'officeLocation', placeholder: 'e.g. 12 Chole Road, Masaki' },
                { label: 'Contact Phone (WhatsApp / Call)', key: 'contactPhone', placeholder: '+255 723 456 789' },
                { label: 'WhatsApp Number', key: 'contactWhatsApp', placeholder: '+255 723 456 789' },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>
                    {f.label}
                  </label>
                  <input
                    value={(vendorApp as any)[f.key]}
                    onChange={(e) => setVendorApp((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{
                      width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                      padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none',
                    }}
                  />
                </div>
              ))}
              <div style={{
                padding: '10px 12px', borderRadius: 8, background: '#FFF9EF', border: '1px solid #FDF3E3',
                fontSize: 12, color: '#64748B', lineHeight: 1.5,
              }}>
                <span style={{ fontWeight: 700, color: '#D4841A' }}>Note:</span> After approval, your account will be upgraded to a vendor account with the same login credentials.
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setShowVendorApp(false)}
                style={{
                  padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B',
                  background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!vendorApp.officeName.trim()) return
                  addApplication({
                    clientId: id || '',
                    clientName: customer.name,
                    clientEmail: customer.email,
                    clientPhone: customer.phone,
                    officeName: vendorApp.officeName,
                    officeLocation: vendorApp.officeLocation,
                    contactPhone: vendorApp.contactPhone,
                    contactWhatsApp: vendorApp.contactWhatsApp,
                    plan: 'basic',
                  })
                  setShowVendorApp(false)
                  setVendorApp({ officeName: '', officeLocation: '', contactPhone: '', contactWhatsApp: '' })
                }}
                style={{
                  padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF',
                  background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer',
                }}
              >
                Submit Application
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
