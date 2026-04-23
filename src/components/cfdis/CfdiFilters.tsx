'use client'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import type { RfcAccount } from '@/types'

export interface CfdiFilters {
  rfc_account_id: string
  tipo_comprobante: string
  direction: string
  estatus: string
  fecha_desde: string
  fecha_hasta: string
}

export const emptyFilters: CfdiFilters = {
  rfc_account_id: '',
  tipo_comprobante: '',
  direction: '',
  estatus: '',
  fecha_desde: '',
  fecha_hasta: '',
}

const DIRECTION_ITEMS = [
  { value: 'emitido', label: 'Emitidas' },
  { value: 'recibido', label: 'Recibidas' },
]

const TIPO_ITEMS = [
  { value: 'I', label: 'Ingreso' },
  { value: 'E', label: 'Egreso' },
  { value: 'P', label: 'Pago' },
  { value: 'N', label: 'Nómina' },
  { value: 'T', label: 'Traslado' },
]

const ESTATUS_ITEMS = [
  { value: 'vigente', label: 'Vigente' },
  { value: 'cancelado', label: 'Cancelado' },
]

interface CfdiFiltersProps {
  filters: CfdiFilters
  onChange: (filters: CfdiFilters) => void
  rfcs?: RfcAccount[]
}

export function CfdiFiltersBar({ filters, onChange, rfcs }: CfdiFiltersProps) {
  const hasFilters = Object.values(filters).some(Boolean)

  function set(key: keyof CfdiFilters, value: string) {
    onChange({ ...filters, [key]: value })
  }

  const rfcItems = rfcs?.map((r) => ({ value: r.id, label: r.rfc })) ?? []

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={filters.rfc_account_id}
        onValueChange={(v) => set('rfc_account_id', v ?? '')}
        items={rfcItems}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Todos los RFCs" />
        </SelectTrigger>
        <SelectContent>
          {rfcs?.map((r) => (
            <SelectItem key={r.id} value={r.id} label={r.rfc}>
              {r.rfc}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.direction}
        onValueChange={(v) => set('direction', v ?? '')}
        items={DIRECTION_ITEMS}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Dirección" />
        </SelectTrigger>
        <SelectContent>
          {DIRECTION_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tipo_comprobante}
        onValueChange={(v) => set('tipo_comprobante', v ?? '')}
        items={TIPO_ITEMS}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          {TIPO_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.estatus}
        onValueChange={(v) => set('estatus', v ?? '')}
        items={ESTATUS_ITEMS}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Estatus" />
        </SelectTrigger>
        <SelectContent>
          {ESTATUS_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value} label={item.label}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-36 h-8 text-sm"
        value={filters.fecha_desde}
        onChange={(e) => set('fecha_desde', e.target.value)}
        placeholder="Desde"
      />
      <Input
        type="date"
        className="w-36 h-8 text-sm"
        value={filters.fecha_hasta}
        onChange={(e) => set('fecha_hasta', e.target.value)}
        placeholder="Hasta"
      />

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(emptyFilters)}
          className="gap-1 text-muted-foreground"
        >
          <X className="h-3 w-3" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
