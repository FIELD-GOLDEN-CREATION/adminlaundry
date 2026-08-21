import { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  backTo?: string
  action?: ReactNode
}

export function PageHeader({ title, description, eyebrow, backTo, action }: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start gap-2">
        {backTo && (
          <Button variant="ghost" size="icon" className="mt-0.5 h-8 w-8" onClick={() => navigate(backTo)}>
            <ArrowLeft size={18} />
          </Button>
        )}
        <div>
          {eyebrow && <p className="text-accent text-xs font-semibold uppercase tracking-wide">{eyebrow}</p>}
          <h1 className="text-2xl font-bold mt-0.5">{title}</h1>
          {description && <p className="text-muted-foreground text-sm mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="self-start sm:self-auto">{action}</div>}
    </div>
  )
}
