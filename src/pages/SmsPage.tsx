import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Plus, Check, X, Loader2, AlertCircle, Send } from 'lucide-react'
import { StatTiles } from '@/components/ui/StatTiles'
import { adminApi } from '@/services/api'

type SmsTab = 'overview' | 'messages' | 'requests' | 'controls'

interface SmsVendorRow {
  shop_id: number
  shop_name: string
  owner_name?: string
  owner_phone?: string
  plan?: { id: number; name: string; display_name?: string }
  sms_enabled: boolean
  plan_quota: number
  used_plan: number
  remaining_plan: number
  extra_total: number
  used_extra: number
  remaining_extra: number
  total_sent: number
  pending_requests: number
}

interface SmsMessageRow {
  id: number
  shop_id: number
  type: string
  recipient_phone: string
  recipient_name?: string
  message: string
  segments: number
  credit_source: string
  status: string
  beem_request_id?: string
  error?: string
  created_at: string
  shop?: { name?: string }
}

interface SmsRequestRow {
  id: number
  shop_id: number
  requested_count: number
  approved_count: number
  status: string
  note?: string
  created_at: string
  decided_at?: string
  shop?: { name?: string; subscription?: { plan?: { display_name?: string; name?: string } } }
  extra_balance?: number
}

const typeConfig: Record<string, { bg: string; fg: string; label: string }> = {
  order_complete: { bg: '#E8F2F1', fg: '#1A5C58', label: 'Order' },
  package: { bg: '#FDF3E3', fg: '#D4841A', label: 'Package' },
  promo: { bg: '#EDE9FE', fg: '#6D28D9', label: 'Promo' },
}

const sourceConfig: Record<string, { bg: string; fg: string; label: string }> = {
  plan: { bg: '#DFF5ED', fg: '#1A7A5C', label: 'Plan' },
  extra: { bg: '#FDF3E3', fg: '#D4841A', label: 'Extra' },
}

const statusConfig: Record<string, { bg: string; fg: string; label: string }> = {
  sent: { bg: '#DFF5ED', fg: '#1A7A5C', label: 'Sent' },
  failed: { bg: '#F3D5CE', fg: '#C0553F', label: 'Failed' },
  blocked: { bg: '#F1F5F9', fg: '#64748B', label: 'Blocked' },
  pending: { bg: '#FDF3E3', fg: '#D4841A', label: 'Pending' },
  approved: { bg: '#DFF5ED', fg: '#1A7A5C', label: 'Approved' },
  rejected: { bg: '#F3D5CE', fg: '#C0553F', label: 'Rejected' },
}

