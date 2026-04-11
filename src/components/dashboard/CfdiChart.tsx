'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api } from '@/lib/api'
import type { RfcAccount } from '@/types'

interface MonthlyStats {
  month: string
  label: string
  emitidos: number
  recibidos: number
  total_emitido: number
  total_recibido: number
}

type ViewMode = 'count' | 'amount'

function formatMXN(value: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value)
}

export function CfdiChart() {
  const [view, setView] = useState<ViewMode>('count')
  const [rfcId, setRfcId] = useState<string>('')

  const { data: rfcs } = useQuery<RfcAccount[]>({
    queryKey: ['rfc-accounts-list'],
    queryFn: () => api.get<{ data: RfcAccount[] }>('/rfc-accounts').then((r) => r.data),
  })

  const { data, isLoading } = useQuery<MonthlyStats[]>({
    queryKey: ['cfdis-monthly-stats', rfcId],
    queryFn: () => {
      const params = new URLSearchParams({ months: '6' })
      if (rfcId) params.set('rfc_account_id', rfcId)
      return api.get(`/cfdis/stats/monthly?${params}`)
    },
  })

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-4 flex-wrap gap-2">
        <CardTitle className="text-base">CFDIs por mes</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={rfcId} onValueChange={(v) => setRfcId(v ?? '')}>
            <SelectTrigger className="w-48 h-8 text-sm">
              <SelectValue placeholder="Todos los RFCs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos los RFCs</SelectItem>
              {rfcs?.map((rfc) => (
                <SelectItem key={rfc.id} value={rfc.id}>
                  {rfc.rfc} — {rfc.razon_social}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-md border p-0.5 text-sm">
            <button
              onClick={() => setView('count')}
              className={`px-3 py-1 rounded transition-colors ${
                view === 'count'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Cantidad
            </button>
            <button
              onClick={() => setView('amount')}
              className={`px-3 py-1 rounded transition-colors ${
                view === 'amount'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monto
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
            No hay datos para mostrar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={view === 'amount' ? (v) => `$${(v / 1000).toFixed(0)}k` : undefined}
                width={view === 'amount' ? 52 : 36}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  view === 'amount' ? formatMXN(value) : value,
                  name === 'emitidos' ? 'Emitidos' : 'Recibidos',
                ]}
                labelFormatter={(label) => `Mes: ${label}`}
              />
              <Legend
                formatter={(value) => (value === 'emitidos' ? 'Emitidos' : 'Recibidos')}
              />
              {view === 'count' ? (
                <>
                  <Bar dataKey="emitidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="recibidos" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </>
              ) : (
                <>
                  <Bar dataKey="total_emitido" name="emitidos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="total_recibido" name="recibidos" fill="hsl(var(--primary) / 0.4)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
