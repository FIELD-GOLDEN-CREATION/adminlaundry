import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  ArrowLeft, User, Store, Truck, Phone, Mail, MapPin,
  Clock, CreditCard, Check, Package, Loader2, AlertCircle,
} from 'lucide-react'
import { formatCurrency, formatTime } from '@/lib/utils'
import { adminApi } from '@/services/api'

interface OrderLine {
  id: number
  name: string
  qty: number
  unit_price_tzs: number
  total_tzs: number
}

interface TrackingStep {
  step_index: number
  title: string
  time_label: string | null
  completed_at: string | null
  created_at: string
}

interface OrderData {
  id: number
  shop_id: number
  customer_id: number
  status: string
  payment_status: string
  total_tzs: number
  delivery_fee_tzs: number
  delivery_address: string | null
  note: string | null
  created_at: string
  shop: { name: string; [key: string]: unknown }
  customer: { name: string; email: string; phone: string; [key: string]: unknown }
  driver: { name: string; phone?: string; [key: string]: unknown } | null
  lines: OrderLine[]
  addons: unknown[]
  tracking: TrackingStep[]
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
  confirmed: { bg: '#E3EEFF', fg: '#1F5ECC' },
  processing: { bg: '#E3EEFF', fg: '#1F5ECC' },
  picked_up: { bg: '#E3EEFF', fg: '#1F5ECC' },
  washing: { bg: '#E3EEFF', fg: '#1F5ECC' },
  sorting: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ironing: { bg: '#E3EEFF', fg: '#1F5ECC' },
}

