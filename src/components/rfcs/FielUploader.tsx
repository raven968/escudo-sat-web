'use client'

import { useRef } from 'react'
import { Upload, FileCheck, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface FileInputProps {
  label: string
  accept: string
  file: File | null
  onChange: (file: File | null) => void
  required?: boolean
}

function FileInput({ label, accept, file, onChange, required }: FileInputProps) {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div
        className="flex items-center gap-3 border rounded-lg px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => ref.current?.click()}
      >
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        {file ? (
          <>
            <FileCheck className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm flex-1 truncate">{file.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={(e) => { e.stopPropagation(); onChange(null); if (ref.current) ref.current.value = '' }}
            >
              <X className="h-3 w-3" />
            </Button>
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Seleccionar archivo {accept}</span>
          </>
        )}
      </div>
    </div>
  )
}

interface FielUploaderProps {
  cerFile: File | null
  keyFile: File | null
  onCerChange: (f: File | null) => void
  onKeyChange: (f: File | null) => void
}

export function FielUploader({ cerFile, keyFile, onCerChange, onKeyChange }: FielUploaderProps) {
  return (
    <div className="space-y-4">
      <FileInput
        label="Certificado (.cer)"
        accept=".cer"
        file={cerFile}
        onChange={onCerChange}
        required
      />
      <FileInput
        label="Llave privada (.key)"
        accept=".key"
        file={keyFile}
        onChange={onKeyChange}
        required
      />
    </div>
  )
}
