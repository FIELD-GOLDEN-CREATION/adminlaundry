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
  plan?: string
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

export type PackageKind = 'weight' | 'itemCount' | 'household' | 'subscription'

export interface Package {
  id: string
  name: string
  tagline: string
  kind: PackageKind
  priceTzs: number
  priceUnit: string
  inclusions: string[]
  compareAtTzs?: number
  note: string
  tag?: string
  serviceTags: string[]
  active: boolean
  vendor: string
  vendorId: string
  orderCount: number
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

export interface VendorDetail {
  id: string
  name: string
  email: string
  phone: string
  ownerName: string
  location: string
  address: string
  registeredAt: string
  status: 'active' | 'suspended' | 'pending'
  services: string[]
  badges: string[]
  description: string
  rating: number
  reviewCount: number
  totalOrders: number
  totalRevenue: number
  balance: number
  commission: number
  platformFee: number
  isOpen: boolean
  workingDays: string[]
  openTime: string
  closeTime: string
  turnaround: string
}

export interface VendorCategory {
  id: string
  name: string
  items: VendorCategoryItem[]
}

export interface VendorCategoryItem {
  id: string
  name: string
  price: number
  unit: string
  available: boolean
}

export interface VendorPromo {
  id: string
  code: string
  title: string
  description: string
  discountValue: number
  isPercentage: boolean
  appliesTo: string
  targetCategory?: string
  targetItem?: string
  audience: string
  minSpend: number
  maxRedemptions: number
  currentRedemptions: number
  isActive: boolean
  expiresAt: string
}

export interface VendorOrder {
  id: string
  customer: string
  items: string
  total: number
  status: string
  date: string
}

export interface PayoutRecord {
  date: string
  ref: string
  amount: number
}

export interface VendorReview {
  id: string
  customer: string
  rating: number
  comment: string
  date: string
}

export type AuthProvider = 'email' | 'google'

export interface CustomerDetail {
  id: string
  name: string
  email: string
  phone: string
  authProvider: AuthProvider
  photoUrl?: string
  registeredAt: string
  lastLoginAt: string
  status: 'active' | 'suspended'
  totalOrders: number
  totalSpent: number
  favoriteVendorIds: string[]
  addresses: CustomerAddress[]
  preferences: CustomerPreference[]
  paymentMethods: CustomerPaymentMethod[]
}

export interface CustomerAddress {
  label: string
  line: string
}

export interface CustomerPreference {
  label: string
  enabled: boolean
}

export interface CustomerPaymentMethod {
  type: string
  label: string
  last4?: string
}

export interface FavoriteVendor {
  id: string
  name: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string
  rating: number
}
