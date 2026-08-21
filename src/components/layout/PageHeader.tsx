import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  backTo?: string
  action?: ReactNode
}

export function PageHeader({ title, description, eyebrow, backTo, action }: PageHeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (backTo) navigate(backTo)
    else navigate(-1)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-3">
        {backTo && (
          <button
            onClick={handleBack}
            className="mt-0.5 p-2 -ml-2 text-[#64748B] hover:text-[#2C3E50] hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div>
          {eyebrow ? (
            <p className="text-[#D4841A] text-sm font-semibold uppercase tracking-wide">{eyebrow}</p>
          ) : (
            <p className="text-[#D4841A] text-sm font-semibold uppercase tracking-wide opacity-0">.</p>
          )}
          <h1 className="text-2xl font-bold text-[#2C3E50] mt-0.5 leading-tight">{title}</h1>
          {description && <p className="text-[#64748B] text-sm mt-1">{description}</p>}
        </div>
      </div>
      {action && <div className="self-start sm:self-auto flex items-center gap-2">{action}</div>}
    </div>
  )
}
