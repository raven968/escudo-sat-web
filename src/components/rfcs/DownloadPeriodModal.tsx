'use client'

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { Download } from 'lucide-react'
import { FormModal } from '@/components/ui/form-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api'

interface Props {
  rfcAccountId: string
  rfc: string
  open: boolean
  onClose: () => void
}

// Fecha de hoy y hace 20 días como defaults
function today() {
  return new Date().toISOString().split('T')[0]
}
function twentyDaysAgo() {
  const d = new Date()
  d.setDate(d.getDate() - 20)
  return d.toISOString().split('T')[0]
}

export function DownloadPeriodModal({ rfcAccountId, rfc, open, onClose }: Props) {
  const [date_from, setDateFrom] = useState(twentyDaysAgo())
  const [date_to, setDateTo] = useState(today())

  const mutation = useMutation({
    mutationFn: () =>
      api.post(`/rfc-accounts/${rfcAccountId}/download`, { date_from, date_to }),
    onSuccess: () => {
      sileo.success({ title: 'Descarga iniciada', description: 'Los CFDIs aparecerán en cuanto el SAT procese la solicitud.' })
      onClose()
    },
    onError: (err: { message?: string; errors?: Record<string, string[]> }) => {
      const msg = Object.values(err.errors ?? {}).flat()[0] ?? err.message ?? 'Error al iniciar la descarga.'
      sileo.error({ title: msg })
    },
  })

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Descargar periodo"
      description={`Solicita la descarga de CFDIs de ${rfc} para un rango de fechas específico. Máximo 20 días por solicitud (restricción del SAT).`}
      size="sm"
    >
      <div className="space-y-4 pt-2">
        <div className="space-y-1.5">
          <Label htmlFor="date-from">Fecha inicio</Label>
          <Input
            id="date-from"
            type="date"
            value={date_from}
            max={date_to}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="date-to">Fecha fin</Label>
          <Input
            id="date-to"
            type="date"
            value={date_to}
            min={date_from}
            max={today()}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            <Download className="h-4 w-4 mr-1.5" />
            {mutation.isPending ? 'Iniciando...' : 'Iniciar descarga'}
          </Button>
        </div>
      </div>
    </FormModal>
  )
}
