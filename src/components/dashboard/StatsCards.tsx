'use client'

import { Building2, FileText, Bell, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardSummary } from '@/types'

interface StatsCardsProps {
  data?: DashboardSummary
  isLoading: boolean
}

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  const stats = [
    {
      title: 'RFCs activos',
      value: data?.rfcs_activos ?? 0,
      sub: `${data?.total_rfcs ?? 0} en total`,
      icon: Building2,
      color: 'text-blue-500',
    },
    {
      title: 'CFDIs este mes',
      value: data?.cfdis_este_mes ?? 0,
      sub: `${data?.total_cfdis ?? 0} histórico`,
      icon: FileText,
      color: 'text-violet-500',
    },
    {
      title: 'Alertas sin leer',
      value: data?.alertas_sin_leer ?? 0,
      sub: 'Requieren atención',
      icon: Bell,
      color: 'text-amber-500',
    },
    {
      title: 'Cobertura fiscal',
      value: data?.rfcs_activos ? `${data.rfcs_activos}/${data.total_rfcs}` : '0/0',
      sub: 'RFCs monitoreados',
      icon: TrendingUp,
      color: 'text-green-500',
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(({ title, value, sub, icon: Icon, color }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
