import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, User, Phone, Mail, MapPin, Calendar,
  Shield, Clock, Star, Package, Edit2, RotateCcw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StaffDetail {
  id: number
  name: string
  email: string
  phone: string
  branch: string
  address: string
  role: string
  status: string
  joinedDate: string
  shift: string
  ordersCheckedIn: number
  tenure: string
  rating: number
  recentOrders: { id: string; client: string; date: string; total: number }[]
}

const mockStaff: Record<number, StaffDetail> = {
  3: {
    id: 3,
    name: 'Daniel Kimani',
    email: 'daniel@freshfold.com',
    phone: '+255 744 418 820',
    branch: 'Mama Ngina Branch',
    address: '12 Mama Ngina Street, 2nd Floor, Dar es Salaam',
    role: 'Staff',
    status: 'Active',
    joinedDate: '2024-01-12',
    shift: '07:00 - 19:00',
    ordersCheckedIn: 142,
    tenure: '2.1 yrs',
    rating: 4.8,
    recentOrders: [
      { id: '#4523', client: 'Amara Koroma', date: '2026-08-21', total: 45000 },
      { id: '#4519', client: 'Grace T.', date: '2026-08-21', total: 41000 },
      { id: '#4515', client: 'Lila M.', date: '2026-08-20', total: 36000 },
    ],
  },
  4: {
    id: 4,
    name: 'Kofi Asante',
    email: 'kofi@freshfold.com',
    phone: '+255 731 234 567',
    branch: 'Kariakoo Branch',
    address: '27 Kariakoo Street, Ilala, Dar es Salaam',
    role: 'Staff',
    status: 'Active',
    joinedDate: '2024-01-11',
    shift: '08:00 - 20:00',
    ordersCheckedIn: 98,
    tenure: '2.2 yrs',
    rating: 4.6,
    recentOrders: [
      { id: '#4522', client: 'Jabari Mensah', date: '2026-08-21', total: 32000 },
      { id: '#4516', client: 'Kofi A.', date: '2026-08-19', total: 52000 },
    ],
  },
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  Active: { bg: '#DFF5ED', fg: '#1A7A5C' },
  Pending: { bg: '#FDF3E3', fg: '#D4841A' },
  Suspended: { bg: '#F3D5CE', fg: '#C0553F' },
}

