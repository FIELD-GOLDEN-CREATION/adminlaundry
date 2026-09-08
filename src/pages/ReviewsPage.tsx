import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Star, Sun, CalendarDays, CalendarRange, RefreshCw, Trophy } from 'lucide-react'
import { adminApi } from '@/services/api'

interface AdminReview {
  id: number | string
  rating: number
  comment?: string | null
  created_at: string
  customer?: { id?: number; name?: string }
  shop?: { id?: number; name?: string }
}

type FilterKey = 'all' | '5' | '4' | '3' | '2' | '1' | 'today' | 'week' | 'month'

const filterTabs: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: '5', label: '5 Star' },
  { key: '4', label: '4 Star' },
  { key: '3', label: '3 Star' },
  { key: '2', label: '2 Star' },
  { key: '1', label: '1 Star' },
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
]

// Rating-band accent — mirrors the semantic colors used for order/vendor
// status pills elsewhere in the app (green = healthy, red = at-risk).
const ratingColors: Record<number, string> = {
  5: '#1A7A5C',
  4: '#1A5C58',
  3: '#D4841A',
  2: '#CF6A2C',
  1: '#C0553F',
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
function startOfWeek(d: Date) {
  const x = startOfDay(d)
  x.setDate(x.getDate() - x.getDay())
  return x
}
function startOfMonth(d: Date) {
  const x = startOfDay(d)
  x.setDate(1)
  return x
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    try {
      setError(null)
      const res = await adminApi.getReviews()
      setReviews(res.data.data || [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    load()
  }, [load])

  const { todayCount, weekCount, monthCount, avgRating, distribution, topVendor } = useMemo(() => {
    const now = new Date()
    const dayStart = startOfDay(now)
    const weekStart = startOfWeek(now)
    const monthStart = startOfMonth(now)

    let today = 0, week = 0, month = 0, ratingSum = 0
    const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    const vendorStats = new Map<string, { name: string; id?: number; sum: number; count: number }>()

    for (const r of reviews) {
      const created = r.created_at ? new Date(r.created_at) : null
      if (created) {
        if (created >= dayStart) today++
        if (created >= weekStart) week++
        if (created >= monthStart) month++
      }
      const rating = Number(r.rating) || 0
      ratingSum += rating
      if (dist[rating] !== undefined) dist[rating]++

      const key = r.shop?.id != null ? String(r.shop.id) : r.shop?.name || 'unknown'
      const entry = vendorStats.get(key) || { name: r.shop?.name || 'Unknown vendor', id: r.shop?.id, sum: 0, count: 0 }
      entry.sum += rating
      entry.count += 1
      vendorStats.set(key, entry)
    }

    // Best-rated vendor with at least 3 reviews so a single 5-star fluke
    // doesn't outrank a shop with a real track record.
    let best: { name: string; id?: number; avg: number; count: number } | null = null
    for (const v of vendorStats.values()) {
      if (v.count < 3) continue
      const avg = v.sum / v.count
      if (!best || avg > best.avg || (avg === best.avg && v.count > best.count)) {
        best = { name: v.name, id: v.id, avg, count: v.count }
      }
    }

    return {
      todayCount: today,
      weekCount: week,
      monthCount: month,
      avgRating: reviews.length ? ratingSum / reviews.length : 0,
      distribution: dist,
      topVendor: best,
    }
  }, [reviews])

  const filtered = useMemo(() => {
    let list = reviews
    if (filter !== 'all') {
      if (['5', '4', '3', '2', '1'].includes(filter)) {
        const rating = Number(filter)
        list = list.filter((r) => Number(r.rating) === rating)
      } else {
        const now = new Date()
        const boundary = filter === 'today' ? startOfDay(now) : filter === 'week' ? startOfWeek(now) : startOfMonth(now)
        list = list.filter((r) => r.created_at && new Date(r.created_at) >= boundary)
      }
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((r) =>
        (r.shop?.name || '').toLowerCase().includes(q) ||
        (r.customer?.name || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [reviews, filter, search])

  const counts: Record<FilterKey, number> = {
    all: reviews.length,
    '5': distribution[5],
    '4': distribution[4],
    '3': distribution[3],
    '2': distribution[2],
    '1': distribution[1],
    today: todayCount,
    week: weekCount,
    month: monthCount,
  }

  return (
    <div>
      {/* Title card */}
      <div className="title-card">
        <ol className="breadcrumb" style={{ margin: 0, padding: 0 }}>
          <li><a href="/" style={{ color: '#64748B', fontWeight: 600, textDecoration: 'none' }}>Home</a></li>
          <li className="sep">/</li>
          <li className="current">Reviews</li>
        </ol>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn" title="Refresh" onClick={load}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Today / Week / Month / Average cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 14 }}>
        {[
          { label: "Today's Reviews", value: todayCount, icon: Sun, color: '#D4841A' },
          { label: "This Week's Reviews", value: weekCount, icon: CalendarDays, color: '#1F5ECC' },
          { label: "This Month's Reviews", value: monthCount, icon: CalendarRange, color: '#1A5C58' },
          { label: 'Average Rating', value: `${avgRating.toFixed(1)} / 5.0`, icon: Star, color: '#7C3AED' },
        ].map((kpi) => (
          <div key={kpi.label} className="panel" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: kpi.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: kpi.color,
              }}>
                <kpi.icon size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {kpi.label}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#2C3E50', marginTop: 2 }}>
                  {loading ? '...' : kpi.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Rating distribution + top vendor callout */}
      <div className="panel" style={{ padding: 0 }}>
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid #EDE7D9',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        }}>
          <div>
            <div className="panel-title">Rating Distribution</div>
            <div className="panel-sub">{reviews.length} reviews across all vendors</div>
          </div>
          {topVendor && (
            <Link
              to={topVendor.id ? `/members/vendors/${topVendor.id}` : '#'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '7px 12px', borderRadius: 999, textDecoration: 'none',
                background: '#FDF3E3', border: '1px solid #F3E4C4',
                cursor: topVendor.id ? 'pointer' : 'default',
              }}
            >
              <Trophy size={14} style={{ color: '#D4841A' }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50' }}>
                Top rated: {topVendor.name}
              </span>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#D4841A' }}>
                {topVendor.avg.toFixed(1)}★ · {topVendor.count} reviews
              </span>
            </Link>
          )}
        </div>
        <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = distribution[star] || 0
            const pct = reviews.length ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, width: 40, flexShrink: 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#2C3E50' }}>{star}</span>
                  <Star size={11} style={{ color: '#D4841A', fill: '#D4841A' }} />
                </div>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: '#F1F5F9', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`, height: '100%', borderRadius: 999,
                    background: ratingColors[star], transition: 'width 0.4s ease',
                  }} />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontSize: 11.5, color: '#64748B', flexShrink: 0 }}>
                  {count} · {pct.toFixed(0)}%
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Search */}
      <div className="search-box" style={{ maxWidth: 320 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input placeholder="Search by vendor, customer, or comment..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Filter chips */}
      <div className="filters-bar">
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {filterTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                color: filter === tab.key ? '#1A5C58' : '#64748B',
                background: filter === tab.key ? '#E8F2F1' : 'transparent',
                border: 'none', borderRadius: 7, cursor: 'pointer',
              }}
            >
              {['5', '4', '3', '2', '1'].includes(tab.key) && (
                <Star size={11} style={{ color: filter === tab.key ? '#D4841A' : '#94A3B8', fill: filter === tab.key ? '#D4841A' : 'transparent' }} />
              )}
              {tab.label}
              <span style={{
                padding: '1px 6px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
                background: filter === tab.key ? '#1A5C5820' : '#F1F5F9',
                color: filter === tab.key ? '#1A5C58' : '#64748B',
              }}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Review list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
            Loading reviews...
          </div>
        ) : error ? (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#C0553F', fontSize: 13 }}>
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <div className="panel" style={{ padding: 40, textAlign: 'center', color: '#64748B', fontSize: 13 }}>
            No reviews match this filter.
          </div>
        ) : (
          filtered.map((review) => {
            const accent = ratingColors[Number(review.rating)] || '#94A3B8'
            return (
              <div key={review.id} className="panel" style={{ padding: 16, borderLeft: `3px solid ${accent}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div className="avatar-chip" style={{ width: 32, height: 32, fontSize: 12 }}>
                    {(review.customer?.name || '?').charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#2C3E50' }}>{review.customer?.name || 'Anonymous'}</div>
                    <div style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
                      {review.shop?.id ? (
                        <Link to={`/members/vendors/${review.shop.id}`} style={{ fontWeight: 600, color: '#1A5C58', textDecoration: 'none' }}>
                          {review.shop.name || 'Unknown vendor'}
                        </Link>
                      ) : (
                        <span style={{ fontWeight: 600, color: '#1A5C58' }}>{review.shop?.name || 'Unknown vendor'}</span>
                      )}
                      <span>·</span>
                      <span>{review.created_at ? new Date(review.created_at).toLocaleString() : ''}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 1 }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} style={{
                        color: i < review.rating ? '#D4841A' : '#E2E8F0',
                        fill: i < review.rating ? '#D4841A' : 'transparent',
                      }} />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p style={{ fontSize: 13, color: '#2C3E50', margin: 0, lineHeight: 1.6 }}>
                    {review.comment}
                  </p>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
