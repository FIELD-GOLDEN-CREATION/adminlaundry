import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-[#1A5C58]">404</p>
        <h1 className="text-2xl font-bold text-[#2C3E50] mt-4">Page Not Found</h1>
        <p className="text-[#64748B] mt-2">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-[#1A5C58] text-white text-sm font-medium rounded-lg hover:bg-[#0F423F] transition-colors"
        >
          <Home size={16} />
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
