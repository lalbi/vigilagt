// src/app/admin/logout-button.tsx
'use client'

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AdminLogout() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="font-mono text-xs text-[#5a6478] hover:text-red-400 transition-colors"
    >
      Cerrar sesión
    </button>
  )
}
