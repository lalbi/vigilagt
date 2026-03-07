// src/app/page.tsx
import { supabase } from '@/lib/supabase'
import type { PoliticoResumen } from '@/lib/database.types'
import Link from 'next/link'

// ─── Página de inicio ─────────────────────────────────────
export default async function HomePage() {
  // Últimos políticos agregados
  const { data: recientes } = await supabase
    .from('politicos')
    .select(`
      id, slug, nombre_completo, foto_url,
      cargo_actual, nivel_riesgo, indice_integridad,
      partido_actual:partidos(nombre, siglas, color_hex)
    `)
    .eq('publicado', true)
    .order('created_at', { ascending: false })
    .limit(6)

  // Conteos generales
  const { count: totalPoliticos } = await supabase
    .from('politicos')
    .select('*', { count: 'exact', head: true })
    .eq('publicado', true)

  const { count: totalCasos } = await supabase
    .from('casos')
    .select('*', { count: 'exact', head: true })
    .eq('estado', 'activo')
    .eq('publicado', true)

  return (
    <div>
      {/* HERO */}
      <section className="border-b border-[#1e2530] py-24 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-block font-mono text-xs tracking-[0.2em] uppercase text-[#1B3A6B] bg-[#1B3A6B]/10 border border-[#1B3A6B]/30 px-4 py-1.5 rounded-sm mb-8">
            Plataforma ciudadana · Guatemala
          </div>
          <h1 className="font-playfair text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            El expediente público<br />
            <span className="text-[#1B3A6B]">de la política</span><br />
            guatemalteca
          </h1>
          <p className="text-lg text-[#8a94a8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Historial real de cada político: votaciones, casos de corrupción, patrimonio, promesas de campaña y vínculos empresariales — todo con fuente verificable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/politicos"
              className="bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 text-white font-semibold px-8 py-3 rounded-md transition-colors"
            >
              Ver directorio completo
            </Link>
            <Link
              href="/reportar"
              className="border border-[#1e2530] hover:border-[#252d3a] text-[#8a94a8] hover:text-white font-semibold px-8 py-3 rounded-md transition-colors"
            >
              Reportar información
            </Link>
          </div>
        </div>
      </section>

      {/* ESTADÍSTICAS */}
      <section className="border-b border-[#1e2530] py-12 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: totalPoliticos ?? 0, label: 'Perfiles documentados', color: 'text-white' },
              { num: totalCasos ?? 0, label: 'Casos activos', color: 'text-red-400' },
              { num: '100%', label: 'Fuentes verificables', color: 'text-green-400' },
              { num: '0', label: 'Costo para el ciudadano', color: 'text-[#C8A84B]' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#111318] border border-[#1e2530] rounded-lg p-6 text-center">
                <div className={`font-playfair text-4xl font-black mb-2 ${stat.color}`}>
                  {stat.num}
                </div>
                <div className="font-mono text-xs text-[#5a6478] uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POLÍTICOS RECIENTES */}
      {recientes && recientes.length > 0 && (
        <section className="py-16 px-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-mono text-xs tracking-[0.15em] uppercase text-[#5a6478]">
                Últimos perfiles agregados
              </h2>
              <Link
                href="/politicos"
                className="font-mono text-xs text-[#1B3A6B] hover:text-white transition-colors"
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recientes.map((p: any) => (
                <PoliticoCard key={p.id} politico={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* LLAMADO A LA ACCIÓN */}
      <section className="border-t border-[#1e2530] py-20 px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-playfair text-3xl font-black text-white mb-4">
            ¿Tiene información verificable?
          </h2>
          <p className="text-[#8a94a8] mb-8">
            Si cuenta con documentos, expedientes o fuentes públicas sobre algún político guatemalteco, puede reportarlo. Todo reporte pasa por moderación antes de publicarse.
          </p>
          <Link
            href="/reportar"
            className="inline-flex items-center gap-2 bg-red-900/20 border border-red-800/40 text-red-400 hover:bg-red-900/30 font-semibold px-8 py-3 rounded-md transition-colors"
          >
            ⚠️ Enviar reporte ciudadano
          </Link>
        </div>
      </section>
    </div>
  )
}

// ─── Componente: tarjeta de político ─────────────────────
function PoliticoCard({ politico }: { politico: any }) {
  const riesgoColor = {
    alto: 'text-red-400 border-red-800/40 bg-red-900/10',
    medio: 'text-orange-400 border-orange-800/40 bg-orange-900/10',
    bajo: 'text-green-400 border-green-800/40 bg-green-900/10',
  }[politico.nivel_riesgo as string] ?? 'text-gray-400'

  return (
    <Link
      href={`/politicos/${politico.slug}`}
      className="group bg-[#111318] border border-[#1e2530] hover:border-[#252d3a] rounded-lg p-5 flex items-center gap-4 transition-all"
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-md bg-[#1e2530] flex items-center justify-center text-[#1B3A6B] font-playfair font-bold text-lg flex-shrink-0 overflow-hidden">
        {politico.foto_url ? (
          <img src={politico.foto_url} alt={politico.nombre_completo} className="w-full h-full object-cover" />
        ) : (
          politico.nombre_completo.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white group-hover:text-[#1B3A6B] transition-colors truncate">
          {politico.nombre_completo}
        </div>
        <div className="font-mono text-xs text-[#5a6478] mt-0.5 truncate">
          {politico.cargo_actual ?? 'Sin cargo actual'}
        </div>
        {politico.partido_actual && (
          <div className="font-mono text-xs text-[#8a94a8] mt-0.5">
            {politico.partido_actual.siglas}
          </div>
        )}
      </div>

      {/* Riesgo */}
      <div className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded border flex-shrink-0 ${riesgoColor}`}>
        {politico.nivel_riesgo}
      </div>
    </Link>
  )
}
