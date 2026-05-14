'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { User, Building2, Lock } from 'lucide-react'
// Stripe congelado — reactivar BillingCard al reintegrar suscripciones
// import { BillingCard } from '@/components/configuracion/BillingCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { Tenant, User as UserType } from '@/types'

interface MeResponse extends UserType {
  tenant: Tenant
}

export default function ConfiguracionPage() {
  const { setAuth, token } = useAuthStore()

  const { data: me, isLoading } = useQuery<MeResponse>({
    queryKey: ['me'],
    queryFn: () => api.get<MeResponse>('/auth/me'),
  })

  if (isLoading || !me) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground text-sm mt-1">Administra tu perfil y los datos de tu despacho.</p>
      </div>

      <ProfileForm me={me} onUpdate={(updatedUser) => {
        if (token) setAuth(token, updatedUser)
      }} />

      {me.role === 'admin' && <TenantForm me={me} />}

      {/* Stripe congelado — reactivar <BillingCard /> al reintegrar suscripciones */}

      <PasswordForm />
    </div>
  )
}

// ─── Perfil ────────────────────────────────────────────────────────────────────

function ProfileForm({ me, onUpdate }: { me: MeResponse; onUpdate: (u: UserType) => void }) {
  const queryClient = useQueryClient()
  const [name, setName] = useState(me.name)
  const [email, setEmail] = useState(me.email)

  const mutation = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      api.put<MeResponse>('/auth/profile', data),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data)
      onUpdate(data)
      sileo.success({ title: 'Perfil actualizado correctamente.' })
    },
    onError: (err: { message?: string; errors?: Record<string, string[]> }) => {
      const msg = Object.values(err.errors ?? {}).flat()[0] ?? err.message ?? 'Error al guardar.'
      sileo.error({ title: msg })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ name, email })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-4 w-4" />
          Mi perfil
        </CardTitle>
        <CardDescription>Nombre y correo electrónico de tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Despacho ─────────────────────────────────────────────────────────────────

function TenantForm({ me }: { me: MeResponse }) {
  const queryClient = useQueryClient()
  const [tenantName, setTenantName] = useState(me.tenant.name)

  const mutation = useMutation({
    mutationFn: (data: { name: string }) =>
      api.put<MeResponse>('/auth/tenant', data),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data)
      sileo.success({ title: 'Datos del despacho actualizados.' })
    },
    onError: (err: { message?: string; errors?: Record<string, string[]> }) => {
      const msg = Object.values(err.errors ?? {}).flat()[0] ?? err.message ?? 'Error al guardar.'
      sileo.error({ title: msg })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ name: tenantName })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          Mi despacho
        </CardTitle>
        <CardDescription>
          Nombre del despacho o empresa. Visible en reportes y notificaciones.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tenant-name">Nombre del despacho</Label>
            <Input
              id="tenant-name"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-muted-foreground">RFCs contratados</Label>
            <p className="text-sm font-medium">
              {me.tenant.rfc_limit ?? 0} RFC{me.tenant.rfc_limit === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Contraseña ───────────────────────────────────────────────────────────────

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  const mutation = useMutation({
    mutationFn: (data: { current_password: string; password: string; password_confirmation: string }) =>
      api.put('/auth/password', data),
    onSuccess: () => {
      sileo.success({ title: 'Contraseña actualizada correctamente.' })
      setCurrentPassword('')
      setPassword('')
      setPasswordConfirmation('')
    },
    onError: (err: { message?: string; errors?: Record<string, string[]> }) => {
      const msg = Object.values(err.errors ?? {}).flat()[0] ?? err.message ?? 'Error al cambiar contraseña.'
      sileo.error({ title: msg })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutation.mutate({ current_password: currentPassword, password, password_confirmation: passwordConfirmation })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lock className="h-4 w-4" />
          Cambiar contraseña
        </CardTitle>
        <CardDescription>Usa una contraseña segura de al menos 8 caracteres.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="current-password">Contraseña actual</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label htmlFor="new-password">Nueva contraseña</Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm-password">Confirmar nueva contraseña</Label>
            <Input
              id="confirm-password"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Actualizando...' : 'Cambiar contraseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