function Pill({ bg, fg, label }: { bg: string; fg: string; label: string }) {
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, background: bg, color: fg, fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

function pick<T>(v: T, bg: string, fg: string, label: string) {
  return <Pill bg={bg} fg={fg} label={label} />
}

const smsSwitches = [
  { key: 'sms_global_enabled', label: 'Master SMS switch', desc: 'Kills every vendor SMS when off' },
  { key: 'sms_orders_enabled', label: 'Order-complete SMS', desc: 'Sent when a vendor completes an order' },
  { key: 'sms_packages_enabled', label: 'Package broadcasts', desc: 'Vendor package announcements' },
  { key: 'sms_promos_enabled', label: 'Promo broadcasts', desc: 'Vendor promo announcements' },
]

export default function SmsPage() {
  const [tab, setTab] = useState<SmsTab>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [vendors, setVendors] = useState<SmsVendorRow[]>([])
  const [messages, setMessages] = useState<SmsMessageRow[]>([])
  const [requests, setRequests] = useState<SmsRequestRow[]>([])
  const [switches, setSwitches] = useState<Record<string, boolean>>({})
  const [savingSwitches, setSavingSwitches] = useState(false)

  const [msgType, setMsgType] = useState('')
  const [msgSource, setMsgSource] = useState('')
  const [msgStatus, setMsgStatus] = useState('')
  const [reqFilter, setReqFilter] = useState('pending')

  const [adjustShop, setAdjustShop] = useState<SmsVendorRow | null>(null)
  const [adjustAmount, setAdjustAmount] = useState('')
  const [adjustNote, setAdjustNote] = useState('')
  const [adjusting, setAdjusting] = useState(false)
  const [approveId, setApproveId] = useState<number | null>(null)
  const [approveCount, setApproveCount] = useState('')
  const [deciding, setDeciding] = useState<number | null>(null)

  const loadOverview = useCallback(async () => {
    const res = await adminApi.getSmsOverview()
    setVendors(res.data?.data ?? [])
  }, [])

  const loadMessages = useCallback(async () => {
    const params: Record<string, string> = {}
    if (msgType) params.type = msgType
    if (msgSource) params.credit_source = msgSource
    if (msgStatus) params.status = msgStatus
    const res = await adminApi.getSmsMessages(params)
    const d = res.data?.data
    setMessages(Array.isArray(d) ? d : d?.data ?? [])
  }, [msgType, msgSource, msgStatus])

  const loadRequests = useCallback(async () => {
    const res = await adminApi.getSmsRequests(reqFilter)
    const d = res.data?.data
    setRequests(Array.isArray(d) ? d : d?.data ?? [])
  }, [reqFilter])

  const loadSwitches = useCallback(async () => {
    try {
      const res = await adminApi.getSettings()
      const raw = res.data?.data
      const map: Record<string, string> = Array.isArray(raw)
        ? Object.fromEntries((raw as { key: string; value: string }[]).map((s) => [s.key, s.value]))
        : raw ?? {}
      const next: Record<string, boolean> = {}
      for (const s of smsSwitches) next[s.key] = map[s.key] !== '0' && map[s.key] !== 'false'
      setSwitches(next)
    } catch {
      /* settings table may predate the sms keys */
    }
  }, [])

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      await Promise.all([loadOverview(), loadMessages(), loadRequests(), loadSwitches()])
    } catch {
      setError('Could not load SMS data. Check connection and retry.')
    } finally {
      setLoading(false)
    }
  }, [loadOverview, loadMessages, loadRequests, loadSwitches])

  useEffect(() => {
    reload()
  }, [reload])

  useEffect(() => {
    if (tab === 'messages') loadMessages().catch(() => {})
    if (tab === 'requests') loadRequests().catch(() => {})
  }, [tab, loadMessages, loadRequests])

  const saveSwitches = async () => {
    setSavingSwitches(true)
    try {
      await adminApi.updateSettings(smsSwitches.map((s) => ({ key: s.key, value: switches[s.key] ? '1' : '0' })))
    } catch {
      setError('Could not save SMS switches.')
    } finally {
      setSavingSwitches(false)
    }
  }

  const submitAdjust = async () => {
    if (!adjustShop || !adjustAmount) return
    setAdjusting(true)
    try {
      await adminApi.adjustShopSms(adjustShop.shop_id, Number(adjustAmount), adjustNote || undefined)
      setAdjustShop(null)
      setAdjustAmount('')
      setAdjustNote('')
      await loadOverview()
    } catch {
      setError('Could not adjust SMS balance.')
    } finally {
      setAdjusting(false)
    }
  }

  const decide = async (id: number, action: 'approve' | 'reject') => {
    setDeciding(id)
    try {
      if (action === 'approve') {
        await adminApi.approveSmsRequest(id, approveCount ? Number(approveCount) : undefined)
      } else {
        await adminApi.rejectSmsRequest(id)
      }
      setApproveId(null)
      setApproveCount('')
      await Promise.all([loadRequests(), loadOverview()])
    } catch {
      setError('Could not decide this request.')
    } finally {
      setDeciding(null)
    }
  }

  const totalSent = vendors.reduce((a, v) => a + v.total_sent, 0)
  const totalPending = vendors.reduce((a, v) => a + v.pending_requests, 0)
  const enabledVendors = vendors.filter((v) => v.sms_enabled).length

  return (
    <div>
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">SMS Administration</li>
        </ol>
      </div>

      <StatTiles
        items={[
          { label: 'SMS Sent (all vendors)', value: String(totalSent), bg: '#E8F2F1' },
          { label: 'Vendors with SMS on', value: String(enabledVendors), bg: '#DFF5ED' },
          { label: 'Pending top-up requests', value: String(totalPending), bg: '#FDF3E3' },
          { label: 'Master switch', value: switches.sms_global_enabled === false ? 'OFF' : 'ON', bg: switches.sms_global_enabled === false ? '#F3D5CE' : '#E8F2F1' },
        ]}
      />

      {error && (
        <div className="panel" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', marginBottom: 14, background: '#FEE2E2', border: '1px solid #FECACA', fontSize: 12.5, fontWeight: 600, color: '#B91C1C' }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* Inner tabs */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #EDE7D9', background: '#FFFFFF', borderRadius: '14px 14px 0 0', padding: '0 16px' }}>
        {([['overview', 'Overview'], ['messages', 'Messages'], ['requests', 'Requests'], ['controls', 'Controls']] as [SmsTab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: '14px 16px', fontSize: 13, fontWeight: 600, color: tab === key ? '#1A5C58' : '#64748B',
              borderBottom: tab === key ? '2px solid #1A5C58' : '2px solid transparent',
              background: 'transparent', borderTop: 'none', borderLeft: 'none', borderRight: 'none', cursor: 'pointer',
            }}
          >
            {label}
            {key === 'requests' && totalPending > 0 && (
              <span style={{ marginLeft: 6, padding: '1px 7px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: '#D4841A', color: '#fff' }}>
                {totalPending}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: 40, color: '#64748B', fontSize: 13 }}>Loading SMS data…</div>
      ) : (
        <>
          {tab === 'overview' && (
            <div className="panel" style={{ borderRadius: '0 0 14px 14px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 900 }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: '#64748B', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <th style={{ padding: '10px 12px' }}>Vendor</th>
                    <th style={{ padding: '10px 12px' }}>Plan / SMS</th>
                    <th style={{ padding: '10px 12px' }}>Plan quota</th>
                    <th style={{ padding: '10px 12px' }}>Extra (bought)</th>
                    <th style={{ padding: '10px 12px' }}>Sent</th>
                    <th style={{ padding: '10px 12px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v) => (
                    <tr key={v.shop_id} style={{ borderTop: '1px solid #F5F0E8' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: '#2C3E50' }}>{v.shop_name}</div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>{v.owner_name ?? ''} {v.owner_phone ? `· ${v.owner_phone}` : ''}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 600 }}>{v.plan?.display_name ?? v.plan?.name ?? '—'}</div>
                        <div style={{ marginTop: 3 }}>{pick(v, v.sms_enabled ? '#DFF5ED' : '#F1F5F9', v.sms_enabled ? '#1A7A5C' : '#64748B', v.sms_enabled ? 'SMS on' : 'SMS off')}</div>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 700 }}>{v.used_plan}</span>
                        <span style={{ color: '#64748B' }}> / {v.plan_quota} (left {v.remaining_plan})</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{ fontWeight: 700 }}>{v.used_extra}</span>
                        <span style={{ color: '#64748B' }}> / {v.extra_total} (left {v.remaining_extra})</span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700 }}>{v.total_sent}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => setAdjustShop(v)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 12px', fontSize: 12, fontWeight: 700, color: '#1A5C58', background: '#E8F2F1', border: 'none', borderRadius: 8, cursor: 'pointer' }}
                        >
                          <Plus size={13} /> Add SMS
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {tab === 'messages' && (
            <div className="panel" style={{ borderRadius: '0 0 14px 14px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                <select value={msgType} onChange={(e) => setMsgType(e.target.value)} style={selectStyle}>
                  <option value="">All types</option>
                  <option value="order_complete">Order</option>
                  <option value="package">Package</option>
                  <option value="promo">Promo</option>
                </select>
                <select value={msgSource} onChange={(e) => setMsgSource(e.target.value)} style={selectStyle}>
                  <option value="">Plan + Extra</option>
                  <option value="plan">From plan</option>
                  <option value="extra">Bought extra</option>
                </select>
                <select value={msgStatus} onChange={(e) => setMsgStatus(e.target.value)} style={selectStyle}>
                  <option value="">All statuses</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {messages.map((m) => {
                  const t = typeConfig[m.type] ?? { bg: '#F1F5F9', fg: '#64748B', label: m.type }
                  const s = sourceConfig[m.credit_source] ?? { bg: '#F1F5F9', fg: '#64748B', label: m.credit_source }
                  const st = statusConfig[m.status] ?? { bg: '#F1F5F9', fg: '#64748B', label: m.status }
                  return (
                    <div key={m.id} style={{ border: '1px solid #EDE7D9', borderRadius: 12, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#2C3E50', fontSize: 13 }}>{m.shop?.name ?? `Shop #${m.shop_id}`}</span>
                        {pick(m, t.bg, t.fg, t.label)}
                        {pick(m, s.bg, s.fg, s.label)}
                        {pick(m, st.bg, st.fg, st.label)}
                        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#64748B' }}>
                          {m.recipient_name ?? ''} · {m.recipient_phone} · {new Date(m.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 12.5, color: '#2C3E50' }}>{m.message}</div>
                      {m.error && <div style={{ marginTop: 2, fontSize: 11.5, color: '#C0553F' }}>{m.error}</div>}
                    </div>
                  )
                })}
                {messages.length === 0 && <div style={{ color: '#64748B', fontSize: 13, padding: 12 }}>No messages match.</div>}
              </div>
            </div>
          )}

          {tab === 'requests' && (
            <div className="panel" style={{ borderRadius: '0 0 14px 14px' }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReqFilter(f)}
                    style={{
                      padding: '7px 14px', fontSize: 12.5, fontWeight: 700, borderRadius: 999, cursor: 'pointer',
                      textTransform: 'capitalize', border: '1px solid #EDE7D9',
                      background: reqFilter === f ? '#1A5C58' : '#fff', color: reqFilter === f ? '#fff' : '#64748B',
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {requests.map((r) => {
                  const st = statusConfig[r.status] ?? { bg: '#F1F5F9', fg: '#64748B', label: r.status }
                  return (
                    <div key={r.id} style={{ border: '1px solid #EDE7D9', borderRadius: 12, padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{r.shop?.name ?? `Shop #${r.shop_id}`}</span>
                        {pick(r, st.bg, st.fg, st.label)}
                        <span style={{ fontSize: 12.5 }}>anaomba <b>{r.requested_count}</b> SMS</span>
                        {r.status === 'approved' && <span style={{ fontSize: 12.5, color: '#1A7A5C' }}>→ approved {r.approved_count}</span>}
                        <span style={{ marginLeft: 'auto', fontSize: 11.5, color: '#64748B' }}>
                          Extra balance: {r.extra_balance ?? '—'} · {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      {r.note && <div style={{ fontSize: 12.5, color: '#64748B', marginTop: 2 }}>“{r.note}”</div>}
                      {r.status === 'pending' && (
                        <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          {approveId === r.id ? (
                            <>
                              <input
                                type="number" min={1} placeholder={String(r.requested_count)}
                                value={approveCount} onChange={(e) => setApproveCount(e.target.value)}
                                style={{ width: 130, height: 32, borderRadius: 8, border: '1px solid #EDE7D9', padding: '4px 8px', fontSize: 13 }}
                              />
                              <button onClick={() => decide(r.id, 'approve')} disabled={deciding === r.id} style={approveBtn}>
                                {deciding === r.id ? <Loader2 size={13} /> : <Check size={13} />} Confirm
                              </button>
                              <button onClick={() => setApproveId(null)} style={ghostBtn}>Cancel</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => { setApproveId(r.id); setApproveCount(String(r.requested_count)) }} style={approveBtn}>
                                <Check size={13} /> Approve
                              </button>
                              <button onClick={() => decide(r.id, 'reject')} disabled={deciding === r.id} style={rejectBtn}>
                                <X size={13} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
                {requests.length === 0 && <div style={{ color: '#64748B', fontSize: 13, padding: 12 }}>No requests.</div>}
              </div>
            </div>
          )}

          {tab === 'controls' && (
            <div className="panel" style={{ borderRadius: '0 0 14px 14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50', marginBottom: 4 }}>Kill switches</div>
              <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 12 }}>Turn off promos, packages, orders, or everything at once.</div>
              {smsSwitches.map((s) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F0E8' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: '#64748B' }}>{s.desc}</div>
                  </div>
                  <button
                    onClick={() => setSwitches((p) => ({ ...p, [s.key]: !p[s.key] }))}
                    className={`toggle ${switches[s.key] ? 'on' : ''}`}
                  >
                    <div className="toggle-knob" />
                  </button>
                </div>
              ))}
              <button onClick={saveSwitches} disabled={savingSwitches} style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', fontSize: 12.5, fontWeight: 700, color: '#fff', background: '#1A5C58', border: 'none', borderRadius: 9, cursor: 'pointer' }}>
                {savingSwitches ? <Loader2 size={13} /> : <Send size={13} />} Save switches
              </button>
            </div>
          )}
        </>
      )}

      {/* Adjust dialog */}
      {adjustShop && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 22, width: 380, maxWidth: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <MessageSquare size={16} style={{ color: '#1A5C58' }} />
              <span style={{ fontSize: 15, fontWeight: 800 }}>Add SMS — {adjustShop.shop_name}</span>
            </div>
            <div style={{ fontSize: 12.5, color: '#64748B', marginBottom: 12 }}>
              Extra balance now: <b>{adjustShop.extra_total - adjustShop.used_extra}</b>. Use a negative number to subtract.
            </div>
            <input
              type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
              placeholder="e.g. 50" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 14, marginBottom: 8 }}
            />
            <input
              value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)}
              placeholder="Note (optional)" style={{ width: '100%', height: 38, borderRadius: 9, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 13, marginBottom: 14 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setAdjustShop(null)} style={ghostBtnWide}>Cancel</button>
              <button onClick={submitAdjust} disabled={adjusting || !adjustAmount} style={primaryBtnWide}>
                {adjusting ? <Loader2 size={13} /> : <Plus size={13} />} Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const selectStyle: React.CSSProperties = {
  height: 34, borderRadius: 8, border: '1px solid #EDE7D9', padding: '4px 10px', fontSize: 12.5, background: '#fff',
}

const approveBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 700,
  color: '#fff', background: '#1A5C58', border: 'none', borderRadius: 8, cursor: 'pointer',
}

const rejectBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', fontSize: 12, fontWeight: 700,
  color: '#C0553F', background: '#F3D5CE', border: 'none', borderRadius: 8, cursor: 'pointer',
}

const ghostBtn: React.CSSProperties = {
  padding: '7px 14px', fontSize: 12, fontWeight: 700, color: '#64748B',
  background: '#fff', border: '1px solid #EDE7D9', borderRadius: 8, cursor: 'pointer',
}

const ghostBtnWide: React.CSSProperties = { ...ghostBtn, flex: 1, padding: '9px 14px' }
const primaryBtnWide: React.CSSProperties = { ...approveBtn, flex: 1, padding: '9px 14px', justifyContent: 'center' }
