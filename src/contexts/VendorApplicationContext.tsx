import { createContext, useContext, useState, type ReactNode } from 'react'

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

export function VendorApplicationProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<VendorApplication[]>(initialApplications)

  const addApplication = (app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>) => {
    const newApp: VendorApplication = {
      ...app,
      id: `app-${String(applications.length + 1).padStart(3, '0')}`,
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
    }
    setApplications((prev) => [...prev, newApp])
  }

  const approveApplication = (id: string) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved' as const } : a))
  }

  const rejectApplication = (id: string) => {
    setApplications((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' as const } : a))
  }

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  const getClientApplication = (clientId: string) => {
    return applications.find((a) => a.clientId === clientId)
  }

  return (
    <VendorApplicationContext.Provider value={{
      applications, addApplication, approveApplication, rejectApplication, deleteApplication, getClientApplication,
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
