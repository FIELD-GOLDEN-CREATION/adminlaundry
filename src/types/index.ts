export type UserRole = 'admin' | 'vendor' | 'staff' | 'driver' | 'customer'

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: UserRole
  photo_url?: string
  firebase_uid?: string
  created_at: string
}

export interface Order {
  id: string
  client: User
  vendor: string
  status: 'pending' | 'assigned' | 'in_wash' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded'
  total: number
  created_at: string
  items: number
  driver?: User
}

export interface KPI {
  label: string
  value: string | number
  change?: number
  icon: string
}

export interface Alert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  time: string
}

export interface Vendor {
  id: string
  name: string
  ordersToday: number
  queue: number
  status: 'healthy' | 'heavy' | 'idle'
}

export interface DriverPin {
  id: string
  name: string
  lat: number
  lng: number
  status: 'active' | 'idle' | 'busy'
}

export interface ReportCategory {
  name: string
  reports: Report[]
}

export interface Report {
  id: string
  name: string
  description: string
  available: boolean
}
