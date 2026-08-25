import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import { adminApi } from '../services/api'

export interface VendorApplication {
  id: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  officeName: string
  officeLocation: string
  contactPhone: string
  contactWhatsApp: string
  plan: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

interface VendorApplicationContextType {
  applications: VendorApplication[]
  isLoadingApplications: boolean
  addApplication: (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => void
  approveApplication: (id: string) => void
  rejectApplication: (id: string) => void
  deleteApplication: (id: string) => void
  getClientApplication: (clientId: string) => VendorApplication | undefined
}

const VendorApplicationContext = createContext<VendorApplicationContextType | null>(null)

const initialApplications: VendorApplication[] = [
  {
    id: 'app-001',
    clientId: 'c5',
    clientName: 'Amara Koroma',
    clientEmail: 'amara@email.com',
    clientPhone: '+255 723 456 789',
    officeName: 'Koroma Cleaners',
    officeLocation: '12 Chole Road, Masaki, Dar es Salaam',
    contactPhone: '+255 723 456 789',
    contactWhatsApp: '+255 723 456 789',
    plan: 'basic',
    status: 'pending',
    submittedAt: '2026-08-20',
  },
  {
    id: 'app-002',
    clientId: 'c6',
    clientName: 'Jabari Mensah',
    clientEmail: 'jabari@email.com',
    clientPhone: '+255 712 345 678',
    officeName: 'Jabari Laundry Hub',
    officeLocation: '27 Kariakoo Street, Ilala',
    contactPhone: '+255 712 345 678',
    contactWhatsApp: '+255 712 345 678',
    plan: 'pro',
    status: 'pending',
    submittedAt: '2026-08-19',
  },
  {
    id: 'app-003',
    clientId: 'c7',
    clientName: 'Nadia Bakari',
    clientEmail: 'nadia@email.com',
    clientPhone: '+255 734 567 890',
    officeName: 'Fresh Press Co.',
    officeLocation: '5 Safari Way, CBD, Floor 3',
    contactPhone: '+255 734 567 890',
    contactWhatsApp: '+255 734 567 890',
    plan: 'enterprise',
    status: 'approved',
    submittedAt: '2026-08-18',
  },
]

type ApiApplication = {
  id: number
  client_id: number
  office_name: string
  office_location: string | null
  contact_phone: string | null
  contact_whatsapp: string | null
  plan: string
  status: string
  created_at: string
  client?: { name?: string; email?: string; phone?: string } | null
}

function mapApiApplication(a: ApiApplication): VendorApplication {
  return {
    id: String(a.id),
    clientId: String(a.client_id),
    clientName: a.client?.name ?? '',
    clientEmail: a.client?.email ?? '',
    clientPhone: a.client?.phone ?? a.contact_phone ?? '',
    officeName: a.office_name,
    officeLocation: a.office_location ?? '',
    contactPhone: a.contact_phone ?? '',
    contactWhatsApp: a.contact_whatsapp ?? '',
    plan: a.plan,
    status: (a.status as VendorApplication['status']) || 'pending',
    submittedAt: (a.created_at ?? '').split('T')[0],
  }
}

export function VendorApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<VendorApplication[]>(initialApplications)
  const [isLoadingApplications, setIsLoadingApplications] = useState(true)

  // Load live applications from the backend; fall back to the demo seed if
  // the API is unreachable so the panel stays usable offline.
  useEffect(() => {
    let cancelled = false
    adminApi
      .getApplications()
      .then((res) => {
        if (cancelled) return
        const data = res.data?.data
        if (Array.isArray(data)) setApplications(data.map(mapApiApplication))
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoadingApplications(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addApplication = (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: VendorApplication = {
      ...app,
      id: `local-${Date.now()}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    }
    setApplications((prev) => [...prev, newApp])
  }

  const approveApplication = (id: string) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' as const } : a))
    adminApi.approveApplication(id).catch(() => {})
  }

  const rejectApplication = (id: string) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' as const } : a))
    adminApi.rejectApplication(id).catch(() => {})
  }

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  const getClientApplication = (clientId: string) => {
    return applications.find((a) => a.clientId === clientId)
  }

  return (
    <VendorApplicationContext.Provider value={{
      applications, isLoadingApplications, addApplication, approveApplication, rejectApplication, deleteApplication, getClientApplication,
    }}>
      {children}
    </VendorApplicationContext.Provider>
  )
}

export function useVendorApplications() {
  const ctx = useContext(VendorApplicationContext)
  if (!ctx) throw new Error('useVendorApplications must be used within VendorApplicationProvider')
  return ctx
}
