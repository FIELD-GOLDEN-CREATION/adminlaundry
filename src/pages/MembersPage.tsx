import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { adminApi } from '@/services/api'
import type { User, UserRole } from '@/types'

const roleTabs = [
  { id: 'vendors', role: 'vendor' as UserRole, label: 'Vendors' },
  { id: 'staff', role: 'staff' as UserRole, label: 'Staff' },
  { id: 'clients', role: 'customer' as UserRole, label: 'Clients' },
]

const mockUsers: User[] = [
  { id: 1, name: 'Marina Fresh', email: 'marina@freshfold.com', role: 'vendor', created_at: '2024-01-10', plan: 'pro' },
  { id: 2, name: 'Bright & Fold', email: 'bright@freshfold.com', role: 'vendor', created_at: '2024-01-08', plan: 'enterprise' },
  { id: 3, name: 'Daniel Kimani', email: 'daniel@freshfold.com', role: 'staff', created_at: '2024-01-12', phone: '+255 744 418 820' },
  { id: 4, name: 'Kofi Asante', email: 'kofi@freshfold.com', role: 'staff', created_at: '2024-01-11', phone: '+255 731 234 567' },
  { id: 5, name: 'Amara Koroma', email: 'amara@email.com', role: 'customer', created_at: '2024-01-15' },
  { id: 6, name: 'Jabari Mensah', email: 'jabari@email.com', role: 'customer', created_at: '2024-01-14' },
]

const roleColors: Record<string, string> = {
  vendor: '#E8F2F1', staff: '#FDF3E3', customer: '#E3EEFF',
}

const planColors: Record<string, { bg: string; fg: string }> = {
  basic: { bg: '#F1F5F9', fg: '#64748B' },
  pro: { bg: '#E8F2F1', fg: '#1A5C58' },
  enterprise: { bg: '#FDF3E3', fg: '#D4841A' },
}

export default function MembersPage() {
  const { role } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(role || 'vendors')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '', plan: 'basic' })

  useEffect(() => { if (role) setActiveTab(role) }, [role])

  const currentRole = roleTabs.find((t) => t.id === activeTab)?.role || 'vendor'
  const filteredUsers = users.filter(
    (u) => u.role === currentRole && (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateUser = async () => {
    try {
      const response = await adminApi.createUser({ ...newUser, role: currentRole })
      setUsers((prev) => [...prev, response.data.data || response.data.user])
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', phone: '', plan: 'basic' })
    } catch (err) { console.error('Failed to create user:', err) }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) { console.error('Failed to delete user:', err) }
  }

  const handleRowClick = (user: User) => {
    if (user.role === 'vendor') navigate(`/members/vendors/${user.id}`)
    else if (user.role === 'customer') navigate(`/members/clients/${user.id}`)
    else if (user.role === 'staff') navigate(`/members/staff/${user.id}`)
  }

  return (
    <div>
      {/* Title card */}
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
          <Plus size={14} /> Add {roleTabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
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

      {/* Search */}
      <div className="search-box" style={{ maxWidth: 320, margin: '16px 0' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        <input
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="data-table-card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              {currentRole === 'vendor' && <th>Plan</th>}
              <th>Joined</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr
                key={user.id}
                style={{ cursor: 'pointer' }}
                onClick={() => handleRowClick(user)}
              >
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="avatar-chip" style={{ width: 30, height: 30, fontSize: 12 }}>
                      {user.name.charAt(0)}
                    </div>
                    <span style={{ fontWeight: 600, color: '#2C3E50', fontSize: 13 }}>{user.name}</span>
                  </div>
                </td>
                <td style={{ color: '#64748B', fontSize: 13 }}>{user.email}</td>
                <td>
                  <span
                    className="status-pill"
                    style={{ background: roleColors[user.role] || '#F1F5F9', color: '#2C3E50' }}
                  >
                    {user.role}
                  </span>
                </td>
                {currentRole === 'vendor' && (
                  <td>
                    <span
                      className="status-pill"
                      style={{
                        background: planColors[user.plan || 'basic']?.bg || '#F1F5F9',
                        color: planColors[user.plan || 'basic']?.fg || '#64748B',
                      }}
                    >
                      {user.plan || 'basic'}
                    </span>
                  </td>
                )}
                <td style={{ color: '#64748B', fontSize: 13 }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    style={{
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      color: '#64748B', padding: 6, borderRadius: 6,
                    }}
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={currentRole === 'vendor' ? 6 : 5} style={{ textAlign: 'center', padding: 32, color: '#64748B', fontStyle: 'italic' }}>
                  No {activeTab} found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="dt-footer">
          {filteredUsers.length === 0 ? 'No records' : `Showing ${filteredUsers.length} ${activeTab}`}
        </div>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50 }}
            onClick={() => setShowCreateModal(false)}
          />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxWidth: 420,
            zIndex: 51, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#2C3E50', marginBottom: 16 }}>
              Add {roleTabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
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
                      outline: 'none',
                    }}
                  />
                </div>
              ))}
              {currentRole === 'vendor' && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>
                    Subscription Plan
                  </label>
                  <select
                    value={newUser.plan}
                    onChange={(e) => setNewUser((p) => ({ ...p, plan: e.target.value }))}
                    style={{
                      width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                      padding: '4px 10px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
                      outline: 'none',
                    }}
                  >
                    <option value="basic">Basic (Free — 30 orders/mo)</option>
                    <option value="pro">Pro (TZS 75,000/mo — Unlimited orders)</option>
                    <option value="enterprise">Enterprise (TZS 200,000/mo — Multi-location)</option>
                  </select>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => setShowCreateModal(false)}
                style={{
                  padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B',
                  background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                style={{
                  padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF',
                  background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer',
                }}
              >
                Create
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
