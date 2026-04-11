'use client'

import { useQuery } from '@tanstack/react-query'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { api } from '@/lib/api'
import type { SatStatus } from '@/types'

export function SatStatusBadge() {
  const { data, isLoading } = useQuery({
    queryKey: ['sat-status'],
    queryFn: () => api.get<SatStatus>('/sat/status'),
    refetchInterval: 1000 * 60 * 5, // refresca cada 5 min
  })

  if (isLoading) {
    return (
      <Badge variant="outline" className="gap-1.5">
        <AlertCircle className="h-3 w-3 text-muted-foreground" />
        Verificando SAT...
      </Badge>
    )
  }

  const available = data?.is_available

  return (
    <Badge
      variant="outline"
      className={available ? 'gap-1.5 border-green-500 text-green-600' : 'gap-1.5 border-destructive text-destructive'}
    >
      {available ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      SAT {available ? 'en línea' : 'sin servicio'}
    </Badge>
  )
}
