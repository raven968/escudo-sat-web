'use client'

import { useQuery } from '@tanstack/react-query'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { SatStatusBadge } from '@/components/dashboard/SatStatusBadge'
import { RecentAlerts } from '@/components/dashboard/RecentAlerts'
import { CfdiChart } from '@/components/dashboard/CfdiChart'
import { api } from '@/lib/api'
import type { DashboardSummary, PaginatedResponse, Alert } from '@/types'

export default function DashboardPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => api.get<DashboardSummary>('/dashboard/summary'),
  })

  const { data: alerts, isLoading: loadingAlerts } = useQuery({
    queryKey: ['alerts-recent'],
    queryFn: () =>
      api.get<PaginatedResponse<Alert>>('/alerts?per_page=5&is_read=false'),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Resumen general de tu despacho</p>
        </div>
        <SatStatusBadge />
      </div>

      <StatsCards data={summary} isLoading={loadingSummary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CfdiChart />
        <RecentAlerts alerts={alerts?.data} isLoading={loadingAlerts} />
      </div>
    </div>
  )
}
