import { Badge } from '@/components/ui/badge'
import type { RfcAccount } from '@/types'

const statusConfig = {
  success: { label: 'Sincronizado', className: 'border-green-500 text-green-600' },
  failed: { label: 'Error', className: 'border-destructive text-destructive' },
  pending: { label: 'Pendiente', className: 'border-amber-500 text-amber-600' },
}

export function RfcStatusBadge({ status }: { status: RfcAccount['last_sync_status'] }) {
  if (!status) return <Badge variant="outline" className="text-muted-foreground">Sin sincronizar</Badge>
  const { label, className } = statusConfig[status]
  return <Badge variant="outline" className={className}>{label}</Badge>
}
