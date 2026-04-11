'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, RefreshCw, Building2, Download } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { RfcStatusBadge } from '@/components/rfcs/RfcStatusBadge'
import { DownloadPeriodModal } from '@/components/rfcs/DownloadPeriodModal'
import { api } from '@/lib/api'
import type { RfcAccount } from '@/types'

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' }).format(new Date(date))
}

function formatDateTime(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}

export default function RfcDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [showDownload, setShowDownload] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['rfc-account', id],
    queryFn: () => api.get<{ data: RfcAccount }>(`/rfc-accounts/${id}`),
  })

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['rfc-stats', id],
    queryFn: () => api.get<{ data: Record<string, unknown> }>(`/rfc-accounts/${id}/stats`),
  })

  const syncMutation = useMutation({
    mutationFn: () => api.post(`/rfc-accounts/${id}/sync`),
    onSuccess: () => {
      toast.success('Sincronización iniciada')
      queryClient.invalidateQueries({ queryKey: ['rfc-account', id] })
    },
    onError: () => toast.error('No se pudo iniciar la sincronización'),
  })

  const rfc = data?.data

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rfcs" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="h-7 w-48" />
          ) : (
            <>
              <h1 className="text-2xl font-bold font-mono">{rfc?.rfc}</h1>
              <p className="text-muted-foreground text-sm">{rfc?.razon_social}</p>
            </>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowDownload(true)}
        >
          <Download className="h-4 w-4 mr-1.5" />
          Descargar periodo
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={syncMutation.isPending}
          onClick={() => syncMutation.mutate()}
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
          {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
              </div>
            ) : (
              <div className="divide-y">
                <InfoRow label="RFC" value={<span className="font-mono">{rfc?.rfc}</span>} />
                <InfoRow label="Razón social" value={rfc?.razon_social} />
                <InfoRow label="Régimen fiscal" value={rfc?.regimen_fiscal || '—'} />
                <InfoRow label="Estado" value={<RfcStatusBadge status={rfc?.last_sync_status ?? null} />} />
                <InfoRow
                  label="Activo"
                  value={rfc?.is_active ? 'Sí' : 'No'}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sincronización y vencimientos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}
              </div>
            ) : (
              <div className="divide-y">
                <InfoRow label="Última sync" value={formatDateTime(rfc?.last_sync_at ?? null)} />
                <InfoRow label="Venc. FIEL" value={formatDate(rfc?.fiel_expiration_date ?? null)} />
                <InfoRow label="Venc. CSD" value={formatDate(rfc?.csd_expiration_date ?? null)} />
                <InfoRow label="Registrado" value={formatDate(rfc?.created_at ?? null)} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Estadísticas</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStats ? (
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              {stats?.data && Object.entries(stats.data).map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <p className="text-2xl font-bold">{String(value)}</p>
                  <p className="text-xs text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end">
        <Link
          href={`/cfdis?rfc_account_id=${id}`}
          className="inline-flex items-center h-7 rounded-md border border-border px-2.5 text-[0.8rem] font-medium hover:bg-muted transition-colors"
        >
          Ver CFDIs de este RFC
        </Link>
      </div>

      {rfc && (
        <DownloadPeriodModal
          rfcAccountId={id}
          rfc={rfc.rfc}
          open={showDownload}
          onClose={() => setShowDownload(false)}
        />
      )}
    </div>
  )
}
