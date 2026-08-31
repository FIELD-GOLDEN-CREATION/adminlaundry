import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2, Store } from 'lucide-react'
import { adminApi } from '@/services/api'
import type { User, UserRole } from '@/types'

const roleTabs = [
  { id: 'vendors', role: 'vendor' as UserRole, label: 'Vendors' },
  { id: 'staff', role: 'staff' as UserRole, label: 'Staff' },
  { id: 'clients', role: 'customer' as UserRole, label: 'Clients' },
]

const roleColors: Record<string, string> = {
  vendor: '#E8F2F1', staff: '#FDF3E3', customer: '#E3EEFF',
}

interface ShopRow {
  id: number
  name: string
  slug: string
  owner_name?: string
  owner_email?: string
  address?: string
  phone?: string
  is_active: boolean
  total_orders: number
  balance: number
  created_at: string
}

export default function MembersPage() {
  const { role } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(role || 'vendors')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [shops, setShops] = useState<ShopRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' })
  const [error, setError] = useState('')

  useEffect(() => { if (role) setActiveTab(role) }, [role])

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError('')
      try {
        if (activeTab === 'vendors') {
          const res = await adminApi.getShops()
          setShops(res.data.data || res.data.shops || [])
        } else {
          const res = await adminApi.getUsers()
          const data = res.data
          setUsers(data.users || data.data || [])
        }
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('Failed to load data from server')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [activeTab])

  const filteredUsers = users.filter(
    (u) => u.role === activeTab.replace('clients', 'customer') &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const filteredShops = shops.filter(
    (s) => (s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.owner_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.owner_email || '').toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateUser = async () => {
    setError('')
    if (!newUser.name || !newUser.email || !newUser.password) {
      setError('Name, email, and password are required.')
      return
    }
    try {
      const response = await adminApi.createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        phone: newUser.phone || undefined,
        role: activeTab === 'clients' ? 'customer' : (activeTab === 'vendors' ? 'vendor' : 'staff'),
      })
      const created = response.data.user || response.data.data
      setUsers((prev) => [created, ...prev])
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', phone: '' })
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.errors?.email?.[0] || 'Failed to create user.'
      setError(msg)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
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
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
            fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
            border: 'none', borderRadius: 9, cursor: 'pointer',
          }}
        >
          <Plus size={14} /> {isVendors ? 'Add Vendor' : 'Add User'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #EDE7D9',
        background: '#FFFFFF', borderRadius: '14px 14px 0 0', padding: '0 16px',
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
      }}>
        {roleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setSearchQuery(''); setError(''); }}
            style={{
              padding: '14px 16px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? '#1A5C58' : '#64748B',
              borderBottom: activeTab === tab.id ? '2px solid #1A5C58' : '2px solid transparent',              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
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
          <>
            <div className="panel" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#1A5C58' }}>{loading ? '...' : filteredUsers.length}</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>{activeTab === 'staff' ? 'Staff' : 'Clients'}</div>
              </div>
            </div>
          </>
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
                  <td style={{ color: '#64748B', fontSize: 13 }}>{shop.owner_name || '—'}</td>
                  <td>
                    <span className="status-pill" style={{
                      background: shop.is_active ? '#DFF5ED' : '#F3D5CE',
                      color: shop.is_active ? '#1A7A5C' : '#C0553F',
                    }}>
                      {shop.is_active ? 'Active' : 'Inactive'}
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
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>No vendors found</td></tr>
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
                  <td style={{ color: '#64748B', fontSize: 13 }}>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleDeleteUser(user.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B', padding: 6, borderRadius: 6 }} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>No {activeTab} found</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div className="dt-footer">
          {loading ? 'Loading...' : isVendors ? `${filteredShops.length} vendors` : `${filteredUsers.length} ${activeTab}`}
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
