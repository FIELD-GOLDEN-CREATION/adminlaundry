import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getEcho, disconnectEcho } from '@/lib/echo'

export interface OrderEventPayload {
  action: string
  order: {
    id: number
    shop_id: number
    shop_name: string | null
    order_number: string
    status: string
    customer_name: string
    total_tzs: number
    created_at: string | null
  }
}

export interface PromoEventPayload {
  action: string
  promo: {
    id: number
    shop_id: number
    code: string
    current_redemptions: number
    max_redemptions: number | null
    is_active: boolean
  }
}

export type NotificationEventPayload = Record<string, any>

type Unsubscribe = () => void

interface RealtimeContextType {
  onOrderEvent: (cb: (payload: OrderEventPayload) => void) => Unsubscribe
  onPromoEvent: (cb: (payload: PromoEventPayload) => void) => Unsubscribe
  onNotification: (cb: (payload: NotificationEventPayload) => void) => Unsubscribe
}

const RealtimeContext = createContext<RealtimeContextType | undefined>(undefined)

/**
 * Joins the shared `admin` channel (cross-vendor order/promo activity) and
 * the caller's own `user.{id}` channel (personal notifications — the same
 * shape vendor/customer/driver clients already consume) once authenticated,
 * and fans events out to whichever pages subscribed via the hooks below.
 * Centralizing the join/leave here means individual pages never need to
 * know channel names or Echo's `.` event-name convention.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const orderListeners = useRef(new Set<(payload: OrderEventPayload) => void>())
  const promoListeners = useRef(new Set<(payload: PromoEventPayload) => void>())
  const notificationListeners = useRef(new Set<(payload: NotificationEventPayload) => void>())

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      disconnectEcho()
      return
    }

    const echo = getEcho()
    const adminChannel = echo.private('admin')
    const userChannel = echo.private(`user.${user.id}`)

    const handleOrder = (payload: OrderEventPayload) => {
      orderListeners.current.forEach((cb) => cb(payload))
    }
    const handlePromo = (payload: PromoEventPayload) => {
      promoListeners.current.forEach((cb) => cb(payload))
    }
    const handleNotification = (payload: NotificationEventPayload) => {
      notificationListeners.current.forEach((cb) => cb(payload))
    }

    adminChannel.listen('.order.updated', handleOrder)
    adminChannel.listen('.promo.updated', handlePromo)
    userChannel.listen('.notification.created', handleNotification)

    return () => {
      adminChannel.stopListening('.order.updated', handleOrder)
      adminChannel.stopListening('.promo.updated', handlePromo)
      userChannel.stopListening('.notification.created', handleNotification)
      echo.leave('admin')
      echo.leave(`user.${user.id}`)
    }
  }, [isAuthenticated, user?.id])

  const onOrderEvent = (cb: (payload: OrderEventPayload) => void) => {
    orderListeners.current.add(cb)
    return () => orderListeners.current.delete(cb)
  }

  const onPromoEvent = (cb: (payload: PromoEventPayload) => void) => {
    promoListeners.current.add(cb)
    return () => promoListeners.current.delete(cb)
  }

  const onNotification = (cb: (payload: NotificationEventPayload) => void) => {
    notificationListeners.current.add(cb)
    return () => notificationListeners.current.delete(cb)
  }

  return (
    <RealtimeContext.Provider value={{ onOrderEvent, onPromoEvent, onNotification }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext)
  if (!ctx) throw new Error('useRealtime must be used within a RealtimeProvider')
  return ctx
}
