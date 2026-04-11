'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { RfcTable } from '@/components/rfcs/RfcTable'
import { RfcFormModal } from '@/components/rfcs/RfcFormModal'
import { api } from '@/lib/api'
import type { PaginatedResponse, RfcAccount, SubscriptionCurrent } from '@/types'

export default function RfcsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)

  const { data: subscription } = useQuery<SubscriptionCurrent>({
    queryKey: ['subscription', 'current'],
    queryFn: () => api.get('/subscription/current'),
  })

  const at_limit = subscription ? subscription.rfc_count >= subscription.rfc_limit : false
  const [syncing, setSyncing] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['rfc-accounts'],
    queryFn: () => api.get<PaginatedResponse<RfcAccount>>('/rfc-accounts'),
  })

  async function handleSync(id: string) {
    setSyncing(id)
    try {
      await api.post(`/rfc-accounts/${id}/sync`)
      toast.success('Sincronización iniciada')
      queryClient.invalidateQueries({ queryKey: ['rfc-accounts'] })
    } catch {
      toast.error('No se pudo iniciar la sincronización')
    } finally {
      setSyncing(null)
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/rfc-accounts/${id}`),
    onSuccess: () => {
      toast.success('RFC eliminado')
      queryClient.invalidateQueries({ queryKey: ['rfc-accounts'] })
      setDeleteId(null)
    },
    onError: () => toast.error('No se pudo eliminar el RFC'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">RFCs</h1>
          <p className="text-muted-foreground text-sm">
            {data?.meta?.total ?? 0} RFC{data?.meta?.total !== 1 ? 's' : ''} registrados
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button size="sm" onClick={() => setShowForm(true)} disabled={at_limit}>
            <Plus className="h-4 w-4" />
            Agregar RFC
          </Button>
          {at_limit && (
            <p className="text-xs text-muted-foreground">
              Límite alcanzado.{' '}
              <a href="/configuracion" className="underline hover:text-foreground">Actualiza tu plan</a>
            </p>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <RfcTable
            rfcs={data?.data}
            isLoading={isLoading}
            onSync={handleSync}
            onDelete={setDeleteId}
            syncing={syncing}
          />
        </CardContent>
      </Card>

      <RfcFormModal open={showForm} onClose={() => setShowForm(false)} />

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogTitle>¿Eliminar RFC?</DialogTitle>
          <DialogDescription>
            Esta acción eliminará el RFC y todos sus CFDIs y archivos asociados. No se puede deshacer.
          </DialogDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
