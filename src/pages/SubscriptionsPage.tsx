import { useState } from 'react'
import { CreditCard, Save, RotateCcw } from 'lucide-react'

interface PlanLimit {
  key: string
  label: string
  value: string | number
  type: 'number' | 'toggle' | 'text'
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  color: string
  highlighted: boolean
  limits: PlanLimit[]
}

const defaultPlans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    period: 'month',
    color: '#64748B',
    highlighted: false,
    limits: [
      { key: 'max_orders', label: 'Max Orders / Month', value: 30, type: 'number' },
      { key: 'max_packages', label: 'Service Packages', value: 1, type: 'number' },
      { key: 'max_promos', label: 'Active Promos', value: 0, type: 'number' },
      { key: 'max_delivery_zones', label: 'Delivery Zones', value: 1, type: 'number' },
      { key: 'analytics', label: 'Full Analytics', value: false, type: 'toggle' },
      { key: 'priority_support', label: 'Priority Support', value: false, type: 'toggle' },
      { key: 'custom_branding', label: 'Custom Branding', value: false, type: 'toggle' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 75000,
    period: 'month',
    color: '#1A5C58',
    highlighted: true,
    limits: [
      { key: 'max_orders', label: 'Max Orders / Month', value: 9999, type: 'number' },
      { key: 'max_packages', label: 'Service Packages', value: 5, type: 'number' },
      { key: 'max_promos', label: 'Active Promos', value: 3, type: 'number' },
      { key: 'max_delivery_zones', label: 'Delivery Zones', value: 3, type: 'number' },
      { key: 'analytics', label: 'Full Analytics', value: true, type: 'toggle' },
      { key: 'priority_support', label: 'Priority Support', value: true, type: 'toggle' },
      { key: 'custom_branding', label: 'Custom Branding', value: true, type: 'toggle' },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 200000,
    period: 'month',
    color: '#D4841A',
    highlighted: false,
    limits: [
      { key: 'max_orders', label: 'Max Orders / Month', value: 9999, type: 'number' },
      { key: 'max_packages', label: 'Service Packages', value: 9999, type: 'number' },
      { key: 'max_promos', label: 'Active Promos', value: 9999, type: 'number' },
      { key: 'max_delivery_zones', label: 'Delivery Zones', value: 9999, type: 'number' },
      { key: 'analytics', label: 'Full Analytics', value: true, type: 'toggle' },
      { key: 'priority_support', label: 'Priority Support', value: true, type: 'toggle' },
      { key: 'custom_branding', label: 'Custom Branding', value: true, type: 'toggle' },
      { key: 'multi_location', label: 'Multi-Location (up to 5)', value: true, type: 'toggle' },
      { key: 'api_access', label: 'API Access', value: true, type: 'toggle' },
      { key: 'bulk_orders', label: 'Bulk Order Import', value: true, type: 'toggle' },
    ],
  },
]

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(defaultPlans)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<SubscriptionPlan | null>(null)

  const startEdit = (planId: string) => {
    const plan = plans.find((p) => p.id === planId)
    if (plan) {
      setEditingPlan(planId)
      setEditDraft(JSON.parse(JSON.stringify(plan)))
    }
  }

  const cancelEdit = () => {
    setEditingPlan(null)
    setEditDraft(null)
  }

  const saveEdit = () => {
    if (!editDraft) return
    setPlans((prev) => prev.map((p) => (p.id === editDraft.id ? editDraft : p)))
    setEditingPlan(null)
    setEditDraft(null)
  }

  const updateDraftLimit = (key: string, value: string | number | boolean) => {
    if (!editDraft) return
    setEditDraft({
      ...editDraft,
      limits: editDraft.limits.map((l) => (l.key === key ? { ...l, value } : l)),
    })
  }

  const updateDraftPrice = (price: number) => {
    if (!editDraft) return
    setEditDraft({ ...editDraft, price })
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Subscriptions</li>
        </ol>
      </div>

      {/* Plans grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 18,
      }}>
        {plans.map((plan) => {
          const isEditing = editingPlan === plan.id
          const draft = isEditing ? editDraft! : plan

          return (
            <div
              key={plan.id}
              style={{
                background: '#FFFFFF',
                border: plan.highlighted ? `2px solid ${plan.color}` : '1px solid #EDE7D9',
                borderRadius: 20,
                overflow: 'hidden',
                boxShadow: plan.highlighted
                  ? '0 8px 24px rgba(26,92,88,0.12)'
                  : '0 1px 2px rgba(15,23,34,0.05)',
              }}
            >
              {/* Plan header */}
              <div style={{
                padding: '20px 20px 16px',
                borderBottom: '1px solid #EDE7D9',
                textAlign: 'center',
              }}>
                {plan.highlighted && (
                  <div style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                    background: '#E8F2F1', color: '#1A5C58', fontSize: 10, fontWeight: 800,
                    letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    Most Popular
                  </div>
                )}
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50' }}>{plan.name}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 2 }}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={draft.price}
                      onChange={(e) => updateDraftPrice(Number(e.target.value))}
                      style={{
                        width: 80, height: 36, borderRadius: 9, border: '1px solid #EDE7D9',
                        padding: '4px 8px', fontSize: 24, fontWeight: 700, color: '#2C3E50',
                        background: '#FFFFFF', outline: 'none', textAlign: 'center',
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#2C3E50' }}>
                      {plan.price === 0 ? 'Free' : `TZS ${plan.price.toLocaleString()}`}
                    </span>
                  )}
                  {plan.price > 0 && (
                    <span style={{ fontSize: 13, color: '#64748B' }}>/{plan.period}</span>
                  )}
                </div>
              </div>

              {/* Limits */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, color: '#64748B', letterSpacing: '0.05em',
                  textTransform: 'uppercase', marginBottom: 12,
                }}>
                  Plan Limits
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {draft.limits.map((limit, i) => (
                    <div
                      key={limit.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 0',
                        borderBottom: i < draft.limits.length - 1 ? '1px solid #F5F0E8' : 'none',
                      }}
                    >
                      <span style={{ fontSize: 13, color: '#2C3E50', fontWeight: 500 }}>
                        {limit.label}
                      </span>
                      {isEditing ? (
                        limit.type === 'toggle' ? (
                          <button
                            onClick={() => updateDraftLimit(limit.key, !limit.value)}
                            className={`toggle ${limit.value ? 'on' : ''}`}
                          >
                            <div className="toggle-knob" />
                          </button>
                        ) : (
                          <input
                            type="number"
                            value={limit.value as number}
                            onChange={(e) => updateDraftLimit(limit.key, Number(e.target.value))}
                            style={{
                              width: 70, height: 30, borderRadius: 8, border: '1px solid #EDE7D9',
                              padding: '4px 8px', fontSize: 13, fontWeight: 700, color: '#2C3E50',
                              background: '#FFFFFF', outline: 'none', textAlign: 'center',
                            }}
                          />
                        )
                      ) : limit.type === 'toggle' ? (
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: limit.value ? '#1A7A5C' : '#C0553F',
                        }}>
                          {limit.value ? 'Included' : 'Not included'}
                        </span>
                      ) : (
                        <span style={{
                          fontSize: 13, fontWeight: 700, color: '#2C3E50',
                          background: '#F5F0E8', padding: '3px 10px', borderRadius: 8,
                        }}>
                          {(limit.value as number) >= 9999 ? 'Unlimited' : limit.value}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
                {isEditing ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      style={{
                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#64748B',
                        background: '#FFFFFF', border: '1px solid #EDE7D9', borderRadius: 9, cursor: 'pointer',
                      }}
                    >
                      <RotateCcw size={13} /> Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      style={{
                        flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: '#FFFFFF',
                        background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer',
                      }}
                    >
                      <Save size={13} /> Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => startEdit(plan.id)}
                    style={{
                      width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '9px 14px', fontSize: 12.5, fontWeight: 700, color: plan.color,
                      background: `${plan.color}10`, border: `1px solid ${plan.color}30`, borderRadius: 9, cursor: 'pointer',
                    }}
                  >
                    <CreditCard size={13} /> Edit Plan
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Vendor count summary */}
      <div className="panel" style={{ marginTop: 18 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Vendor Subscriptions</div>
            <div className="panel-sub">Vendors per plan</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {plans.map((plan) => {
            const vendorCount = plan.id === 'basic' ? 12 : plan.id === 'pro' ? 24 : 6
            return (
              <div key={plan.id} style={{
                padding: '14px 16px', borderRadius: 14,
                background: `${plan.color}08`, border: `1px solid ${plan.color}20`,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{plan.name}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: plan.color, marginTop: 4 }}>{vendorCount}</div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>active vendors</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
