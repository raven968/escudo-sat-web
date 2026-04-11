'use client'

import { AlertTriangle, Info, XCircle, CheckCheck, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Alert } from '@/types'

const severityConfig = {
  critical: {
    icon: XCircle,
    containerClass: 'border-destructive/40 bg-destructive/5',
    iconClass: 'text-destructive',
    badge: 'destructive' as const,
    label: 'Crítica',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-amber-400/40 bg-amber-50/50 dark:bg-amber-950/10',
    iconClass: 'text-amber-500',
    badge: 'outline' as const,
    label: 'Advertencia',
  },
  info: {
    icon: Info,
    containerClass: 'border-blue-400/40 bg-blue-50/50 dark:bg-blue-950/10',
    iconClass: 'text-blue-500',
    badge: 'secondary' as const,
    label: 'Información',
  },
}

const typeLabel: Record<string, string> = {
  factura_sospechosa: 'Factura sospechosa',
  csd_por_vencer: 'CSD por vencer',
  fiel_por_vencer: 'FIEL por vencer',
  proveedor_nuevo_monto_alto: 'Proveedor nuevo',
  sat_caido: 'SAT sin servicio',
  sync_fallida: 'Sincronización fallida',
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date))
}

interface AlertCardProps {
  alert: Alert
  onRead: (id: string) => void
  onResolve: (id: string) => void
  loading: boolean
}

export function AlertCard({ alert, onRead, onResolve, loading }: AlertCardProps) {
  const { icon: Icon, containerClass, iconClass, badge, label } = severityConfig[alert.severity]

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4 transition-opacity',
        containerClass,
        alert.is_resolved && 'opacity-50'
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', iconClass)} />

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm font-medium', alert.is_read && 'font-normal text-muted-foreground')}>
            {alert.title}
          </p>
          {!alert.is_read && (
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
          )}
        </div>
        <p className="text-sm text-muted-foreground">{alert.message}</p>
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <Badge variant={badge} className="text-xs">{label}</Badge>
          <Badge variant="outline" className="text-xs">{typeLabel[alert.type] ?? alert.type}</Badge>
          <span className="text-xs text-muted-foreground">{formatDate(alert.created_at)}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {!alert.is_read && (
          <Button
            variant="ghost"
            size="icon"
            title="Marcar como leída"
            disabled={loading}
            onClick={() => onRead(alert.id)}
          >
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
        {!alert.is_resolved && (
          <Button
            variant="ghost"
            size="icon"
            title="Marcar como resuelta"
            disabled={loading}
            onClick={() => onResolve(alert.id)}
          >
            <CheckCheck className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>
    </div>
  )
}