export default function StaffDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [newPin, setNewPin] = useState('')
  const [saved, setSaved] = useState(false)

  const staff = mockStaff[Number(id)]

  const handleSaveEdit = () => {
    // In a real app, this would call adminApi.updateUser()
    setShowEditModal(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleResetPin = () => {
    // In a real app, this would call adminApi.updateUser()
    setShowPinModal(false)
    setNewPin('')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (!staff) {
    return (
      <div>
        <div className="title-card">
          <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
            <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
            <li className="sep">/</li>
            <li><a href="/members" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Members</a></li>
            <li className="sep">/</li>
            <li className="current">Staff</li>
          </ol>
        </div>
        <div className="panel" style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: '#64748B', fontSize: 14 }}>Staff member not found.</p>
          <button
            onClick={() => navigate('/members/staff')}
            style={{
              marginTop: 12, padding: '9px 14px', fontSize: 12.5, fontWeight: 700,
              color: '#1A5C58', background: '#E8F2F1', border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            Back to Staff
          </button>
        </div>
      </div>
    )
  }

  const sc = statusColors[staff.status] || statusColors.Active

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li><a href="/members" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Members</a></li>
          <li className="sep">/</li>
          <li><a href="/members/staff" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Staff</a></li>
          <li className="sep">/</li>
          <li className="current">{staff.name}</li>
        </ol>
        <button
          onClick={() => navigate('/members/staff')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
            border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {/* Staff header */}
      <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1A5C58 0%, #0F423F 100%)',
          padding: '20px 24px', color: '#F5F0E8',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'rgba(245,240,232,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700,
            }}>
              {staff.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>{staff.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: sc.bg, color: sc.fg,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {staff.status}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(245,240,232,0.7)' }}>
                  {staff.branch}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                setEditName(staff.name)
                setEditEmail(staff.email)
                setEditPhone(staff.phone)
                setShowEditModal(true)
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                fontSize: 12, fontWeight: 700, color: '#1A5C58', background: '#E8F2F1',
                border: 'none', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <Edit2 size={13} /> Edit
            </button>
            <button
              onClick={() => setShowPinModal(true)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                fontSize: 12, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
                border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
              }}
            >
              <RotateCcw size={13} /> Reset PIN
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Orders Checked In', value: String(staff.ordersCheckedIn), color: '#E8F2F1' },
          { label: 'Staff Tenure', value: staff.tenure, color: '#FDF3E3' },
          { label: 'Customer Rating', value: `${staff.rating} / 5.0`, color: '#E3EEFF' },
          { label: 'Current Shift', value: staff.shift, color: '#F1F5F9' },
        ].map((stat) => (
          <div key={stat.label} className="stat-tile" style={{ '--tile-bg': stat.color } as React.CSSProperties}>
            <div className="st-value">{stat.value}</div>
            <div className="st-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Left: Info */}
        <div className="panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#E8F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1A5C58',
            }}>
              <User size={18} />
            </div>
            <div>
              <div className="panel-title" style={{ marginBottom: 0 }}>Staff Information</div>
              <div className="panel-sub" style={{ marginTop: 0 }}>Personal & work details</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Full Name', value: staff.name, icon: User },
              { label: 'Email', value: staff.email, icon: Mail },
              { label: 'Phone', value: staff.phone, icon: Phone },
              { label: 'Branch', value: staff.branch, icon: MapPin },
              { label: 'Address', value: staff.address, icon: MapPin },
              { label: 'Role', value: staff.role, icon: Shield },
              { label: 'Shift', value: staff.shift, icon: Clock },
              { label: 'Joined', value: new Date(staff.joinedDate).toLocaleDateString(), icon: Calendar },
            ].map((f) => (
              <div key={f.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <f.icon size={14} style={{ color: '#64748B', marginTop: 3, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 2 }}>{f.value}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Contact buttons */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
            <a href={`mailto:${staff.email}`} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', fontSize: 12, fontWeight: 700, color: '#1A5C58',
              border: '1px solid #1A5C5830', borderRadius: 8,
              background: '#FFFFFF', textDecoration: 'none',
            }}>
              <Mail size={13} /> Email
            </a>
            <a href={`tel:${staff.phone}`} style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 0', fontSize: 12, fontWeight: 700, color: '#FFFFFF',
              background: '#1A5C58', borderRadius: 8, textDecoration: 'none',
            }}>
              <Phone size={13} /> Call
            </a>
          </div>
        </div>

        {/* Right: Recent Orders */}
        <div className="panel" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #EDE7D9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: '#FDF3E3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#D4841A',
              }}>
                <Package size={18} />
              </div>
              <div>
                <div className="panel-title" style={{ marginBottom: 0 }}>Recent Orders</div>
                <div className="panel-sub" style={{ marginTop: 0 }}>{staff.recentOrders.length} recent check-ins</div>
              </div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Client</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {staff.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/orders/${order.id.replace('#', '')}`)}
                >
                  <td style={{ fontWeight: 700, color: '#2C3E50' }}>{order.id}</td>
                  <td style={{ color: '#64748B' }}>{order.client}</td>
                  <td style={{ color: '#64748B' }}>{order.date}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#2C3E50' }}>
                    {formatCurrency(order.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div
            className="dt-footer"
            onClick={() => navigate('/orders')}
            style={{ cursor: 'pointer' }}
          >
            View all orders
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowEditModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Edit Staff</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Name</label>
                <input value={editName} onChange={(e) => setEditName(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Email</label>
                <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>Phone</label>
                <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowEditModal(false)} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer' }}>Save</button>
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
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>Reset PIN for {staff.name}</div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>New PIN / Password</label>
              <input type="password" value={newPin} onChange={(e) => setNewPin(e.target.value)} placeholder="Enter new PIN or password" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowPinModal(false)} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleResetPin} disabled={!newPin} style={{ padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: newPin ? '#1A5C58' : '#94A3B8', border: 'none', borderRadius: 9, cursor: newPin ? 'pointer' : 'not-allowed' }}>Reset PIN</button>
            </div>
          </div>
        </>
      )}

      {saved && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1A5C58', color: '#FFFFFF', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          Changes saved
        </div>
      )}
    </div>
  )
}
