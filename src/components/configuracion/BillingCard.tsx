'use client'

import { useQuery, useMutation } from '@tanstack/react-query'
import { CreditCard, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import type { Plan, SubscriptionCurrent } from '@/types'

const statusLabel: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  free:      { label: 'Gratis',       variant: 'secondary' },
  active:    { label: 'Activo',       variant: 'default' },
  trialing:  { label: 'Prueba',       variant: 'outline' },
  past_due:  { label: 'Pago vencido', variant: 'destructive' },
  paused:    { label: 'Pausado',      variant: 'outline' },
  cancelled: { label: 'Cancelado',    variant: 'destructive' },
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(amount)
}

export function BillingCard() {
  const { data: current, isLoading: loadingCurrent } = useQuery<SubscriptionCurrent>({
    queryKey: ['subscription', 'current'],
    queryFn: () => api.get('/subscription/current'),
  })

  const { data: plans, isLoading: loadingPlans } = useQuery<Plan[]>({
    queryKey: ['subscription', 'plans'],
    queryFn: () => api.get('/subscription/plans'),
  })

  const checkoutMutation = useMutation({
    mutationFn: (plan_key: string) =>
      api.post<{ checkout_url: string }>('/subscription/checkout', { plan: plan_key }),
    onSuccess: ({ checkout_url }) => { window.location.href = checkout_url },
    onError: () => toast.error('No se pudo iniciar el proceso de pago.'),
  })

  const portalMutation = useMutation({
    mutationFn: () => api.post<{ portal_url: string }>('/subscription/billing-portal'),
    onSuccess: ({ portal_url }) => { window.location.href = portal_url },
    onError: () => toast.error('No se pudo abrir el portal de facturación.'),
  })

  if (loadingCurrent || loadingPlans) {
    return (
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!current || !plans) return null

  const { label: status_label, variant: status_variant } = statusLabel[current.status] ?? statusLabel.free
  const rfc_pct = Math.min((current.rfc_count / current.rfc_limit) * 100, 100)
  const paid_plans = plans.filter((p) => p.key !== 'free')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard className="h-4 w-4" />
          Plan y Facturación
        </CardTitle>
        <CardDescription>Gestiona tu suscripción y límites del plan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Estado actual */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-lg">{current.plan_name}</p>
              <Badge variant={status_variant}>{status_label}</Badge>
            </div>
            {current.price_mxn > 0
              ? <p className="text-sm text-muted-foreground">{formatMXN(current.price_mxn)} / mes</p>
              : <p className="text-sm text-muted-foreground">Sin costo</p>
            }
          </div>
          {current.status !== 'free' && current.status !== 'cancelled' && (
            <Button
              variant="outline"
              size="sm"
              disabled={portalMutation.isPending}
              onClick={() => portalMutation.mutate()}
            >
              {portalMutation.isPending ? 'Abriendo...' : 'Gestionar facturación'}
            </Button>
          )}
        </div>

        {/* Uso de RFCs */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">RFCs monitoreados</span>
            <span className="font-medium">{current.rfc_count} / {current.rfc_limit}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${rfc_pct >= 100 ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${rfc_pct}%` }}
            />
          </div>
          {rfc_pct >= 100 && (
            <p className="text-xs text-destructive">Has alcanzado el límite. Actualiza tu plan para agregar más RFCs.</p>
          )}
        </div>

        <Separator />

        {/* Planes disponibles */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Cambiar plan</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {paid_plans.map((plan) => (
              <div
                key={plan.key}
                className={`rounded-lg border p-4 space-y-3 transition-colors ${
                  plan.is_current ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{plan.name}</p>
                    {plan.is_current && <Badge variant="outline" className="text-xs">Actual</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Hasta {plan.rfc_limit} RFCs</p>
                  <p className="text-base font-bold mt-1">{formatMXN(plan.price_mxn)}<span className="text-xs font-normal text-muted-foreground">/mes</span></p>
                </div>
                <Button
                  size="sm"
                  variant={plan.is_current ? 'outline' : 'default'}
                  className="w-full"
                  disabled={plan.is_current || checkoutMutation.isPending}
                  onClick={() => checkoutMutation.mutate(plan.key)}
                >
                  {plan.is_current ? 'Plan actual' : (
                    <><Zap className="h-3 w-3 mr-1" />{current.price_mxn > 0 ? 'Cambiar' : 'Contratar'}</>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
