// src/app/admin/page.tsx
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminLogout from './logout-button'
import { supabase } from '@/lib/supabase'

export default async function AdminPanel() {
  const supabaseServer = await createSupabaseServerClient()
  const { data: { user } } = await supabaseServer.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: politicos, error } = await supabase
    .from('politicos')
    .select('id, nombre_completo, cargo_actual, nivel_riesgo, indice_integridad, publicado')
    .order('nombre_completo')

  console.log('politicos:', politicos, 'error:', error)

  const total = politicos?.length ?? 0
  const publicados = politicos?.filter((p: any) => p.publicado).length ?? 0

  return (
    <div className="min-h-screen bg-[#0a0c0f]">
      {/* Header */}
      <div className="border-b border-[#1e2530] bg-[#111318]">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="font-mono text-lg font-black">
              <span className="text-[#1B3A6B]">VIGILA</span>
              <span className="text-white" style={{ WebkitTextStroke: '1px #1B3A6B' }}>GT</span>
            </div>
            <div className="font-mono text-xs text-[#5a6478] border-l border-[#1e2530] pl-4">
              Panel Admin
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="font-mono text-xs text-[#5a6478] hover:text-white transition-colors">
              ← Ver sitio
            </Link>
            <AdminLogout />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { num: total, label: 'Políticos cargados' },
            { num: publicados, label: 'Publicados' },
            { num: total - publicados, label: 'Borradores' },
          ].map((s, i) => (
            <div key={i} className="bg-[#111318] border border-[#1e2530] rounded-xl p-5 text-center">
              <div className="font-mono text-3xl font-black text-white">{s.num}</div>
              <div className="font-mono text-xs text-[#5a6478] uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-mono text-xs text-[#5a6478] uppercase tracking-widest">Políticos</h2>
          <Link
            href="/admin/politicos/nuevo"
            className="bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2"
          >
            + Nuevo político
          </Link>
        </div>

        {/* Tabla */}
        <div className="bg-[#111318] border border-[#1e2530] rounded-xl overflow-hidden">
          {!politicos || politicos.length === 0 ? (
            <div className="text-center py-16 text-[#5a6478] font-mono text-sm">
              No hay políticos cargados aún.{' '}
              <Link href="/admin/politicos/nuevo" className="text-[#1B3A6B] hover:underline">
                Agregar el primero
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2530]">
                  {['Nombre', 'Cargo', 'Riesgo', 'Integridad', 'Estado', ''].map(h => (
                    <th key={h} className="font-mono text-[9px] uppercase tracking-wider text-[#5a6478] text-left py-3 px-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {politicos.map((p: any) => (
                  <tr key={p.id} className="border-b border-[#1e2530] hover:bg-[#0a0c0f] transition-colors">
                    <td className="py-3 px-4 text-white font-medium text-sm">{p.nombre_completo}</td>
                    <td className="py-3 px-4 text-[#8a94a8] text-sm">{p.cargo_actual ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                        p.nivel_riesgo === 'alto' ? 'text-red-400 border-red-800/40 bg-red-900/10' :
                        p.nivel_riesgo === 'medio' ? 'text-orange-400 border-orange-800/40 bg-orange-900/10' :
                        'text-green-400 border-green-800/40 bg-green-900/10'
                      }`}>
                        {p.nivel_riesgo ?? '—'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-sm text-[#C8A84B]">{p.indice_integridad ?? '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border ${
                        p.publicado
                          ? 'text-green-400 border-green-800/40 bg-green-900/10'
                          : 'text-[#5a6478] border-[#252d3a]'
                      }`}>
                        {p.publicado ? 'Publicado' : 'Borrador'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/politicos/${p.id}`}
                        className="font-mono text-xs text-[#1B3A6B] hover:text-white transition-colors"
                      >
                        Editar →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
