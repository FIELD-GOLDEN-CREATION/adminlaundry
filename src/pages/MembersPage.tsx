import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Plus, Search, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'
import { adminApi } from '@/services/api'
import type { User, UserRole } from '@/types'

const roleTabs = [
  { id: 'vendors', role: 'vendor' as UserRole, label: 'Vendors' },
  { id: 'drivers', role: 'driver' as UserRole, label: 'Drivers' },
  { id: 'clients', role: 'customer' as UserRole, label: 'Clients' },
]

const mockUsers: User[] = [
  { id: 1, name: 'Marina Fresh', email: 'marina@freshfold.com', role: 'vendor', created_at: '2024-01-10' },
  { id: 2, name: 'Bright & Fold', email: 'bright@freshfold.com', role: 'vendor', created_at: '2024-01-08' },
  { id: 3, name: 'Daniel Kimani', email: 'daniel@freshfold.com', role: 'driver', created_at: '2024-01-12' },
  { id: 4, name: 'Kofi Asante', email: 'kofi@freshfold.com', role: 'driver', created_at: '2024-01-11' },
  { id: 5, name: 'Amara Koroma', email: 'amara@email.com', role: 'customer', created_at: '2024-01-15' },
  { id: 6, name: 'Jabari Mensah', email: 'jabari@email.com', role: 'customer', created_at: '2024-01-14' },
]

const roleColors: Record<string, string> = {
  vendor: 'bg-[#1A5C58]/10 text-[#1A5C58]',
  driver: 'bg-[#D4841A]/10 text-[#D4841A]',
  customer: 'bg-blue-100 text-blue-700',
  staff: 'bg-purple-100 text-purple-700',
  admin: 'bg-red-100 text-red-700',
}

export default function MembersPage() {
  const { role } = useParams()
  const [activeTab, setActiveTab] = useState(role || 'vendors')
  const [searchQuery, setSearchQuery] = useState('')
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', phone: '' })

  useEffect(() => {
    if (role) setActiveTab(role)
  }, [role])

  const currentRole = roleTabs.find((t) => t.id === activeTab)?.role || 'vendor'
  const filteredUsers = users.filter(
    (u) =>
      u.role === currentRole &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleCreateUser = async () => {
    try {
      const response = await adminApi.createUser({
        ...newUser,
        role: currentRole,
      })
      setUsers((prev) => [...prev, response.data.data || response.data.user])
      setShowCreateModal(false)
      setNewUser({ name: '', email: '', password: '', phone: '' })
    } catch (err) {
      console.error('Failed to create user:', err)
    }
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await adminApi.deleteUser(id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Directory"
        title="Members"
        description="Manage your team and customers"
        action={
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-xl hover:bg-[#0F423F] transition-colors shadow-sm"
          >
            <Plus size={16} />
            Add {roleTabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
          </button>
        }
      />

      <div className="flex gap-2 border-b border-[#E2E8F0]">
        {roleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
              activeTab === tab.id
                ? 'border-[#1A5C58] text-[#1A5C58]'
                : 'border-transparent text-[#64748B] hover:text-[#2C3E50]'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20 focus:border-[#1A5C58]"
        />
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Email</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Joined</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-[#64748B] uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#E2E8F0]/50 last:border-0 hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1A5C58]/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-[#1A5C58]">{user.name.charAt(0)}</span>
                      </div>
                      <span className="text-sm font-medium text-[#2C3E50]">{user.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#64748B]">{user.email}</td>
                  <td className="py-3 px-4">
                    <span className={cn('px-2 py-1 text-xs font-medium rounded-full capitalize', roleColors[user.role])}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-[#64748B]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-1.5 text-[#64748B] hover:text-[#C0553F] hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-sm text-[#64748B]">
                    No {activeTab} found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#2C3E50]">
                Add {roleTabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 text-[#64748B] hover:text-[#2C3E50] rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Name</label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                  placeholder="Enter name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Password</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                  placeholder="Enter password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Phone (optional)</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={(e) => setNewUser((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-[#64748B] hover:text-[#2C3E50] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-lg hover:bg-[#0F423F] transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
