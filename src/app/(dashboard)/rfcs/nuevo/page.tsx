'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FielUploader } from '@/components/rfcs/FielUploader'
import { api } from '@/lib/api'

export default function NuevoRfcPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cerFile, setCerFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    rfc: '',
    razon_social: '',
    regimen_fiscal: '',
    fiel_password: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cerFile || !keyFile) {
      toast.error('Debes subir los archivos .cer y .key de la e.firma')
      return
    }

    const body = new FormData()
    body.append('rfc', form.rfc.toUpperCase().trim())
    body.append('razon_social', form.razon_social)
    body.append('regimen_fiscal', form.regimen_fiscal)
    body.append('fiel_password', form.fiel_password)
    body.append('cer_file', cerFile)
    body.append('key_file', keyFile)

    setLoading(true)
    try {
      await api.postForm('/rfc-accounts', body)
      toast.success('RFC registrado correctamente')
      router.push('/rfcs')
    } catch (err: unknown) {
      const apiErr = err as { message?: string; errors?: Record<string, string[]> }
      if (apiErr?.errors) {
        const firstError = Object.values(apiErr.errors)[0]?.[0]
        toast.error(firstError ?? 'Error al registrar el RFC')
      } else {
        toast.error(apiErr?.message ?? 'Error al registrar el RFC')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/rfcs" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Agregar RFC</h1>
          <p className="text-muted-foreground text-sm">Registra un nuevo RFC para monitorear sus CFDIs</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos del contribuyente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC <span className="text-destructive">*</span></Label>
                <Input
                  id="rfc"
                  name="rfc"
                  placeholder="ABC123456AB1"
                  required
                  maxLength={13}
                  className="font-mono uppercase"
                  value={form.rfc}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="regimen_fiscal">Régimen fiscal</Label>
                <Input
                  id="regimen_fiscal"
                  name="regimen_fiscal"
                  placeholder="ej. 612"
                  value={form.regimen_fiscal}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="razon_social">Razón social <span className="text-destructive">*</span></Label>
              <Input
                id="razon_social"
                name="razon_social"
                placeholder="Empresa Ejemplo S.A. de C.V."
                required
                value={form.razon_social}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">e.firma (FIEL)</CardTitle>
            <p className="text-sm text-muted-foreground">
              Los archivos se almacenan cifrados. La contraseña nunca se registra en texto plano.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FielUploader
              cerFile={cerFile}
              keyFile={keyFile}
              onCerChange={setCerFile}
              onKeyChange={setKeyFile}
            />
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="fiel_password">Contraseña de la e.firma <span className="text-destructive">*</span></Label>
              <Input
                id="fiel_password"
                name="fiel_password"
                type="password"
                required
                autoComplete="off"
                value={form.fiel_password}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => router.push('/rfcs')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar RFC'}
          </Button>
        </div>
      </form>
    </div>
  )
}
