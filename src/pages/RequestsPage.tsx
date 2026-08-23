import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check, X, Trash2, Store, Phone, Mail, MapPin, Clock,
  User, MessageCircle, Filter, CreditCard,
} from 'lucide-react'
import { useVendorApplications } from '@/contexts/VendorApplicationContext'

const statusConfig: Record<string, { bg: string; fg: string; label: string }> = {
  pending: { bg: '#FDF3E3', fg: '#D4841A', label: 'Pending Review' },
  approved: { bg: '#DFF5ED', fg: '#1A7A5C', label: 'Approved' },
  rejected: { bg: '#F3D5CE', fg: '#C0553F', label: 'Rejected' },
}

const planConfig: Record<string, { bg: string; fg: string; label: string }> = {
  basic: { bg: '#F1F5F9', fg: '#64748B', label: 'Basic' },
  pro: { bg: '#E8F2F1', fg: '#1A5C58', label: 'Pro' },
  enterprise: { bg: '#FDF3E3', fg: '#D4841A', label: 'Enterprise' },
}

export default function RequestsPage() {
  const navigate = useNavigate()
  const { applications, approveApplication, rejectApplication, deleteApplication } = useVendorApplications()
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filtered = applications.filter((a) => filter === 'all' || a.status === filter)

  const counts = {
    all: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Requests</li>
        </ol>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        {[
          { label: 'Total Applications', value: String(counts.all), color: '#E8F2F1' },
          { label: 'Pending Review', value: String(counts.pending), color: '#FDF3E3' },
          { label: 'Approved', value: String(counts.approved), color: '#DFF5ED' },
          { label: 'Rejected', value: String(counts.rejected), color: '#F3D5CE' },
        ].map((stat) => (
          <div key={stat.label} className="stat-tile" style={{ '--tile-bg': stat.color } as React.CSSProperties}>
            <div className="st-value">{stat.value}</div>
            <div className="st-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #EDE7D9',
        background: '#FFFFFF', borderRadius: '14px 14px 0 0', padding: '0 16px',
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
      }}>
        {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '14px 16px', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
              color: filter === tab ? '#1A5C58' : '#64748B',
              borderBottom: filter === tab ? '2px solid #1A5C58' : '2px solid transparent',
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {tab === 'all' ? 'All' : statusConfig[tab].label}
            <span style={{
              padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              background: filter === tab ? '#1A5C5820' : '#F1F5F9',
              color: filter === tab ? '#1A5C58' : '#64748B',
            }}>
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Applications cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
        {filtered.map((app) => {
          const sc = statusConfig[app.status]
          return (
            <div key={app.id} className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderBottom: '1px solid #F5F0E8',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: '#E8F2F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#1A5C58', fontSize: 15, fontWeight: 800,
                  }}>
                    {app.clientName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{app.clientName}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 1 }}>
                      Applied {new Date(app.submittedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span style={{
                  padding: '3px 10px', borderRadius: 999,
                  background: sc.bg, color: sc.fg,
                  fontSize: 11, fontWeight: 700,
                }}>
                  {sc.label}
                </span>
              </div>

              {/* Card body */}
              <div style={{ padding: '14px 18px' }}>
                {/* Office info */}
                <div style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: '#FAF7F1', border: '1px solid #EDE7D9',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Store size={15} style={{ color: '#1A5C58' }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#2C3E50' }}>{app.officeName}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <MapPin size={13} style={{ color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Office Location</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{app.officeLocation}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <Phone size={13} style={{ color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Contact Phone</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{app.contactPhone}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <MessageCircle size={13} style={{ color: '#64748B', marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WhatsApp</div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#2C3E50', marginTop: 1 }}>{app.contactWhatsApp}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                  {[
                    { label: 'Email', value: app.clientEmail, icon: Mail },
                    { label: 'Phone', value: app.clientPhone, icon: Phone },
                  ].map((f) => (
                    <div key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <f.icon size={12} style={{ color: '#64748B', flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: '#64748B' }}>{f.value}</span>
                    </div>
                  ))}
                </div>

                {/* Plan */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                  borderRadius: 8, background: '#FAF7F1', border: '1px solid #EDE7D9',
                  marginBottom: 14,
                }}>
                  <CreditCard size={14} style={{ color: '#64748B', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plan</span>
                  <span
                    className="status-pill"
                    style={{
                      marginLeft: 'auto',
                      background: planConfig[app.plan || 'basic']?.bg || '#F1F5F9',
                      color: planConfig[app.plan || 'basic']?.fg || '#64748B',
                      fontSize: 11,
                    }}
                  >
                    {planConfig[app.plan || 'basic']?.label || 'Basic'}
                  </span>
                </div>

                {/* Action buttons */}
                {app.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => approveApplication(app.id)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', fontSize: 12, fontWeight: 700, color: '#FFFFFF',
                        background: '#1A5C58', border: 'none', borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      <Check size={14} /> Approve
                    </button>
                    <button
                      onClick={() => rejectApplication(app.id)}
                      style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 0', fontSize: 12, fontWeight: 700, color: '#C0553F',
                        background: '#F3D5CE', border: 'none', borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      <X size={14} /> Reject
                    </button>
                    <button
                      onClick={() => { if (confirm('Delete this application?')) deleteApplication(app.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '9px 12px', fontSize: 12, fontWeight: 700, color: '#64748B',
                        background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                {app.status !== 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { if (confirm('Delete this application?')) deleteApplication(app.id) }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 14px', fontSize: 12, fontWeight: 700, color: '#64748B',
                        background: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="panel" style={{ padding: 48, textAlign: 'center', gridColumn: 'span 3' }}>
            <Store size={32} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, fontWeight: 600, color: '#64748B' }}>No applications found</p>
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
              {filter === 'all' ? 'No vendor applications yet' : `No ${filter} applications`}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