const trackingStatusLabels: Record<string, string> = {
  pending: 'Order placed',
  confirmed: 'Order confirmed',
  picked_up: 'Picked up',
  sorting: 'Sorted & counted',
  washing: 'Washing in progress',
  ironing: 'Ironing',
  ready: 'Ready for delivery',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const vendorColor = '#1A5C58'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    adminApi.getOrder(id)
      .then((res) => {
        setOrderData(res.data.data)
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Failed to load order')
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  if (loading) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 16,
      }}>
        <Loader2 size={32} style={{ color: '#1A5C58', animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: 14, color: '#64748B', fontWeight: 600 }}>Loading order details...</div>
      </div>
    )
  }

  if (error || !orderData) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', gap: 16,
      }}>
        <AlertCircle size={32} style={{ color: '#C0553F' }} />
        <div style={{ fontSize: 14, color: '#C0553F', fontWeight: 600 }}>{error || 'Order not found'}</div>
        <button
          onClick={() => navigate('/orders')}
          style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#64748B',
            background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}
        >
          Back to Orders
        </button>
      </div>
    )
  }

  const order = orderData
  const client = order.customer
  const shop = order.shop
  const driver = order.driver
  const lines = order.lines
  const tracking = order.tracking || []

  const sc = statusColors[order.status] || statusColors.pending
  const subtotal = lines.reduce((sum, l) => sum + l.total_tzs, 0)

  const createdDate = new Date(order.created_at)
  const formattedDate = createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  const formattedTime = formatTime(order.created_at)

  const steps = tracking.map((t, i) => {
    const isLast = i === tracking.length - 1
    return {
      title: t.title,
      time: t.time_label || formatTime(t.completed_at || t.created_at),
      done: !isLast,
      current: isLast,
    }
  })

  if (steps.length === 0) {
    steps.push(
      { title: 'Order placed', time: `${formattedDate} ${formattedTime}`, done: true, current: false },
      { title: trackingStatusLabels[order.status] || order.status.replace(/_/g, ' '), time: 'Current', done: false, current: true },
    )
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/orders" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Orders</a></li>
          <li className="sep">/</li>
          <li className="current">#{order.id}</li>
        </ol>
        <button
          onClick={() => navigate('/orders')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>

      {/* Order header */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A5C58 0%, #0F423F 100%)',
          padding: '20px 24px', color: '#F5F0E8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Order #{order.id}</h1>
              <span style={{
                padding: '3px 10px', borderRadius: 999,
                background: sc.bg, color: sc.fg,
                fontSize: 11, fontWeight: 700,
              }}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', marginTop: 4 }}>
              {formattedDate} at {formattedTime}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>
              {formatCurrency(order.total_tzs)}
            </div>
          </div>
        </div>
      </div>

      {/* Main content: 2 columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Order Tracking */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 16 }}>Order Tracking</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {steps.map((step, i) => {
                const isLast = i === steps.length - 1
                return (
                  <div key={i} style={{ display: 'flex', gap: 14 }}>
                    {/* Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: 999, flexShrink: 0,
                        background: step.done ? '#1A5C58' : step.current ? '#1A5C58' : '#EDE7D9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: step.current ? '3px solid #E8F2F1' : 'none',
                      }}>
                        {step.done && <Check size={12} style={{ color: '#FFFFFF' }} />}
                        {step.current && !step.done && (
                          <div style={{ width: 8, height: 8, borderRadius: 999, background: '#FFFFFF' }} />
                        )}
                      </div>
                      {!isLast && (
                        <div style={{
                          width: 2, flex: 1, minHeight: 32,
                          background: step.done ? '#1A5C58' : '#EDE7D9',
                        }} />
                      )}
                    </div>
                    {/* Content */}
                    <div style={{ paddingBottom: isLast ? 0 : 16, flex: 1 }}>
                      <div style={{
                        fontSize: 13, fontWeight: 700,
                        color: step.done || step.current ? '#2C3E50' : '#94A3B8',
                      }}>
                        {step.title}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: step.done || step.current ? '#64748B' : '#CBD5E1',
                        marginTop: 2,
                      }}>
                        {step.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items */}
          <div className="panel" style={{ padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE7D9' }}>
              <div className="panel-title">Items</div>
              <div className="panel-sub">{lines.length} line items</div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Unit Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id}>
                    <td style={{ fontWeight: 600, color: '#2C3E50' }}>{line.name}</td>
                    <td style={{ textAlign: 'center', color: '#64748B' }}>{line.qty}</td>
                    <td style={{ textAlign: 'right', color: '#64748B' }}>{formatCurrency(line.unit_price_tzs)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#2C3E50' }}>
                      {formatCurrency(line.total_tzs)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Summary */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #EDE7D9', background: '#FAF7F1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Subtotal</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#64748B' }}>Delivery fee</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(order.delivery_fee_tzs)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #EDE7D9' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(order.total_tzs)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Client details */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#E8F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#1A5C58',
              }}>
                <User size={18} />
              </div>
              <div>
                <div className="panel-title" style={{ marginBottom: 0 }}>Client</div>
                <div className="panel-sub" style={{ marginTop: 0 }}>Customer details</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Name', value: client.name },
                { label: 'Email', value: client.email, icon: Mail },
                { label: 'Phone', value: client.phone, icon: Phone },
                { label: 'Address', value: order.delivery_address || 'N/A', icon: MapPin },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {f.icon && <f.icon size={13} style={{ color: '#64748B', marginTop: 3, flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vendor details */}
          <div className="panel" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: vendorColor, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#FFFFFF',
              }}>
                <Store size={18} />
              </div>
              <div>
                <div className="panel-title" style={{ marginBottom: 0 }}>Vendor</div>
                <div className="panel-sub" style={{ marginTop: 0 }}>Laundry service</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Name', value: shop.name },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{f.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Driver details (if driver exists) */}
          {driver && (
            <div className="panel" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: '#FDE8D4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#CF6A2C',
                }}>
                  <Truck size={18} />
                </div>
                <div>
                  <div className="panel-title" style={{ marginBottom: 0 }}>Driver</div>
                  <div className="panel-sub" style={{ marginTop: 0 }}>Delivery partner</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Name', value: driver.name },
                  ...(driver.phone ? [{ label: 'Phone', value: driver.phone, icon: Phone }] : []),
                ].map((f) => (
                  <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {f.icon && <f.icon size={13} style={{ color: '#64748B', marginTop: 3, flexShrink: 0 }} />}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {f.label}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{f.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              {driver.phone && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                  <a href={`tel:${driver.phone}`} style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 0', fontSize: 12, fontWeight: 700, color: '#CF6A2C',
                    border: '1px solid #FDE8D4', borderRadius: 8,
                    background: '#FFFFFF', textDecoration: 'none',
                  }}>
                    <Phone size={13} /> Call Driver
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Order Info */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 14 }}>Order Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Payment Status', value: order.payment_status?.replace(/_/g, ' ') || 'N/A', icon: CreditCard },
                { label: 'Delivery Address', value: order.delivery_address || 'N/A', icon: MapPin },
              ].map((f) => (
                <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  {f.icon && <f.icon size={13} style={{ color: '#64748B', marginTop: 3, flexShrink: 0 }} />}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {f.label}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{f.value}</div>
                  </div>
                </div>
              ))}
              {order.note && (
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: '#FFF9EF', border: '1px solid #FDF3E3',
                  fontSize: 12, color: '#64748B', lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700, color: '#D4841A' }}>Note:</span> {order.note}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
