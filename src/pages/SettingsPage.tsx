import { useState } from 'react'
import { User, Lock, Bell, LogOut, Camera, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'

const tabs = [
  { id: 'account', label: 'Account', icon: User },
  { id: 'permissions', label: 'Permissions', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'session', label: 'Session', icon: LogOut },
]

const permissions = [
  { id: 'manage_orders', label: 'Manage Orders', description: 'View, edit, and process all orders' },
  { id: 'manage_members', label: 'Manage Members', description: 'Add, edit, or remove team members' },
  { id: 'edit_vendor_pricing', label: 'Edit Vendor Pricing', description: 'Modify vendor rates and pricing' },
  { id: 'view_financial_reports', label: 'View Financial Reports', description: 'Access revenue and financial data' },
]

const notificationSettings = [
  { id: 'mute_sounds', label: 'Mute System Sounds', description: 'Disable audio notifications' },
  { id: 'desktop_push', label: 'Desktop Push Alerts', description: 'Receive browser push notifications' },
  { id: 'delayed_pickup', label: 'Delayed Pickup Warnings', description: 'Alert when pickups are overdue' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account')
  const [permissionsState, setPermissionsState] = useState({
    manage_orders: true,
    manage_members: true,
    edit_vendor_pricing: false,
    view_financial_reports: true,
  })
  const [notificationState, setNotificationState] = useState({
    mute_sounds: false,
    desktop_push: true,
    delayed_pickup: true,
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[#1A5C58] text-white'
                  : 'text-[#64748B] hover:bg-white hover:text-[#2C3E50]'
              )}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1">
          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Profile Photo</h2>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-[#1A5C58] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">A</span>
                  </div>
                  <div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-lg hover:bg-[#0F423F] transition-colors">
                      <Camera size={16} />
                      Upload Photo
                    </button>
                    <button className="ml-2 px-4 py-2 text-sm text-[#64748B] hover:text-[#C0553F] transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Personal Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Admin User"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Email</label>
                    <input
                      type="email"
                      defaultValue="admin@freshfold.com"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Phone</label>
                    <input
                      type="tel"
                      defaultValue="+255 123 456 789"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Location</label>
                    <input
                      type="text"
                      defaultValue="Dar es Salaam"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Address</label>
                    <input
                      type="text"
                      defaultValue="123 Fresh Lane, Dar es Salaam"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                </div>
                <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-lg hover:bg-[#0F423F] transition-colors">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>

              <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
                <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2C3E50] mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-[#F5F0E8]/50 border border-[#E2E8F0] rounded-lg text-sm text-[#2C3E50] focus:outline-none focus:ring-2 focus:ring-[#1A5C58]/20"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-lg hover:bg-[#0F423F] transition-colors">
                    <Lock size={16} />
                    Update Password
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'permissions' && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Permissions</h2>
              <div className="space-y-4">
                {permissions.map((perm) => (
                  <div key={perm.id} className="flex items-center justify-between py-3 border-b border-[#E2E8F0] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#2C3E50]">{perm.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{perm.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setPermissionsState((prev) => ({
                          ...prev,
                          [perm.id]: !prev[perm.id as keyof typeof prev],
                        }))
                      }
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        permissionsState[perm.id as keyof typeof permissionsState]
                          ? 'bg-[#1A5C58]'
                          : 'bg-[#CBD5E1]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
                          permissionsState[perm.id as keyof typeof permissionsState] && 'translate-x-5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Notifications</h2>
              <div className="space-y-4">
                {notificationSettings.map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between py-3 border-b border-[#E2E8F0] last:border-0">
                    <div>
                      <p className="text-sm font-medium text-[#2C3E50]">{setting.label}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{setting.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        setNotificationState((prev) => ({
                          ...prev,
                          [setting.id]: !prev[setting.id as keyof typeof prev],
                        }))
                      }
                      className={cn(
                        'relative w-11 h-6 rounded-full transition-colors',
                        notificationState[setting.id as keyof typeof notificationState]
                          ? 'bg-[#1A5C58]'
                          : 'bg-[#CBD5E1]'
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm',
                          notificationState[setting.id as keyof typeof notificationState] && 'translate-x-5'
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'session' && (
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
              <h2 className="text-lg font-semibold text-[#2C3E50] mb-4">Session</h2>
              <p className="text-sm text-[#64748B] mb-4">
                Sign out of your admin account. You will need to sign in again to access the admin console.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#C0553F] text-white text-sm font-medium rounded-lg hover:bg-[#A0442F] transition-colors">
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
