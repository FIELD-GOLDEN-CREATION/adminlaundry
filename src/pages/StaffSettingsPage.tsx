import { useState } from 'react'
import { Camera, Save, Lock, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const notificationSettings = [
  { id: 'order_alerts', label: 'Order Alerts', description: 'Get notified on new and updated orders' },
  { id: 'delayed_pickup', label: 'Delayed Pickup Warnings', description: 'Alert when pickups are overdue' },
  { id: 'desktop_push', label: 'Desktop Push Alerts', description: 'Receive browser push notifications' },
]

const tabs = ['Profile', 'Notifications', 'Session']

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button className={`toggle ${on ? 'on' : ''}`} onClick={onToggle}>
      <div className="toggle-knob" />
    </button>
  )
}

export default function StaffSettingsPage() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('Profile')
  const [notificationState, setNotificationState] = useState<Record<string, boolean>>({
    order_alerts: true, delayed_pickup: true, desktop_push: false,
  })

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Settings</li>
        </ol>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 0, borderBottom: '1px solid #EDE7D9',
        background: '#FFFFFF', borderRadius: '14px 14px 0 0', padding: '0 16px',
        boxShadow: '0 1px 2px rgba(15,23,34,0.05), 0 1px 1px rgba(15,23,34,0.03)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '14px 16px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab ? '#1A5C58' : '#64748B',
              borderBottom: activeTab === tab ? '2px solid #1A5C58' : '2px solid transparent',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="panel" style={{ borderRadius: '0 0 14px 14px', marginTop: -1 }}>
        {activeTab === 'Profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Profile Photo */}
            <div>
              <div className="panel-title" style={{ marginBottom: 12 }}>Profile Photo</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div className="avatar-chip" style={{ width: 64, height: 64, fontSize: 24 }}>
                  {user?.name?.charAt(0) || 'S'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px',
                    fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
                    border: 'none', borderRadius: 9, cursor: 'pointer',
                  }}>
                    <Camera size={14} /> Upload Photo
                  </button>
                  <button style={{
                    fontSize: 12.5, fontWeight: 700, color: '#C0553F', background: 'transparent',
                    border: 'none', cursor: 'pointer', padding: '8px 14px',
                  }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div>
              <div className="panel-title" style={{ marginBottom: 12 }}>Personal Details</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {[
                  { label: 'Full Name', value: user?.name || 'Staff Member' },
                  { label: 'Email', value: user?.email || 'staff@freshfold.com' },
                  { label: 'Phone', value: user?.phone || '+255 700 000 000' },
                  { label: 'Role', value: 'Staff', disabled: true },
                ].map((field) => (
                  <div key={field.label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>
                      {field.label}
                    </label>
                    <input
                      defaultValue={field.value}
                      disabled={field.disabled}
                      style={{
                        width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                        padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: field.disabled ? '#F5F0E8' : '#FFFFFF',
                        outline: 'none', cursor: field.disabled ? 'not-allowed' : 'default',
                      }}
                    />
                  </div>
                ))}
              </div>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
                border: 'none', borderRadius: 9, cursor: 'pointer', marginTop: 12,
              }}>
                <Save size={14} /> Save Changes
              </button>
            </div>

            {/* Change Password */}
            <div>
              <div className="panel-title" style={{ marginBottom: 12 }}>Change Password</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 380 }}>
                {['Current Password', 'New Password', 'Confirm Password'].map((label) => (
                  <div key={label}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginBottom: 4, display: 'block' }}>
                      {label}
                    </label>
                    <input
                      type="password"
                      style={{
                        width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9',
                        padding: '4px 12px', fontSize: 13, color: '#2C3E50', background: '#FFFFFF',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
                <button style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                  fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#1A5C58',
                  border: 'none', borderRadius: 9, cursor: 'pointer', alignSelf: 'flex-start',
                }}>
                  <Lock size={14} /> Update Password
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Notifications' && (
          <div>
            <div className="panel-title" style={{ marginBottom: 4 }}>Notifications</div>
            <div className="panel-sub" style={{ marginBottom: 16 }}>Configure your notification preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {notificationSettings.map((setting, i) => (
                <div key={setting.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < notificationSettings.length - 1 ? '1px solid #EDE7D9' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: '#2C3E50' }}>{setting.label}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{setting.description}</div>
                  </div>
                  <Toggle
                    on={notificationState[setting.id]}
                    onToggle={() => setNotificationState((prev) => ({ ...prev, [setting.id]: !prev[setting.id] }))}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Session' && (
          <div>
            <div className="panel-title" style={{ marginBottom: 4 }}>Session</div>
            <div className="panel-sub" style={{ marginBottom: 16 }}>Sign out of your staff account</div>
            <button
              onClick={logout}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 14px',
                fontSize: 12.5, fontWeight: 700, color: '#FFFFFF', background: '#C0553F',
                border: 'none', borderRadius: 9, cursor: 'pointer',
              }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
