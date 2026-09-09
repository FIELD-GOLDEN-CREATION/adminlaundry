import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'

export type StatTone = 'teal' | 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'slate'

const toneColors: Record<StatTone, { fg: string; bg: string }> = {
  teal: { fg: '#1A5C58', bg: '#E8F2F1' },
  amber: { fg: '#D4841A', bg: '#FDF3E3' },
  blue: { fg: '#1F5ECC', bg: '#E3EEFF' },
  green: { fg: '#1A7A5C', bg: '#DFF5ED' },
  red: { fg: '#C0553F', bg: '#F3D5CE' },
  purple: { fg: '#7C3AED', bg: '#EFE7F7' },
  slate: { fg: '#64748B', bg: '#F1F5F9' },
}

export interface StatTileItem {
  label: string
  value: React.ReactNode
  /** Optional leading icon in a tinted box. */
  icon?: LucideIcon
  /** Preset accent; overridden by `color`. */
  tone?: StatTone
  /** Explicit accent color for the icon box / value. */
  color?: string
  /** Explicit tile background (pastel tile look). */
  bg?: string
  /** Small line under the label. */
  sub?: React.ReactNode
  /** Trailing delta text, e.g. "+8.3%". */
  delta?: string
  /** Delta direction color: true = green, false = red, undefined = neutral. */
  deltaUp?: boolean
  /** Appended to the value, e.g. "★". */
  suffix?: string
  /** Paint the value in the accent color. */
  accentValue?: boolean
}

interface StatTilesProps {
  items: StatTileItem[]
  /** 'card' = white panel tiles; 'dark' = translucent tiles for dark heroes. */
  variant?: 'card' | 'dark'
  /** Center value + label (KPI look). */
  center?: boolean
}

/**
 * The single shared counting widget used by every admin page.
 *
 * Desktop: auto-fitting grid. Phones (<=640px): the tiles become one
 * sideways-scrollable snap row instead of a long vertical stack, and any
 * `.data-table-card` table scrolls horizontally via the companion CSS.
 */
export function StatTiles({ items, variant = 'card', center = false }: StatTilesProps) {
  const dark = variant === 'dark'
  return (
    <div className="stat-tiles">
      {items.map((item) => {
        const tone = item.tone ? toneColors[item.tone] : undefined
        const fg = item.color ?? tone?.fg ?? (dark ? '#F5F0E8' : '#1A5C58')
        const tileBg = item.bg ?? tone?.bg
        return (
          <div
            key={item.label}
            className={dark ? 'stat-tile-dark' : 'stat-tile2'}
            style={tileBg ? { background: tileBg, borderColor: 'transparent' } : undefined}
          >
            {item.icon && !center && (
              <span
                className="stat-tile2-icon"
                style={
                  tileBg
                    ? { background: 'rgba(255,255,255,0.65)', color: fg }
                    : { background: `${fg}14`, color: fg }
                }
              >
                <item.icon size={18} />
              </span>
            )}
            <span className={center ? 'stat-tile2-body center' : 'stat-tile2-body'}>
              <span className="stat-tile2-label">{item.label}</span>
              {item.sub && <span className="stat-tile2-sub">{item.sub}</span>}
              <span className="stat-tile2-value-row">
                <span
                  className="stat-tile2-value"
                  style={item.accentValue ? { color: fg } : undefined}
                >
                  {item.value}
                  {item.suffix && <span className="stat-tile2-suffix">{item.suffix}</span>}
                </span>
                {item.delta && (
                  <span
                    className="stat-tile2-delta"
                    style={{
                      color: dark
                        ? item.deltaUp === false
                          ? '#F0B4A8'
                          : '#8FD6C4'
                        : item.deltaUp === undefined
                          ? undefined
                          : item.deltaUp
                            ? '#1A7A5C'
                            : '#C0553F',
                    }}
                  >
                    {item.deltaUp === undefined ? null : item.deltaUp ? (
                      <TrendingUp size={11} />
                    ) : (
                      <TrendingDown size={11} />
                    )}{' '}
                    {item.delta}
                  </span>
                )}
              </span>
            </span>
          </div>
        )
      })}
    </div>
  )
}
