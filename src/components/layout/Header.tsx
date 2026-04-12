'use client'

import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Bell, LogOut, ShieldCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store/auth'
import { api } from '@/lib/api'
import { MobileNav } from './MobileNav'

export function Header() {
  const router = useRouter()
  const { user, clearAuth } = useAuthStore()

  const { data } = useQuery<{ unread_count: number }>({
    queryKey: ['alerts-unread-count'],
    queryFn: () => api.get('/alerts/unread-count'),
    refetchInterval: 60_000,
  })

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // ignorar errores de red al cerrar sesión
    }
    clearAuth()
    router.push('/login')
  }

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2 md:hidden">
        <MobileNav />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="font-bold text-sm">Escudo SAT</span>
        </div>
      </div>
      <div className="hidden md:block" />

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => router.push('/alertas')}
        >
          <Bell className="h-4 w-4" />
          {(data?.unread_count ?? 0) > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-[10px] flex items-center justify-center font-medium">
              {(data?.unread_count ?? 0) > 9 ? '9+' : data!.unread_count}
            </span>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full outline-none">
            <Avatar className="h-8 w-8 cursor-pointer">
              <AvatarFallback className="text-xs">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/configuracion')}>
                <User className="h-4 w-4" />
                Configuración
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
