import { Loader2 } from 'lucide-react'
import { Badge } from '@/app/components/ui/badge'

interface HeaderTitleProps {
  title: string
  count?: number
  loading?: boolean
}

export function HeaderTitle({
  title,
  count,
  loading = false,
}: HeaderTitleProps) {
  return (
    <div className="flex gap-2 items-center min-w-0">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight truncate">
        {title}
      </h2>
      {loading && (
        <Badge variant="secondary" className="shrink-0">
          <Loader2 className="h-4 w-4 animate-spin" />
        </Badge>
      )}
      {!loading && count !== undefined && count > 0 && (
        <Badge variant="secondary" className="shrink-0">
          {count}
        </Badge>
      )}
    </div>
  )
}
