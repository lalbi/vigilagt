// src/app/admin/login/page.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Credenciales incorrectas')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-mono text-2xl font-black tracking-tight mb-1">
            <span className="text-[#1B3A6B]">VIGILA</span>
            <span className="text-white" style={{ WebkitTextStroke: '1px #1B3A6B' }}>GT</span>
          </div>
          <div className="font-mono text-xs text-[#5a6478] tracking-widest uppercase">Panel Administrativo</div>
        </div>

        {/* Form */}
        <div className="bg-[#111318] border border-[#1e2530] rounded-xl p-8">
          <h1 className="font-mono text-sm text-[#8a94a8] mb-6 text-center">Iniciar sesión</h1>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="font-mono text-xs text-[#5a6478] uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-[#0a0c0f] border border-[#1e2530] rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#1B3A6B] transition-colors"
                placeholder="admin@ejemplo.com"
              />
            </div>

            <div>
              <label className="font-mono text-xs text-[#5a6478] uppercase tracking-wider block mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#0a0c0f] border border-[#1e2530] rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#1B3A6B] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="font-mono text-xs text-red-400 bg-red-900/10 border border-red-800/40 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 disabled:opacity-50 text-white font-mono text-sm font-bold py-3 rounded-lg transition-colors mt-2"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center font-mono text-xs text-[#3a4458] mt-6">
          Acceso restringido — solo administradores
        </p>
      </div>
    </div>
  )
}
