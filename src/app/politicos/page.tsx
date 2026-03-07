// src/app/politicos/page.tsx
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import type { NivelRiesgo } from '@/lib/database.types'

interface SearchParams {
  q?: string
  riesgo?: string
  partido?: string
  cargo?: string
}

export default async function DirectorioPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  // Query base
  let query = supabase
    .from('politicos')
    .select(`
      id, slug, nombre_completo, foto_url,
      cargo_actual, nivel_riesgo, indice_integridad,
      partido_actual:partidos(nombre, siglas, color_hex)
    `)
    .eq('publicado', true)
    .order('nombre_completo')

  // Filtros
  if (searchParams.q) {
    query = query.ilike('nombre_completo', `%${searchParams.q}%`)
  }
  if (searchParams.riesgo) {
    query = query.eq('nivel_riesgo', searchParams.riesgo)
  }

  const { data: politicos, error } = await query

  // Partidos para filtro
  const { data: partidos } = await supabase
    .from('partidos')
    .select('id, nombre, siglas')
    .eq('activo', true)
    .order('nombre')

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">

      {/* Encabezado */}
      <div className="mb-10">
        <div className="font-mono text-xs tracking-[0.15em] uppercase text-[#5a6478] mb-2">
          Base de datos
        </div>
        <h1 className="font-playfair text-4xl font-black text-white">
          Directorio de Políticos
        </h1>
        <p className="text-[#8a94a8] mt-2">
          {politicos?.length ?? 0} perfiles documentados con fuentes verificables
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* FILTROS SIDEBAR */}
        <aside className="lg:w-56 flex-shrink-0">
          <form method="GET">
            <div className="space-y-6">
              {/* Búsqueda */}
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
                  Buscar
                </label>
                <input
                  name="q"
                  defaultValue={searchParams.q}
                  placeholder="Nombre..."
                  className="w-full bg-[#111318] border border-[#1e2530] text-white text-sm px-3 py-2 rounded-md outline-none focus:border-[#1B3A6B] font-mono placeholder:text-[#5a6478]"
                />
              </div>

              {/* Nivel de riesgo */}
              <div>
                <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
                  Nivel de riesgo
                </label>
                <div className="space-y-1">
                  {[
                    { val: '', label: 'Todos' },
                    { val: 'alto', label: 'Alto' },
                    { val: 'medio', label: 'Medio' },
                    { val: 'bajo', label: 'Bajo' },
                  ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="riesgo"
                        value={opt.val}
                        defaultChecked={searchParams.riesgo === opt.val || (!searchParams.riesgo && opt.val === '')}
                        className="accent-[#1B3A6B]"
                      />
                      <span className="text-sm text-[#8a94a8] group-hover:text-white transition-colors">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 text-white text-sm font-semibold py-2 rounded-md transition-colors"
              >
                Filtrar
              </button>

              {(searchParams.q || searchParams.riesgo) && (
                <a
                  href="/politicos"
                  className="block text-center text-xs text-[#5a6478] hover:text-white transition-colors font-mono"
                >
                  Limpiar filtros
                </a>
              )}
            </div>
          </form>
        </aside>

        {/* LISTA */}
        <div className="flex-1">
          {!politicos || politicos.length === 0 ? (
            <div className="text-center py-20 text-[#5a6478]">
              <div className="text-4xl mb-4">🔍</div>
              <div className="font-mono text-sm">No se encontraron resultados</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {politicos.map((p: any) => (
                <PoliticoCardCompleta key={p.id} politico={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PoliticoCardCompleta({ politico }: { politico: any }) {
  const riesgo = {
    alto: { text: 'text-red-400', border: 'border-red-800/40', bg: 'bg-red-900/10' },
    medio: { text: 'text-orange-400', border: 'border-orange-800/40', bg: 'bg-orange-900/10' },
    bajo: { text: 'text-green-400', border: 'border-green-800/40', bg: 'bg-green-900/10' },
  }[politico.nivel_riesgo as NivelRiesgo] ?? { text: 'text-gray-400', border: 'border-gray-700', bg: 'bg-gray-900/10' }

  const scoreColor = politico.indice_integridad <= 4
    ? 'text-red-400'
    : politico.indice_integridad <= 6
    ? 'text-orange-400'
    : 'text-green-400'

  return (
    <Link
      href={`/politicos/${politico.slug}`}
      className="group bg-[#111318] border border-[#1e2530] hover:border-[#252d3a] rounded-lg p-5 transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-md bg-[#1e2530] flex items-center justify-center text-[#1B3A6B] font-playfair font-bold text-xl flex-shrink-0 overflow-hidden">
          {politico.foto_url ? (
            <img src={politico.foto_url} alt="" className="w-full h-full object-cover" />
          ) : (
            politico.nombre_completo.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white group-hover:text-[#1B3A6B] transition-colors">
            {politico.nombre_completo}
          </div>
          <div className="font-mono text-xs text-[#5a6478] mt-0.5">
            {politico.cargo_actual ?? '—'}
          </div>
          {politico.partido_actual && (
            <div className="font-mono text-xs text-[#8a94a8] mt-1">
              {politico.partido_actual.siglas} · {politico.partido_actual.nombre}
            </div>
          )}
        </div>

        {/* Score e índice */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded border ${riesgo.text} ${riesgo.border} ${riesgo.bg}`}>
            {politico.nivel_riesgo}
          </span>
          <div className="text-right">
            <div className={`font-playfair text-lg font-bold ${scoreColor}`}>
              {politico.indice_integridad}
            </div>
            <div className="font-mono text-[8px] text-[#5a6478] uppercase">Índice</div>
          </div>
        </div>
      </div>
    </Link>
  )
}
