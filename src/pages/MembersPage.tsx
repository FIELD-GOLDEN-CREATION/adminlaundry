import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Store, RefreshCw, Users, UserCheck } from 'lucide-react'
import { adminApi } from '@/services/api'
import type { User, UserRole } from '@/types'

const roleTabs = [
  { id: 'vendors', role: 'vendor' as UserRole, label: 'Vendors' },
  { id: 'staff', role: 'staff' as UserRole, label: 'Staff' },
  { id: 'clients', role: 'customer' as UserRole, label: 'Clients' },
]

interface ShopRow {
  id: number
  name: string
  slug: string
  owner?: { name?: string; email?: string }
  owner_name?: string
  owner_email?: string
  address?: string
  phone?: string
  status: string
  is_active: boolean
  is_open: boolean
  total_orders: number
  balance: number
  created_at: string
}

export default function MembersPage() {
  const { role } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(role || 'vendors')
  const [searchQuery, setSearchQuery] = useState('')
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [shops, setShops] = useState<ShopRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')

  useEffect(() => { if (role) setActiveTab(role) }, [role])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      if (activeTab === 'vendors') {
        const res = await adminApi.getShops()
        const d = res.data.data
        setShops(Array.isArray(d) ? d : (d?.data || []))
      } else {
        const res = await adminApi.getUsers()
        const d = res.data
        const list = d.users || d.data
        setAllUsers(Array.isArray(list) ? list : (list?.data || []))
      }
    } catch (err: any) {
      console.error('Failed to load data:', err)
      if (err?.response?.status === 401) {
        setError('Session expired. Please log in again.')
      } else {
        setError('Failed to load data from server. Check your connection.')
      }
    } finally {
      setLoading(false)
    }
  }, [activeTab])

  useEffect(() => { loadData() }, [loadData])

  const filteredUsers = allUsers.filter(
    (u) => u.role === activeTab.replace('clients', 'customer') &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredShops = shops.filter(
    (s) => (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.owner_email || '').toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const roleCounts = {
    customers: allUsers.filter((u) => u.role === 'customer').length,
    staff: allUsers.filter((u) => u.role === 'staff').length,
    vendors: allUsers.filter((u) => u.role === 'vendor').length,
  }

  const handleCreateUser = async () => {
    setError('')
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Name, email, and password are required.')
      return
    }
    try {
      await adminApi.createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone || undefined,
        role: activeTab === 'clients' ? 'customer' : (activeTab === 'vendors' ? 'vendor' : 'staff'),
      })
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', phone: '' })
      loadData()
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.email?.[0] || 'Failed to create user.'
      setError(msg)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await adminApi.deleteUser(id)
      setAllUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) { console.error('Failed to delete user:', err) }
  }

  const handleDeleteShop = async (id: number) => {
    if (!confirm('Are you sure you want to delete this shop?')) return
    try {
      await adminApi.deleteShop(id)
      setShops((prev) => prev.filter((s) => s.id !== id))
    } catch (err) { console.error('Failed to delete shop:', err) }
  }

  const handleRowClick = (user: User) => {
    if (user.role === 'vendor') navigate(`/members/vendors/${user.id}`)
    else if (user.role === 'customer') navigate(`/members/clients/${user.id}`)
    else if (user.role === 'staff') navigate(`/members/staff/${user.id}`)
  }

  const isVendors = activeTab === 'vendors'

  return (
    <div>
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Members</li>
        </ol>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={loadData}
            disabled={loading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#64748B', background: '#FFFFFF',
              border: '1px solid #EDE7D9', borderRadius: 9, cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
              fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
              border: 'none', borderRadius: 9, cursor: 'pointer',
            }}
          >
            <Plus size={14} /> {isVendors ? 'Add Vendor' : activeTab === 'staff' ? 'Add Staff' : 'Add Client'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #EDE7D9',
        background: '#FFFFFF', borderRadius: '14px 14px 0 0', padding: '0 16px',
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
      }}>
        {roleTabs.map((tab) => {
          const count = tab.id === 'vendors' ? shops.length : tab.id === 'staff' ? roleCounts.staff : roleCounts.customers
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setError(''); }}
              style={{
                padding: '14px 16px', fontSize: 13, fontWeight: 600,
                color: activeTab === tab.id ? '#1A5C58' : '#64748B',
                borderBottom: activeTab === tab.id ? '2px solid #1A5C58' : '2px solid transparent',
                background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 10,
                background: activeTab === tab.id ? '#1A5C58' : '#E2E8F0',
                color: activeTab === tab.id ? '#FFFFFF' : '#64748B',
              }}>
                {loading ? '...' : count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Summary */}
      <div style={{ display: 'flex', gap: 14, marginTop: 14 }}>
        {isVendors ? (
          <div className="panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Store size={18} style={{ color: '#1A5C58' }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1A5C58' }}>{loading ? '...' : filteredShops.length}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>Active Shops</div>
            </div>
          </div>
        ) : (
          <div className="panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
            {activeTab === 'staff' ? <UserCheck size={18} style={{ color: '#1A5C58' }} /> : <Users size={18} style={{ color: '#1A5C58' }} />}
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#1A5C58' }}>{loading ? '...' : filteredUsers.length}</div>
              <div style={{ fontSize: 12, color: '#64748B' }}>{activeTab === 'staff' ? 'Staff Members' : 'Registered Clients'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="search-box" style={{ maxWidth: 320, margin: '16px 0' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          placeholder={`Search ${isVendors ? 'vendors' : activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error && (
        <div style={{ padding: '10px 14px', marginBottom: 12, background: '#FEE2E2', color: '#991B1B', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="data-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748B' }}>Loading...</div>
        ) : isVendors ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Shop Name</th>
                <th>Owner</th>
                <th>Status</th>
                <th>Open/Closed</th>
                <th>Orders</th>
                <th>Balance</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((shop) => (
                <tr key={shop.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/members/vendors/${shop.id}`)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-chip" style={{ width: 30, height: 30, fontSize: 12, background: '#E8F2F1', color: '#1A5C58' }}>
                        {shop.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#2C3E50', fontSize: 13 }}>{shop.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{shop.owner?.name || shop.owner_name || '—'}</td>
                  <td>
                    <span className="status-pill" style={{
                      background: (shop.status === 'active' || shop.is_active) ? '#DFF5ED' : shop.status === 'suspended' ? '#F3D5CE' : '#FDF3E3',
                      color: (shop.status === 'active' || shop.is_active) ? '#1A7A5C' : shop.status === 'suspended' ? '#C0553F' : '#D4841A',
                    }}>
                      {shop.status ? shop.status.charAt(0).toUpperCase() + shop.status.slice(1) : shop.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className="status-pill" style={{
                      background: shop.is_open ? '#DFF5ED' : '#F3D5CE',
                      color: shop.is_open ? '#1A7A5C' : '#C0553F',
                    }}>
                      {shop.is_open ? 'Open' : 'Closed'}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{shop.total_orders ?? 0}</td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>TZS {(shop.balance ?? 0).toLocaleString()}</td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{shop.created_at ? new Date(shop.created_at).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDeleteShop(shop.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: 6, borderRadius: 6 }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredShops.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>No vendors found</td></tr>
              )}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(user)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="avatar-chip" style={{ width: 30, height: 30, fontSize: 12 }}>
                        {user.name.charAt(0)}
                      </div>
                      <span style={{ fontWeight: 600, color: '#2C3E50', fontSize: 13 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{user.email}</td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{user.phone || '—'}</td>
                  <td>
                    <span className="status-pill" style={{
                      background: user.role === 'customer' ? '#E3EEFF' : user.role === 'vendor' ? '#E8F2F1' : '#FDF3E3',
                      color: user.role === 'customer' ? '#2563EB' : user.role === 'vendor' ? '#1A5C58' : '#D4841A',
                      fontSize: 11,
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ color: '#64748B', fontSize: 13 }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: 6, borderRadius: 6 }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>
                  No {activeTab === 'clients' ? 'clients' : 'staff'} found. {activeTab === 'clients' ? 'New registrations from the app will appear here.' : ''}
                </td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="dt-footer">
          {loading ? 'Loading...' : isVendors ? `${filteredShops.length} vendors` : `${filteredUsers.length} ${activeTab === 'clients' ? 'clients' : 'staff'}`}
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <>
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }} onClick={() => setShowCreateModal(false)} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>
              Add {activeTab === 'vendors' ? 'Vendor' : activeTab === 'staff' ? 'Staff' : 'Client'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Password', key: 'password', type: 'password' },
                { label: 'Phone (optional)', key: 'phone', type: 'tel' },
              ].map((field) => (
                <div key={field.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={(newUser as any)[field.key]}
                    onChange={(e) => setNewUser((p) => ({ ...p, [field.key]: e.target.value }))}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    style={{
                      width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                      padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
                      outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => { setShowCreateModal(false); setError(''); }} style={{
                padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B',
                background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button onClick={handleCreateUser} style={{
                padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
                border: 'none', borderRadius: 9, cursor: 'pointer',
              }}>
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
