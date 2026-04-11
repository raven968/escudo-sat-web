'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/auth'
import type { User } from '@/types'

interface RegisterResponse {
  token: string
  user: User
}

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tenant_name: '',
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.password_confirmation) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      const res = await api.post<RegisterResponse>('/auth/register', form)
      setAuth(res.token, res.user)
      router.push('/dashboard')
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> }
      if (apiErr?.errors) {
        const firstError = Object.values(apiErr.errors)[0]?.[0]
        toast.error(firstError ?? 'Error al registrarse')
      } else {
        toast.error(apiErr?.message ?? 'Error al registrarse')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Crear cuenta</CardTitle>
        <CardDescription>Registra tu despacho o empresa en Escudo SAT</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenant_name">Nombre del despacho / empresa</Label>
            <Input
              id="tenant_name"
              name="tenant_name"
              placeholder="Despacho Fiscal Ej. S.C."
              required
              value={form.tenant_name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Tu nombre completo</Label>
            <Input
              id="name"
              name="name"
              placeholder="Juan Pérez"
              required
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="contador@despacho.mx"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password_confirmation">Confirmar contraseña</Label>
            <Input
              id="password_confirmation"
              name="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password_confirmation}
              onChange={handleChange}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary underline-offset-4 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
