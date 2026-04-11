'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { FormModal } from '@/components/ui/form-modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FielUploader } from './FielUploader'
import { api } from '@/lib/api'

interface RfcFormModalProps {
  open: boolean
  onClose: () => void
}

const emptyForm = {
  rfc: '',
  razon_social: '',
  regimen_fiscal: '',
  fiel_password: '',
}

export function RfcFormModal({ open, onClose }: RfcFormModalProps) {
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [cerFile, setCerFile] = useState<File | null>(null)
  const [keyFile, setKeyFile] = useState<File | null>(null)
  const [form, setForm] = useState(emptyForm)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleClose() {
    setForm(emptyForm)
    setCerFile(null)
    setKeyFile(null)
    onClose()
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
      queryClient.invalidateQueries({ queryKey: ['rfc-accounts'] })
      handleClose()
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
    <FormModal
      open={open}
      onClose={handleClose}
      title="Agregar RFC"
      description="Registra un nuevo RFC para monitorear sus CFDIs automáticamente."
      size='xl'
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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

        <Separator />

        <div>
          <p className="text-sm font-medium mb-3">e.firma (FIEL)</p>
          <p className="text-xs text-muted-foreground mb-3">
            Los archivos se almacenan cifrados. La contraseña nunca se guarda en texto plano.
          </p>
          <FielUploader
            cerFile={cerFile}
            keyFile={keyFile}
            onCerChange={setCerFile}
            onKeyChange={setKeyFile}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fiel_password">
            Contraseña de la e.firma <span className="text-destructive">*</span>
          </Label>
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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar RFC'}
          </Button>
        </div>
      </form>
    </FormModal>
  )
}
