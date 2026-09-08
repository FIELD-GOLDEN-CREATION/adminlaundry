import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Eye, TrendingUp, TrendingDown, ChevronDown } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useRealtime } from '@/contexts/RealtimeContext'
import { adminApi } from '@/services/api'

const BAR_GREEN = '#2F4A3C'

const payPill: Record<string, { bg: string; fg: string; label: string }> = {
  paid: { bg: '#EAEFE7', fg: '#2F4A3C', label: 'Paid' },
  pending: { bg: '#FBF3D9', fg: '#B7791F', label: 'Pending' },
  failed: { bg: '#F9E4E1', fg: '#C0553F', label: 'Overdue' },
}

const statusPill: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#FBF3D9', fg: '#B7791F' },
  accepted: { bg: '#E3EEFF', fg: '#1F5ECC' },
  in_wash: { bg: '#E3EEFF', fg: '#1F5ECC' },
  ready: { bg: '#E3EEFF', fg: '#1F5ECC' },
  out_for_delivery: { bg: '#FDEBD4', fg: '#CF6A2C' },
  delivered: { bg: '#EAEFE7', fg: '#2F4A3C' },
  cancelled: { bg: '#F9E4E1', fg: '#C0553F' },
}

const AVATAR_BG = ['#E8F2F1', '#FDF3E3', '#E3EEFF', '#F9E4E1', '#EFE7F7']
const AVATAR_FG = ['#1A5C58', '#B7791F', '#1F5ECC', '#C0553F', '#6C4FC4']

function compactTZS(n: number): string {
  if (n >= 1_000_000_000) return `TSh ${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `TSh ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 10_000) return `TSh ${(n / 1_000).toFixed(0)}k`
  return formatCurrency(n)
}

function shortDate(iso?: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
}

function dayLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso.slice(5)
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' })
}

