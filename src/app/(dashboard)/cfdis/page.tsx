'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { CfdiFiltersBar, emptyFilters, type CfdiFilters } from '@/components/cfdis/CfdiFilters'
import { CfdiTable } from '@/components/cfdis/CfdiTable'
import { CfdiDetailModal } from '@/components/cfdis/CfdiDetailModal'
import { api } from '@/lib/api'
import type { Cfdi, PaginatedResponse, RfcAccount } from '@/types'

function buildQuery(filters: CfdiFilters, page: number) {
  const params = new URLSearchParams({ page: String(page), per_page: '20' })
  if (filters.rfc_account_id) params.set('rfc_account_id', filters.rfc_account_id)
  if (filters.tipo_comprobante) params.set('tipo_comprobante', filters.tipo_comprobante)
  if (filters.direction) params.set('direction', filters.direction)
  if (filters.estatus) params.set('estatus', filters.estatus)
  if (filters.fecha_desde) params.set('fecha_desde', filters.fecha_desde)
  if (filters.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta)
  return params.toString()
}

export default function CfdisPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<CfdiFilters>({
    ...emptyFilters,
    rfc_account_id: searchParams.get('rfc_account_id') ?? '',
  })
  const [page, setPage] = useState(1)
  const [selectedCfdi, setSelectedCfdi] = useState<Cfdi | null>(null)

  const handleFiltersChange = useCallback((f: CfdiFilters) => {
    setFilters(f)
    setPage(1)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['cfdis', filters, page],
    queryFn: () => api.get<PaginatedResponse<Cfdi>>(`/cfdis?${buildQuery(filters, page)}`),
  })

  const { data: rfcsData } = useQuery({
    queryKey: ['rfc-accounts'],
    queryFn: () => api.get<PaginatedResponse<RfcAccount>>('/rfc-accounts'),
  })

  const meta = data?.meta
  const totalPages = meta?.last_page ?? 1

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">CFDIs</h1>
        <p className="text-muted-foreground text-sm">
          {meta?.total ?? 0} comprobante{meta?.total !== 1 ? 's' : ''} encontrados
        </p>
      </div>

      <CfdiFiltersBar
        filters={filters}
        onChange={handleFiltersChange}
        rfcs={rfcsData?.data}
      />

      <Card>
        <CardContent className="pt-4">
          <CfdiTable
            cfdis={data?.data}
            isLoading={isLoading}
            onSelect={setSelectedCfdi}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
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
        </CardContent>
      </Card>

      <CfdiDetailModal
        cfdi={selectedCfdi}
        onClose={() => setSelectedCfdi(null)}
      />
    </div>
  )
}
