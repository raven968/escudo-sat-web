'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ShieldCheck, X, LayoutDashboard, Building2, FileText, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/rfcs', label: 'RFCs', icon: Building2 },
  { href: '/cfdis', label: 'CFDIs', icon: FileText },
  { href: '/alertas', label: 'Alertas', icon: Bell },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
        <Menu className="h-5 w-5" />
      </Button>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="font-bold">Escudo SAT</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      </Sheet>
    </>
  )
}
