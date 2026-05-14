'use client'

import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CfdiFiltersBar, emptyFilters, type CfdiFilters } from '@/components/cfdis/CfdiFilters'
import { CfdiTable } from '@/components/cfdis/CfdiTable'
import { CfdiDetailModal } from '@/components/cfdis/CfdiDetailModal'
import { api } from '@/lib/api'
import { sileo } from 'sileo'
import { FileSpreadsheet, FileArchive, Loader2 } from 'lucide-react'
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

function buildExportQuery(filters: CfdiFilters) {
  const params = new URLSearchParams()
  if (filters.rfc_account_id) params.set('rfc_account_id', filters.rfc_account_id)
  if (filters.tipo_comprobante) params.set('tipo_comprobante', filters.tipo_comprobante)
  if (filters.direction) params.set('direction', filters.direction)
  if (filters.estatus) params.set('estatus', filters.estatus)
  if (filters.fecha_desde) params.set('fecha_desde', filters.fecha_desde)
  if (filters.fecha_hasta) params.set('fecha_hasta', filters.fecha_hasta)
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export default function CfdisPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<CfdiFilters>({
    ...emptyFilters,
    rfc_account_id: searchParams.get('rfc_account_id') ?? '',
  })
  const [page, setPage] = useState(1)
  const [selectedCfdi, setSelectedCfdi] = useState<Cfdi | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingZip, setIsExportingZip] = useState(false)

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

  async function handleExport() {
    setIsExporting(true)
    try {
      const filename = `cfdis_${new Date().toISOString().slice(0, 10)}.xlsx`
      await api.download(`/cfdis/export/excel${buildExportQuery(filters)}`, filename)
      sileo.success({ title: 'Exportación lista', description: `${filename} descargado correctamente.` })
    } catch {
      sileo.error({ title: 'Error al exportar', description: 'No se pudo generar el archivo Excel.' })
    } finally {
      setIsExporting(false)
    }
  }

  async function handleExportZip() {
    const cfdi_ids = data?.data.map((c) => c.id) ?? []
    if (cfdi_ids.length === 0) return
    setIsExportingZip(true)
    try {
      const { url, filename, count } = await api.post<{ url: string; filename: string; count: number }>(
        '/cfdis/export',
        { cfdi_ids },
      )
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      sileo.success({ title: 'ZIP listo', description: `${count} XML${count !== 1 ? 's' : ''} descargados.` })
    } catch {
      sileo.error({ title: 'Error al exportar', description: 'No se pudo generar el ZIP.' })
    } finally {
      setIsExportingZip(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">CFDIs</h1>
          <p className="text-muted-foreground text-sm">
            {meta?.total ?? 0} comprobante{meta?.total !== 1 ? 's' : ''} encontrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportZip}
            disabled={isExportingZip || (data?.data.length ?? 0) === 0}
            className="gap-2"
          >
            {isExportingZip ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileArchive className="h-4 w-4" />
            )}
            {isExportingZip ? 'Generando...' : 'Descargar XMLs'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={isExporting || (meta?.total ?? 0) === 0}
            className="gap-2"
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            {isExporting ? 'Exportando...' : 'Exportar Excel'}
          </Button>
        </div>
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
