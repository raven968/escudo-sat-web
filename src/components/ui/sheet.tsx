'use client'

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'

interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Sheet({ open, onClose, children }: SheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-200" />
        <DialogPrimitive.Popup className="fixed inset-y-0 left-0 z-50 w-72 bg-background shadow-xl outline-none data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left duration-200">
          {children}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
