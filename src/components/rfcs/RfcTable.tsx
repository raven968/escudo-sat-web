'use client'

import Link from 'next/link'
import { RefreshCw, Trash2, Eye, Plus } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { RfcStatusBadge } from './RfcStatusBadge'
import type { RfcAccount } from '@/types'

interface RfcTableProps {
  rfcs?: RfcAccount[]
  isLoading: boolean
  onSync: (id: string) => void
  onDelete: (id: string) => void
  onAdd?: () => void
  syncing: string | null
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date))
}

export function RfcTable({ rfcs, isLoading, onSync, onDelete, onAdd, syncing }: RfcTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!rfcs || rfcs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        <p>No hay RFCs registrados.</p>
        {onAdd && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Agrega el primero
          </Button>
        )}
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>RFC</TableHead>
          <TableHead>Razón social</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Última sync</TableHead>
          <TableHead>FIEL vence</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rfcs.map((rfc) => (
          <TableRow key={rfc.id}>
            <TableCell className="font-mono font-medium">{rfc.rfc}</TableCell>
            <TableCell className="max-w-48 truncate">{rfc.razon_social}</TableCell>
            <TableCell>
              <RfcStatusBadge status={rfc.last_sync_status} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(rfc.last_sync_at)}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {formatDate(rfc.fiel_expiration_date)}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" title="Ver detalle" onClick={() => {}}>
                  <Link href={`/rfcs/${rfc.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Sincronizar"
                  disabled={syncing === rfc.id}
                  onClick={() => onSync(rfc.id)}
                >
                  <RefreshCw className={`h-4 w-4 ${syncing === rfc.id ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Eliminar"
                  onClick={() => onDelete(rfc.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
