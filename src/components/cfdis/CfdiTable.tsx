'use client'

import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AlertTriangle } from 'lucide-react'
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

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' }).format(new Date(date))
}

interface CfdiTableProps {
  cfdis?: Cfdi[]
  isLoading: boolean
  onSelect: (cfdi: Cfdi) => void
}

export function CfdiTable({ cfdis, isLoading, onSelect }: CfdiTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-11 w-full" />
        ))}
      </div>
    )
  }

  if (!cfdis || cfdis.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No se encontraron CFDIs con los filtros seleccionados.
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Emisor</TableHead>
          <TableHead>Receptor</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Estatus</TableHead>
          <TableHead>Dirección</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cfdis.map((cfdi) => (
          <TableRow
            key={cfdi.id}
            className="cursor-pointer"
            onClick={() => onSelect(cfdi)}
          >
            <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDate(cfdi.fecha_emision)}
            </TableCell>
            <TableCell>
              <Badge variant="secondary" className="text-xs">
                {tipoLabel[cfdi.tipo_comprobante] ?? cfdi.tipo_comprobante}
              </Badge>
            </TableCell>
            <TableCell className="max-w-40">
              <p className="font-mono text-xs text-muted-foreground">{cfdi.rfc_emisor}</p>
              <p className="text-sm truncate">{cfdi.nombre_emisor}</p>
            </TableCell>
            <TableCell className="max-w-40">
              <p className="font-mono text-xs text-muted-foreground">{cfdi.rfc_receptor}</p>
              <p className="text-sm truncate">{cfdi.nombre_receptor}</p>
            </TableCell>
            <TableCell className="text-right font-medium whitespace-nowrap">
              {formatCurrency(cfdi.total, cfdi.moneda)}
              {cfdi.moneda !== 'MXN' && (
                <span className="text-xs text-muted-foreground ml-1">{cfdi.moneda}</span>
              )}
            </TableCell>
            <TableCell>
              <Badge
                variant="outline"
                className={
                  cfdi.estatus === 'vigente'
                    ? 'border-green-500 text-green-600'
                    : 'border-destructive text-destructive'
                }
              >
                {cfdi.estatus}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs capitalize">
                  {cfdi.direction}
                </Badge>
                {cfdi.is_suspicious && (
                  <span title={cfdi.suspicion_reason ?? 'CFDI sospechoso'}>
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  </span>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
