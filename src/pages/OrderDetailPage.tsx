import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Store, Truck, Phone, Mail, MapPin,
  Clock, CreditCard, Check, Package,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface OrderLine {
  name: string
  qty: number
  unitPrice: number
}

interface TrackStep {
  title: string
  time: string
  done: boolean
  current: boolean
}

const mockOrder = {
  id: '#4523',
  date: '2026-08-21',
  time: '9:12 AM',
  status: 'in_wash',
  fulfillment: 'delivery' as const,
  paymentMethod: 'Mobile money - M-Pesa',
  pickupAddress: '12 Chole Road, Masaki, Apt 4B',
  pickupWindow: 'Thu 21, 6 - 8 PM',
  deliveryFee: 3000,
  notes: 'Please handle delicate items with care',
}

const mockClient = {
  name: 'Amara Koroma',
  email: 'amara@email.com',
  phone: '+255 723 456 789',
  address: '12 Chole Road, Masaki, Apt 4B',
}

const mockVendor = {
  name: 'Marina Fresh',
  email: 'marina@freshfold.com',
  phone: '+255 712 345 678',
  location: 'Kariakoo, Dar es Salaam',
  rating: 4.8,
}

const mockDriver = {
  name: 'Daniel Kimani',
  phone: '+255 734 567 890',
  rating: 4.7,
}

const mockLines: OrderLine[] = [
  { name: 'The Student Bag', qty: 1, unitPrice: 34000 },
  { name: 'Ironing', qty: 3, unitPrice: 5200 },
  { name: 'Delicate fabric treatment', qty: 1, unitPrice: 10400 },
]

const mockTrackSteps: TrackStep[] = [
  { title: 'Order placed', time: 'Wed, 8:30 AM', done: true, current: false },
  { title: 'Picked up', time: 'Wed, 9:12 AM', done: true, current: false },
  { title: 'Sorted & counted', time: 'Wed, 10:40 AM', done: true, current: false },
  { title: 'Washing in progress', time: 'Wed, 2:15 PM', done: false, current: true },
  { title: 'Out for delivery', time: 'Est. Thu, 6:00 PM', done: false, current: false },
  { title: 'Delivered', time: '--', done: false, current: false },
]

const statusColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#DFF5ED', fg: '#1A7A5C' },
  out_for_delivery: { bg: '#FDE8D4', fg: '#CF6A2C' },
  delivered: { bg: '#DFF5ED', fg: '#1A7A5C' },
  cancelled: { bg: '#F3D5CE', fg: '#C0553F' },
}

const vendorColor = '#1A5C58'

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const order = mockOrder
  const client = mockClient
  const vendor = mockVendor
  const driver = mockDriver
  const lines = mockLines
  const steps = mockTrackSteps

  const sc = statusColors[order.status] || statusColors.pending
  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0)
  const total = subtotal + order.deliveryFee

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/orders" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Orders</a></li>
          <li className="sep">/</li>
          <li className="current">{order.id}</li>
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
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Order {order.id}</h1>
              <span style={{
                padding: '3px 10px', borderRadius: 999,
                background: sc.bg, color: sc.fg,
                fontSize: 11, fontWeight: 700,
              }}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>
            <div style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)', marginTop: 4 }}>
              {order.date} at {order.time}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(245,240,232,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }}>
              {formatCurrency(total)}
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
                {lines.map((line, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: '#2C3E50' }}>{line.name}</td>
                    <td style={{ textAlign: 'center', color: '#64748B' }}>{line.qty}</td>
                    <td style={{ textAlign: 'right', color: '#64748B' }}>{formatCurrency(line.unitPrice)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#2C3E50' }}>
                      {formatCurrency(line.qty * line.unitPrice)}
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
                <span style={{ fontSize: 13, fontWeight: 600 }}>{formatCurrency(order.deliveryFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #EDE7D9' }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>Total</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#1A5C58' }}>{formatCurrency(total)}</span>
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
                { label: 'Address', value: client.address, icon: MapPin },
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
                { label: 'Name', value: vendor.name },
                { label: 'Email', value: vendor.email, icon: Mail },
                { label: 'Phone', value: vendor.phone, icon: Phone },
                { label: 'Location', value: vendor.location, icon: MapPin },
                { label: 'Rating', value: `${vendor.rating} / 5.0` },
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
            {/* Contact buttons */}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <a href={`mailto:${vendor.email}`} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 0', fontSize: 12, fontWeight: 700, color: vendorColor,
                border: `1px solid ${vendorColor}30`, borderRadius: 8,
                background: '#FFFFFF', textDecoration: 'none',
              }}>
                <Mail size={13} /> Email
              </a>
              <a href={`tel:${vendor.phone}`} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 0', fontSize: 12, fontWeight: 700, color: '#FFFFFF',
                background: vendorColor, borderRadius: 8, textDecoration: 'none',
              }}>
                <Phone size={13} /> Call
              </a>
            </div>
          </div>

          {/* Driver details (if delivery) */}
          {order.fulfillment === 'delivery' && (
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
                  { label: 'Phone', value: driver.phone, icon: Phone },
                  { label: 'Rating', value: `${driver.rating} / 5.0` },
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
            </div>
          )}

          {/* Payment & Delivery info */}
          <div className="panel" style={{ padding: 20 }}>
            <div className="panel-title" style={{ marginBottom: 14 }}>Order Info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Payment', value: order.paymentMethod, icon: CreditCard },
                { label: 'Fulfillment', value: order.fulfillment === 'delivery' ? 'Delivery' : 'Self drop-off', icon: Truck },
                { label: 'Pickup', value: order.pickupWindow, icon: Clock },
                { label: 'Address', value: order.pickupAddress, icon: MapPin },
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
              {order.notes && (
                <div style={{
                  padding: '10px 12px', borderRadius: 8,
                  background: '#FFF9EF', border: '1px solid #FDF3E3',
                  fontSize: 12, color: '#64748B', lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700, color: '#D4841A' }}>Note:</span> {order.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
