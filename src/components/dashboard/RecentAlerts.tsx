'use client'

import Link from 'next/link'
import { AlertTriangle, Info, XCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { Alert } from '@/types'

const severityConfig = {
  critical: { icon: XCircle, className: 'text-destructive', badge: 'destructive' as const },
  warning: { icon: AlertTriangle, className: 'text-amber-500', badge: 'outline' as const },
  info: { icon: Info, className: 'text-blue-500', badge: 'secondary' as const },
}

const severityLabel = {
  critical: 'Crítica',
  warning: 'Advertencia',
  info: 'Info',
}

interface RecentAlertsProps {
  alerts?: Alert[]
  isLoading: boolean
}

export function RecentAlerts({ alerts, isLoading }: RecentAlertsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Alertas recientes</CardTitle>
        <Link
          href="/alertas"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="h-4 w-4 mt-0.5 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        )}
        {!isLoading && (!alerts || alerts.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">Sin alertas recientes</p>
        )}
        {!isLoading && alerts?.map((alert) => {
          const { icon: Icon, className, badge } = severityConfig[alert.severity]
          return (
            <div key={alert.id} className="flex items-start gap-3">
              <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${className}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{alert.title}</p>
                <p className="text-xs text-muted-foreground truncate">{alert.message}</p>
              </div>
              <Badge variant={badge} className="text-[10px] shrink-0">
                {severityLabel[alert.severity]}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
