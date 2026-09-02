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
  getUser: (id: number | string) => {
    return api.get(`/admin/users/${id}`)
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
  getOrder: (id: number | string) => {
    return api.get(`/admin/orders/${id}`)
  },

  // Shops
  getShops: () => {
    return api.get('/admin/shops')
  },
  getShop: (id: number | string) => {
    return api.get(`/admin/shops/${id}`)
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
  getPromo: (id: number | string) => {
    return api.get(`/admin/promos/${id}`)
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

  // Categories & Items
  getCategories: () => {
    return api.get('/admin/categories')
  },
  createCategory: (data: Record<string, unknown>) => {
    return api.post('/admin/categories', data)
  },
  updateCategory: (id: number | string, data: Record<string, unknown>) => {
    return api.put(`/admin/categories/${id}`, data)
  },
  deleteCategory: (id: number | string) => {
    return api.delete(`/admin/categories/${id}`)
  },
  getItems: () => {
    return api.get('/admin/items')
  },
  createItem: (data: Record<string, unknown>) => {
    return api.post('/admin/items', data)
  },
  updateItem: (id: number | string, data: Record<string, unknown>) => {
    return api.put(`/admin/items/${id}`, data)
  },
  deleteItem: (id: number | string) => {
    return api.delete(`/admin/items/${id}`)
  },

  // Settings
  getSettings: () => {
    return api.get('/admin/settings')
  },
  updateSettings: (settings: { key: string; value: string }[]) => {
    return api.put('/admin/settings', { settings })
  },

  // Packages
  getPackages: () => {
    return api.get('/admin/packages')
  },
  getPackage: (id: number | string) => {
    return api.get(`/admin/packages/${id}`)
  },
  updatePackage: (id: number | string, data: Record<string, unknown>) => {
    return api.put(`/admin/packages/${id}`, data)
  },
  togglePackage: (id: number | string) => {
    return api.put(`/admin/packages/${id}/toggle`)
  },
  deletePackage: (id: number | string) => {
    return api.delete(`/admin/packages/${id}`)
  },

  // Upload
  uploadImage: (file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}
