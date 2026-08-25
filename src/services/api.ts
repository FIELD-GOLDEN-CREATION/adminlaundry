import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'https://freshfold.qecure.online/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
    }
    return Promise.reject(error)
  }
)

export const adminApi = {
  // User management
  getUsers: (role?: string) => {
    const params = role ? { role } : {}
    return api.get('/admin/users', { params })
  },
  createUser: (data: { name: string; email: string; password: string; role: string; phone?: string }) => {
    return api.post('/admin/users', data)
  },
  deleteUser: (id: number) => {
    return api.delete(`/admin/users/${id}`)
  },
  updateUser: (id: number | string, data: Record<string, unknown>) => {
    return api.put(`/admin/users/${id}`, data)
  },

  // Vendor applications
  getApplications: () => {
    return api.get('/admin/applications')
  },
  approveApplication: (id: number | string) => {
    return api.put(`/admin/applications/${id}/approve`)
  },
  rejectApplication: (id: number | string) => {
    return api.put(`/admin/applications/${id}/reject`)
  },

  // Dashboard
  getDashboard: () => {
    return api.get('/admin/dashboard')
  },
  getDashboardOrders: (params?: { status?: string; vendor?: string }) => {
    return api.get('/admin/orders', { params })
  },

  // Shops
  getShops: () => {
    return api.get('/admin/shops')
  },
  updateShop: (id: number | string, data: Record<string, unknown>) => {
    return api.put(`/admin/shops/${id}`, data)
  },
  deleteShop: (id: number | string) => {
    return api.delete(`/admin/shops/${id}`)
  },

  // Promos
  getPromos: () => {
    return api.get('/admin/promos')
  },
  createPromo: (data: Record<string, unknown>) => {
    return api.post('/admin/promos', data)
  },
  updatePromo: (id: number | string, data: Record<string, unknown>) => {
    return api.put(`/admin/promos/${id}`, data)
  },
  deletePromo: (id: number | string) => {
    return api.delete(`/admin/promos/${id}`)
  },

  // Subscriptions
  getSubscriptions: () => {
    return api.get('/admin/subscriptions')
  },

  // Notifications
  getNotifications: () => {
    return api.get('/admin/notifications')
  },
  markNotificationRead: (id: number) => {
    return api.put(`/admin/notifications/${id}/read`)
  },
  markAllNotificationsRead: () => {
    return api.put('/admin/notifications/read-all')
  },

  // Reports
  getReports: () => {
    return api.get('/admin/reports')
  },

  // Settings
  getSettings: () => {
    return api.get('/admin/settings')
  },
  updateSettings: (settings: { key: string; value: string }[]) => {
    return api.put('/admin/settings', { settings })
  },
}
