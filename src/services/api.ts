import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

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
}
