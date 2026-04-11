'use client'

import { Download, AlertTriangle } from 'lucide-react'
import { FormModal } from '@/components/ui/form-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Cfdi } from '@/types'

const tipoLabel: Record<string, string> = {
  I: 'Ingreso',
  E: 'Egreso',
  P: 'Pago',
  N: 'Nómina',
  T: 'Traslado',
}

function formatCurrency(amount: number, currency = 'MXN') {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(amount)
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date))
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 py-2">
      <span className="text-sm text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

interface CfdiDetailModalProps {
  cfdi: Cfdi | null
  onClose: () => void
}

export function CfdiDetailModal({ cfdi, onClose }: CfdiDetailModalProps) {
  if (!cfdi) return null

  async function handleDownloadXml() {
    const token = localStorage.getItem('auth_token')
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/cfdis/${cfdi!.id}/xml`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    if (!res.ok) return
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cfdi!.uuid_fiscal}.xml`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <FormModal
      open={!!cfdi}
      onClose={onClose}
      title="Detalle del CFDI"
      size="lg"
    >
      <div className="space-y-4 mt-2">
        {cfdi.is_suspicious && (
          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>{cfdi.suspicion_reason ?? 'Este CFDI fue marcado como sospechoso.'}</span>
          </div>
        )}

        <div>
          <p className="text-xs text-muted-foreground font-mono break-all">{cfdi.uuid_fiscal}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{tipoLabel[cfdi.tipo_comprobante]}</Badge>
            <Badge
              variant="outline"
              className={cfdi.estatus === 'vigente' ? 'border-green-500 text-green-600' : 'border-destructive text-destructive'}
            >
              {cfdi.estatus}
            </Badge>
            <Badge variant="outline" className="capitalize">{cfdi.direction}</Badge>
          </div>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-x-6">
          <div className="divide-y">
            <Row label="Fecha emisión" value={formatDateTime(cfdi.fecha_emision)} />
            <Row label="RFC emisor" value={<span className="font-mono">{cfdi.rfc_emisor}</span>} />
            <Row label="Emisor" value={cfdi.nombre_emisor} />
            <Row label="RFC receptor" value={<span className="font-mono">{cfdi.rfc_receptor}</span>} />
            <Row label="Receptor" value={cfdi.nombre_receptor} />
          </div>
          <div className="divide-y">
            <Row label="Subtotal" value={formatCurrency(cfdi.subtotal, cfdi.moneda)} />
            <Row
              label="Total"
              value={<span className="text-base font-bold">{formatCurrency(cfdi.total, cfdi.moneda)}</span>}
            />
            <Row label="Moneda" value={cfdi.moneda} />
            {cfdi.moneda !== 'MXN' && (
              <Row label="Tipo de cambio" value={`$${cfdi.tipo_cambio}`} />
            )}
            <Row label="Método de pago" value={cfdi.metodo_pago ?? '—'} />
            <Row label="Forma de pago" value={cfdi.forma_pago ?? '—'} />
            <Row label="Uso CFDI" value={cfdi.uso_cfdi ?? '—'} />
          </div>
        </div>

        {cfdi.serie && (
          <>
            <Separator />
            <Row label="Serie / Folio" value={`${cfdi.serie ?? ''} ${cfdi.folio ?? ''}`.trim()} />
          </>
        )}

        <Separator />

        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadXml}
            disabled={!cfdi.xml_s3_path}
            className="gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            Descargar XML
          </Button>
        </div>
      </div>
    </FormModal>
  )
}