function Sparkline({ points, stroke }: { points: number[]; stroke: string }) {
  const w = 72
  const h = 24
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = points.length > 1 ? w / (points.length - 1) : w
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(h - 3 - ((p - min) / span) * (h - 6)).toFixed(1)}`)
    .join(' ')
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" aria-hidden>
      <path d={d} stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

interface RevenueDay {
  day: string
  revenue_tzs: number
  orders: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [kpi, setKpi] = useState({
    total_orders: 0,
    total_revenue: 0,
    total_users: 0,
    total_vendors: 0,
    total_shops: 0,
    pending_orders: 0,
    active_orders: 0,
    completed_orders: 0,
  })
  const [selected, setSelected] = useState<Set<number | string>>(new Set())
  const [orders, setOrders] = useState<any[]>([])
  const [revenueByDay, setRevenueByDay] = useState<RevenueDay[]>([])
  const [chartRange, setChartRange] = useState<'7' | '14'>('7')

  // Table controls (mirror the design: search + Today + All Vendors + All Status)
  const [query, setQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { onOrderEvent } = useRealtime()
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const load = useCallback(async () => {
    try {
      const [dashRes, ordersRes, reportsRes] = await Promise.all([
        adminApi.getDashboard(),
        adminApi.getDashboardOrders(),
        adminApi.getReports().catch(() => null),
      ])
      const dash = dashRes.data?.data ?? {}
      setKpi({
        total_orders: dash.total_orders ?? 0,
        total_revenue: Number(dash.total_revenue ?? 0),
        total_users: dash.total_users ?? 0,
        total_vendors: dash.total_vendors ?? 0,
        total_shops: dash.total_shops ?? 0,
        pending_orders: dash.pending_orders ?? 0,
        active_orders: dash.active_orders ?? 0,
        completed_orders: dash.completed_orders ?? 0,
      })
      setOrders(ordersRes.data?.data ?? [])
      const byDay: RevenueDay[] = reportsRes?.data?.data?.revenue_by_day ?? reportsRes?.data?.revenue_by_day ?? []
      setRevenueByDay(
        byDay.map((r: any) => ({
          day: String(r.day),
          revenue_tzs: Number(r.revenue_tzs ?? r.revenue ?? 0),
          orders: Number(r.orders ?? r.order_count ?? 0),
        })),
      )
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Order events fire in bursts (e.g. a vendor accepting several orders in a
  // row) — debounce so one burst triggers one refetch, not one per event.
  useEffect(() => {
    return onOrderEvent(() => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current)
      refetchTimer.current = setTimeout(load, 800)
    })
  }, [onOrderEvent, load])

  // ---- Chart: last N days of real revenue ----
  const chartData = useMemo(() => {
    const n = chartRange === '7' ? 7 : 14
    return revenueByDay.slice(-n)
  }, [revenueByDay, chartRange])
  const chartMax = Math.max(...chartData.map((d) => d.revenue_tzs), 1)

  // ---- Real trend deltas (no fake percentages) ----
  const revenueTrend = useMemo(() => {
    if (revenueByDay.length < 2) return null
    const last7 = revenueByDay.slice(-7).reduce((s, r) => s + r.revenue_tzs, 0)
    const prev7 = revenueByDay.slice(-14, -7).reduce((s, r) => s + r.revenue_tzs, 0)
    if (prev7 <= 0) return last7 > 0 ? 100 : null
    return Math.round(((last7 - prev7) / prev7) * 100)
  }, [revenueByDay])

  const vendors = useMemo(() => {
    const names = new Set<string>()
    for (const o of orders) {
      const n = o.shop?.name
      if (n) names.add(n)
    }
    return [...names].sort()
  }, [orders])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const now = new Date()
    return orders.filter((o) => {
      if (q) {
        const hay = `${o.customer_name ?? o.customer?.name ?? ''} #${o.id} ${o.shop?.name ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      if (vendorFilter !== 'all' && (o.shop?.name ?? '') !== vendorFilter) return false
      if (statusFilter !== 'all' && o.status !== statusFilter) return false
      if (dateFilter !== 'all' && o.created_at) {
        const d = new Date(o.created_at)
        if (dateFilter === 'today') {
          if (d.toDateString() !== now.toDateString()) return false
        } else if (dateFilter === 'week') {
          if (now.getTime() - d.getTime() > 7 * 86400000) return false
        }
      }
      return true
    })
  }, [orders, query, vendorFilter, statusFilter, dateFilter])

  const visible = filtered.slice(0, 8)

  const toggleSelect = (id: number | string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    if (visible.every((o) => selected.has(o.id))) {
      setSelected((prev) => {
        const next = new Set(prev)
        visible.forEach((o) => next.delete(o.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        visible.forEach((o) => next.add(o.id))
        return next
      })
    }
  }

  const total = kpi.total_orders || 1
  const donePct = Math.round((kpi.completed_orders / total) * 100)
  const pendingPct = Math.round((kpi.pending_orders / total) * 100)

  const cards = [
    {
      bg: '#E7EFE6',
      delta: revenueTrend === null ? null : { value: `${revenueTrend >= 0 ? '↑' : '↓'} ${Math.abs(revenueTrend)}%`, down: revenueTrend < 0 },
      spark: revenueByDay.slice(-7).map((r) => r.revenue_tzs),
      sparkStroke: '#2F4A3C',
      value: loading ? '...' : compactTZS(kpi.total_revenue),
      title: loading ? '' : formatCurrency(kpi.total_revenue),
      label: 'Total Revenue',
    },
    {
      bg: '#EDF2E9',
      delta: { value: `↑ ${donePct}% done`, down: false },
      spark: revenueByDay.slice(-7).map((r) => r.orders),
      sparkStroke: '#2F4A3C',
      value: loading ? '...' : String(kpi.total_orders),
      title: `${kpi.completed_orders} completed`,
      label: 'Total Orders',
    },
    {
      bg: '#F9E9E6',
      delta: { value: `↓ ${pendingPct}%`, down: true },
      spark: revenueByDay.slice(-7).map((r) => r.orders),
      sparkStroke: '#C0553F',
      value: loading ? '...' : String(kpi.pending_orders),
      title: `${kpi.pending_orders} awaiting vendor response`,
      label: 'Pending Orders',
    },
    {
      bg: '#F7E9E9',
      delta: { value: `${kpi.total_vendors} vendors`, down: false },
      spark: revenueByDay.slice(-7).map((r) => r.revenue_tzs),
      sparkStroke: '#C0553F',
      value: loading ? '...' : String(kpi.total_shops),
      title: `${kpi.total_vendors} vendors onboard`,
      label: 'Active Shops',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* ===== Top: revenue chart + 4 KPI cards (schooling design, laundry data) ===== */}
      <div className="fin-top">
        {/* Revenue Collection chart */}
        <div className="fin-chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1E2A26' }}>Revenue Collection</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#8A9B8B' }}>
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <select
                    value={chartRange}
                    onChange={(e) => setChartRange(e.target.value as '7' | '14')}
                    style={{ appearance: 'none', border: 'none', background: 'transparent', fontSize: 12, fontWeight: 600, color: '#8A9B8B', paddingRight: 16, cursor: 'pointer', outline: 'none' }}
                    aria-label="Chart range"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="14">Last 14 days</option>
                  </select>
                  <ChevronDown size={13} style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
                </span>
              </label>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#8A9B8B' }}>Daily</span>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            {loading ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9B8B', fontSize: 13 }}>
                Loading revenue…
              </div>
            ) : chartData.length === 0 ? (
              <div style={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8A9B8B', fontSize: 13 }}>
                No revenue data yet
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: chartData.length > 7 ? 10 : 22, height: 230 }}>
                {chartData.map((d) => {
                  const h = Math.max(8, Math.round((d.revenue_tzs / chartMax) * 175))
                  return (
                    <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 0 }} title={`${d.day}: ${formatCurrency(d.revenue_tzs)} · ${d.orders} orders`}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: '#8A9B8B', whiteSpace: 'nowrap' }}>
                        {d.revenue_tzs >= 1000 ? `${(d.revenue_tzs / 1000).toFixed(d.revenue_tzs >= 10000 ? 0 : 1)}k` : d.revenue_tzs}
                      </span>
                      <div style={{ width: '100%', maxWidth: 52, height: h, background: BAR_GREEN, borderRadius: '8px 8px 4px 4px' }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#8A9B8B' }}>{dayLabel(d.day)}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 4 KPI cards */}
        <div className="fin-kpis">
          {cards.map((c) => (
            <div key={c.label} className="fin-kpi" style={{ background: c.bg }} title={c.title}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                {c.delta ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '4px 9px',
                      borderRadius: 999,
                      background: '#FFFFFF',
                      color: c.delta.down ? '#C0553F' : '#2F4A3C',
                    }}
                  >
                    {c.delta.down ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {c.delta.value}
                  </span>
                ) : (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#8A9B8B' }}>—</span>
                )}
                <Sparkline points={c.spark.length ? c.spark : [0]} stroke={c.sparkStroke} />
              </div>
              <div style={{ marginTop: 10, fontSize: 26, fontWeight: 800, color: '#1E2A26', letterSpacing: '-0.01em' }}>{c.value}</div>
              <div style={{ marginTop: 2, fontSize: 13, fontWeight: 500, color: '#5C6B5D' }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== List of orders (schooling table, laundry columns) ===== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#1E2A26' }}>List of Revenue Collection</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA5A3' }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search customer, order…"
                style={{ height: 36, width: 220, borderRadius: 10, border: '1px solid #EDE7D9', background: '#FFFFFF', padding: '4px 12px 4px 34px', fontSize: 13, color: '#2C3E50', outline: 'none' }}
              />
            </div>
            <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} style={filterStyle} aria-label="Date filter">
              <option value="all">All time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
            </select>
            <select value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)} style={filterStyle} aria-label="Vendor filter">
              <option value="all">All Vendors</option>
              {vendors.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={filterStyle} aria-label="Status filter">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_wash">In Wash</option>
              <option value="ready">Ready</option>
              <option value="out_for_delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="data-table-card">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={visible.length > 0 && visible.every((o) => selected.has(o.id))}
                      onChange={toggleSelectAll}
                      aria-label="Select all"
                      style={{ accentColor: BAR_GREEN, width: 15, height: 15 }}
                    />
                  </th>
                  <th>Customer</th>
                  <th>Order</th>
                  <th>Vendor</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 28, color: '#64748B' }}>Loading orders…</td></tr>
                ) : visible.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: 28, color: '#64748B' }}>No orders match these filters</td></tr>
                ) : (
                  visible.map((o) => {
                    const name = o.customer_name ?? o.customer?.name ?? '—'
                    const pay = payPill[o.payment_status] ?? payPill.pending
                    const st = statusPill[o.status] ?? statusPill.pending
                    const itemCount = o.lines?.length ?? o.items_count ?? o.order_items?.length ?? '—'
                    const avatarIdx = String(name).length % AVATAR_BG.length
                    return (
                      <tr key={o.id} onClick={() => navigate(`/orders/${o.id}`)} style={{ cursor: 'pointer' }}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selected.has(o.id)}
                            onChange={() => toggleSelect(o.id)}
                            aria-label={`Select order ${o.id}`}
                            style={{ accentColor: BAR_GREEN, width: 15, height: 15 }}
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 999,
                                background: AVATAR_BG[avatarIdx],
                                color: AVATAR_FG[avatarIdx],
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                fontSize: 13,
                                flexShrink: 0,
                              }}
                            >
                              {String(name).charAt(0).toUpperCase()}
                            </span>
                            <span>
                              <span style={{ display: 'block', fontWeight: 700, color: '#1E2A26', fontSize: 13 }}>{name}</span>
                              <span style={{ display: 'block', fontSize: 11.5, color: '#8A9B8B', marginTop: 1 }}>{shortDate(o.created_at)}</span>
                            </span>
                          </div>
                        </td>
                        <td style={{ fontWeight: 700, color: '#5C6B5D' }}>#{o.id}</td>
                        <td style={{ color: '#5C6B5D', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.shop?.name ?? '—'}</td>
                        <td style={{ color: '#5C6B5D' }}>{itemCount}</td>
                        <td style={{ fontWeight: 800, color: '#1E2A26' }}>{formatCurrency(o.total_tzs ?? 0)}</td>
                        <td>
                          <span className="status-pill" style={{ background: pay.bg, color: pay.fg }}>{pay.label}</span>
                        </td>
                        <td>
                          <span className="status-pill" style={{ background: st.bg, color: st.fg }}>
                            {String(o.status ?? 'pending').replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/orders/${o.id}`)}
                            title="View order"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 8, border: '1px solid #EDE7D9', background: '#FFFFFF', color: '#2F4A3C', cursor: 'pointer' }}
                          >
                            <Eye size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="dt-footer">
            Showing {visible.length} of {filtered.length} orders
            {filtered.length > visible.length ? ' — refine filters to narrow down' : ''}
            &nbsp;·&nbsp;
            <a href="/orders" style={{ color: '#2F4A3C', fontWeight: 800, textDecoration: 'none' }}>View all orders →</a>
          </div>
        </div>
      </div>

      {/* Scoped layout for the schooling-style top section */}
      <style>{`
        .fin-top { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(0, 1fr); gap: 18px; align-items: stretch; }
        .fin-chart-card { background: #FFFFFF; border: 1px solid #EDE7D9; border-radius: 20px; padding: 20px 22px 16px; box-shadow: 0 1px 2px rgba(15,23,34,0.05); }
        .fin-kpis { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .fin-kpi { border-radius: 18px; padding: 16px 18px 14px; min-height: 128px; display: flex; flex-direction: column; justify-content: space-between; }
        @media (max-width: 1080px) { .fin-top { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .fin-kpis { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  )
}

const filterStyle: React.CSSProperties = {
  height: 36,
  borderRadius: 10,
  border: '1px solid #EDE7D9',
  background: '#FFFFFF',
  padding: '0 10px',
  fontSize: 12.5,
  fontWeight: 600,
  color: '#5C6B5D',
  outline: 'none',
  cursor: 'pointer',
}
