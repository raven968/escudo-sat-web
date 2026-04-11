'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { AlertCard } from '@/components/alertas/AlertCard'
import { api } from '@/lib/api'
import type { Alert, PaginatedResponse } from '@/types'

type FilterStatus = 'all' | 'unread' | 'unresolved'
type FilterSeverity = '' | 'critical' | 'warning' | 'info'

export default function AlertasPage() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<FilterStatus>('all')
  const [severity, setSeverity] = useState<FilterSeverity>('')
  const [page, setPage] = useState(1)

  function buildQuery() {
    const p = new URLSearchParams({ page: String(page), per_page: '20' })
    if (status === 'unread') p.set('is_read', 'false')
    if (status === 'unresolved') p.set('is_resolved', 'false')
    if (severity) p.set('severity', severity)
    return p.toString()
  }

  const queryKey = ['alerts', status, severity, page]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => api.get<PaginatedResponse<Alert>>(`/alerts?${buildQuery()}`),
  })

  const readMutation = useMutation({
    mutationFn: (id: string) => api.put(`/alerts/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-recent'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-unread-count'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
    onError: () => toast.error('No se pudo marcar la alerta'),
  })

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/alerts/${id}/resolve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] })
      queryClient.invalidateQueries({ queryKey: ['alerts-unread-count'] })
      toast.success('Alerta marcada como resuelta')
    },
    onError: () => toast.error('No se pudo resolver la alerta'),
  })

  async function handleMarkAllRead() {
    const unread = data?.data.filter((a) => !a.is_read) ?? []
    await Promise.all(unread.map((a) => api.put(`/alerts/${a.id}/read`)))
    queryClient.invalidateQueries({ queryKey: ['alerts'] })
    queryClient.invalidateQueries({ queryKey: ['alerts-recent'] })
    queryClient.invalidateQueries({ queryKey: ['alerts-unread-count'] })
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    toast.success('Todas las alertas marcadas como leídas')
  }

  const unreadCount = data?.data.filter((a) => !a.is_read).length ?? 0
  const meta = data?.meta
  const totalPages = meta?.last_page ?? 1
  const isPending = readMutation.isPending || resolveMutation.isPending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Alertas</h1>
          <p className="text-muted-foreground text-sm">
            {meta?.total ?? 0} alerta{meta?.total !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead} disabled={isPending}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Select value={status} onValueChange={(v) => { setStatus((v ?? 'all') as FilterStatus); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="unread">Sin leer</SelectItem>
            <SelectItem value="unresolved">Sin resolver</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severity} onValueChange={(v) => { setSeverity((v ?? '') as FilterSeverity); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Severidad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
            <SelectItem value="warning">Advertencia</SelectItem>
            <SelectItem value="info">Información</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}

        {!isLoading && data?.data.length === 0 && (
          <div className="text-center py-16 text-muted-foreground text-sm">
            No hay alertas con los filtros seleccionados.
          </div>
        )}

        {!isLoading && data?.data.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onRead={(id) => readMutation.mutate(id)}
            onResolve={(id) => resolveMutation.mutate(id)}
            loading={isPending}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            Página {meta?.current_page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              className="text-sm px-3 py-1 rounded border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <button
              className="text-sm px-3 py-1 rounded border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
