// src/app/politicos/[slug]/page.tsx
import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Caso, Votacion, Promesa, Cargo, Patrimonio, Contrato } from '@/lib/database.types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const { data } = await supabase
    .from('politicos')
    .select('nombre_completo, cargo_actual, resumen')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Político no encontrado — VIGILAGT' }

  return {
    title: `${(data as any).nombre_completo} — VIGILAGT`,
    description: `${(data as any).resumen ?? 'Perfil político en VIGILAGT'}`,
  }
}

export default async function PerfilPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // Cargar perfil principal
  const { data: politico } = await supabase
    .from('politicos')
    .select('*, partido_actual:partidos(nombre, siglas, color_hex)')
    .eq('slug', slug)
    .eq('publicado', true)
    .single()

  if (!politico) notFound()

  // Cargar relaciones en paralelo con el ID real
  const [
    { data: cargosReal },
    { data: casosReal },
    { data: votacionesReal },
    { data: patrimonioReal },
    { data: promesasReal },
    { data: contratosReal },
  ] = await Promise.all([
    supabase.from('cargos').select('*, partido:partidos(nombre,siglas)').eq('politico_id', politico.id).order('fecha_inicio', { ascending: false }),
    supabase.from('casos').select('*').eq('politico_id', politico.id).eq('publicado', true).order('fecha_inicio', { ascending: false }),
    supabase.from('votaciones').select('*').eq('politico_id', politico.id).order('fecha', { ascending: false }),
    supabase.from('patrimonio').select('*').eq('politico_id', politico.id).order('año'),
    supabase.from('promesas').select('*').eq('politico_id', politico.id).order('fecha', { ascending: false }),
    supabase.from('contratos').select('*').eq('politico_id', politico.id).order('año', { ascending: false }),
  ])

  const scoreColor = (politico.indice_integridad ?? 5) <= 4
    ? '#e05252'
    : (politico.indice_integridad ?? 5) <= 6
    ? '#e07a3a'
    : '#4caf7d'

  const edad = politico.fecha_nacimiento
    ? new Date().getFullYear() - new Date(politico.fecha_nacimiento).getFullYear()
    : null

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">

      {/* Breadcrumb */}
      <div className="font-mono text-xs text-[#5a6478] mb-6">
        <Link href="/" className="hover:text-white">Inicio</Link>
        {' › '}
        <Link href="/politicos" className="hover:text-white">Directorio</Link>
        {' › '}
        <span className="text-[#8a94a8]">{politico.nombre_completo}</span>
      </div>

      {/* CABECERA DEL PERFIL */}
      <div className="bg-[#111318] border border-[#1e2530] rounded-xl p-8 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-lg bg-[#1e2530] flex items-center justify-center text-[#1B3A6B] font-playfair font-bold text-3xl flex-shrink-0 overflow-hidden border border-[#252d3a]">
            {politico.foto_url ? (
              <img src={politico.foto_url} alt="" className="w-full h-full object-cover" />
            ) : (
              politico.nombre_completo.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
            )}
          </div>

          {/* Datos principales */}
          <div className="flex-1">
            <h1 className="font-playfair text-3xl font-black text-white">
              {politico.nombre_completo}
            </h1>
            <div className="font-mono text-sm text-[#1B3A6B] mt-1">
              {politico.cargo_actual ?? 'Sin cargo actual'}
            </div>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#8a94a8]">
              {edad && <span>🎂 {edad} años</span>}
              {politico.profesion && <span>🎓 {politico.profesion}</span>}
              {(politico as any).partido_actual && (
                <span>🏛️ {(politico as any).partido_actual.siglas}</span>
              )}
              {politico.en_politica_desde && (
                <span>📅 En política desde {politico.en_politica_desde}</span>
              )}
            </div>
          </div>

          {/* Índice de integridad */}
          <div className="flex-shrink-0 text-center">
            <div className="font-playfair text-4xl font-black" style={{ color: scoreColor }}>
              {politico.indice_integridad}
            </div>
            <div className="font-mono text-[9px] text-[#5a6478] uppercase tracking-wider mt-1">
              Índice de<br />Integridad
            </div>
          </div>
        </div>

        {politico.resumen && (
          <p className="text-sm text-[#8a94a8] mt-6 border-t border-[#1e2530] pt-4 leading-relaxed">
            {politico.resumen}
          </p>
        )}
      </div>

      {/* MÉTRICAS RÁPIDAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { num: casosReal?.length ?? 0, label: 'Casos activos', color: 'text-red-400' },
          { num: votacionesReal?.filter((v: Votacion) => v.calificacion === 'cuestionable').length ?? 0, label: 'Votos cuestionables', color: 'text-orange-400' },
          { num: promesasReal?.filter((p: Promesa) => p.estado === 'incumplida').length ?? 0, label: 'Promesas incumplidas', color: 'text-red-400' },
          { num: contratosReal?.length ?? 0, label: 'Contratos vinculados', color: 'text-[#C8A84B]' },
        ].map((m, i) => (
          <div key={i} className="bg-[#111318] border border-[#1e2530] rounded-lg p-4 text-center">
            <div className={`font-playfair text-3xl font-black ${m.color}`}>{m.num}</div>
            <div className="font-mono text-[9px] text-[#5a6478] uppercase tracking-wider mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* CASOS */}
      <Section title="Casos y Denuncias" count={casosReal?.length}>
        {casosReal && casosReal.length > 0 ? (
          <div className="space-y-3">
            {casosReal.map((caso: Caso) => (
              <CasoCard key={caso.id} caso={caso} />
            ))}
          </div>
        ) : <Vacio texto="Sin casos documentados" />}
      </Section>

      {/* HISTORIAL DE CARGOS */}
      <Section title="Historial de Cargos" count={cargosReal?.length}>
        {cargosReal && cargosReal.length > 0 ? (
          <div className="relative pl-6 border-l border-[#1e2530] space-y-6">
            {cargosReal.map((cargo: any) => (
              <div key={cargo.id} className="relative">
                <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#1B3A6B] border-2 border-[#0a0c0f]" />
                <div className="font-mono text-xs text-[#5a6478] mb-1">
                  {cargo.fecha_inicio ? cargo.fecha_inicio.substring(0, 4) : '?'}
                  {' — '}
                  {cargo.es_actual ? 'Presente' : cargo.fecha_fin ? cargo.fecha_fin.substring(0, 4) : '?'}
                </div>
                <div className="font-semibold text-white">{cargo.cargo}</div>
                {cargo.institucion && (
                  <div className="text-sm text-[#8a94a8]">{cargo.institucion}</div>
                )}
                {cargo.partido && (
                  <div className="font-mono text-xs text-[#5a6478] mt-1">
                    Partido: {cargo.partido.siglas}
                  </div>
                )}
                {cargo.notas && (
                  <div className="text-sm text-[#8a94a8] mt-1 italic">{cargo.notas}</div>
                )}
              </div>
            ))}
          </div>
        ) : <Vacio texto="Sin historial de cargos documentado" />}
      </Section>

      {/* VOTACIONES */}
      <Section title="Votaciones Clave" count={votacionesReal?.length}>
        {votacionesReal && votacionesReal.length > 0 ? (
          <div className="space-y-2">
            {votacionesReal.map((v: Votacion) => (
              <VotacionRow key={v.id} votacion={v} />
            ))}
          </div>
        ) : <Vacio texto="Sin votaciones documentadas" />}
      </Section>

      {/* PATRIMONIO */}
      <Section title="Evolución Patrimonial" count={patrimonioReal?.length}>
        {patrimonioReal && patrimonioReal.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patrimonioReal.map((p: Patrimonio) => (
              <PatrimonioCard key={p.id} patrimonio={p} />
            ))}
          </div>
        ) : <Vacio texto="Sin declaraciones patrimoniales documentadas" />}
      </Section>

      {/* PROMESAS */}
      <Section title="Promesas de Campaña" count={promesasReal?.length}>
        {promesasReal && promesasReal.length > 0 ? (
          <div className="space-y-2">
            {promesasReal.map((p: Promesa) => (
              <PromesaRow key={p.id} promesa={p} />
            ))}
          </div>
        ) : <Vacio texto="Sin promesas documentadas" />}
      </Section>

      {/* CONTRATOS */}
      <Section title="Contratos y Vínculos Empresariales" count={contratosReal?.length}>
        {contratosReal && contratosReal.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1e2530]">
                  {['Empresa', 'Entidad', 'Objeto', 'Año', 'Monto', ''].map(h => (
                    <th key={h} className="font-mono text-[9px] uppercase tracking-wider text-[#5a6478] text-left py-2 px-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contratosReal.map((c: Contrato) => (
                  <tr key={c.id} className="border-b border-[#1e2530] hover:bg-[#111318]">
                    <td className="py-3 px-3 text-white font-medium">{c.empresa}</td>
                    <td className="py-3 px-3 text-[#8a94a8]">{c.entidad_estado ?? '—'}</td>
                    <td className="py-3 px-3 text-[#8a94a8]">{c.objeto_contrato ?? '—'}</td>
                    <td className="py-3 px-3 text-[#8a94a8] font-mono">{c.año ?? '—'}</td>
                    <td className="py-3 px-3 text-[#C8A84B] font-mono">
                      {c.monto ? `Q ${c.monto.toLocaleString('es-GT')}` : '—'}
                    </td>
                    <td className="py-3 px-3">
                      {c.alerta && (
                        <span className="font-mono text-[9px] text-red-400 border border-red-800/40 bg-red-900/10 px-2 py-0.5 rounded">
                          {c.alerta}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <Vacio texto="Sin contratos documentados" />}
      </Section>

      {/* REPORTAR */}
      <div className="mt-8 border border-[#1e2530] rounded-xl p-6 text-center">
        <p className="text-[#8a94a8] text-sm mb-4">
          ¿Tiene información verificable sobre {politico.nombre_corto ?? politico.nombre_completo.split(' ')[0]}?
        </p>
        <Link
          href={`/reportar?politico=${politico.id}&nombre=${encodeURIComponent(politico.nombre_completo)}`}
          className="inline-flex items-center gap-2 bg-red-900/20 border border-red-800/40 text-red-400 hover:bg-red-900/30 text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
        >
          ⚠️ Enviar reporte sobre este perfil
        </Link>
      </div>
    </div>
  )
}

// ─── Componentes de sección ───────────────────────────────
function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-mono text-xs tracking-[0.15em] uppercase text-[#5a6478]">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="font-mono text-[9px] bg-[#111318] border border-[#1e2530] text-[#8a94a8] px-2 py-0.5 rounded">
            {count}
          </span>
        )}
        <div className="flex-1 h-px bg-[#1e2530]" />
      </div>
      {children}
    </div>
  )
}

function Vacio({ texto }: { texto: string }) {
  return (
    <div className="text-center py-10 text-[#5a6478] font-mono text-xs">
      {texto}
    </div>
  )
}

function CasoCard({ caso }: { caso: Caso }) {
  const sev = {
    critico: { icon: '⚖️', color: 'border-red-800/40 bg-red-900/10', badge: 'text-red-400 border-red-800/40 bg-red-900/10' },
    grave: { icon: '💰', color: 'border-orange-800/40 bg-orange-900/10', badge: 'text-orange-400 border-orange-800/40 bg-orange-900/10' },
    leve: { icon: '📋', color: 'border-blue-800/40 bg-blue-900/10', badge: 'text-blue-400 border-blue-800/40 bg-blue-900/10' },
  }[caso.severidad] ?? { icon: '📋', color: 'border-[#1e2530]', badge: 'text-[#5a6478] border-[#1e2530]' }

  return (
    <div className={`border rounded-lg p-5 ${sev.color}`}>
      <div className="flex items-start gap-4">
        <span className="text-xl flex-shrink-0 mt-0.5">{sev.icon}</span>
        <div className="flex-1">
          <div className="font-semibold text-white mb-1">{caso.titulo}</div>
          {caso.descripcion && (
            <p className="text-sm text-[#8a94a8] leading-relaxed mb-3">{caso.descripcion}</p>
          )}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            {caso.tipo && (
              <span className={`px-2 py-0.5 rounded border ${sev.badge}`}>{caso.tipo}</span>
            )}
            {caso.estado && (
              <span className="px-2 py-0.5 rounded border border-[#252d3a] text-[#8a94a8]">{caso.estado}</span>
            )}
            {caso.institucion && (
              <span className="px-2 py-0.5 rounded border border-[#252d3a] text-[#5a6478]">
                {caso.institucion}{caso.expediente ? ` · ${caso.expediente}` : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function VotacionRow({ votacion }: { votacion: Votacion }) {
  const voto = {
    a_favor: { icon: '✅', color: 'text-green-400' },
    en_contra: { icon: '❌', color: 'text-red-400' },
    abstencion: { icon: '⬜', color: 'text-[#5a6478]' },
    ausente: { icon: '⬜', color: 'text-orange-400' },
  }[votacion.voto ?? 'ausente'] ?? { icon: '—', color: 'text-[#5a6478]' }

  const cal = {
    cuestionable: 'text-red-400 border-red-800/40 bg-red-900/10',
    conflicto_interes: 'text-red-400 border-red-800/40 bg-red-900/10',
    positivo: 'text-green-400 border-green-800/40 bg-green-900/10',
    neutro: 'text-[#5a6478] border-[#252d3a]',
  }[votacion.calificacion] ?? ''

  return (
    <div className="flex items-center gap-4 bg-[#111318] border border-[#1e2530] rounded-lg px-4 py-3">
      <span className="text-lg flex-shrink-0">{voto.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white truncate">{votacion.descripcion}</div>
        {votacion.decreto && (
          <div className="font-mono text-xs text-[#5a6478] mt-0.5">{votacion.decreto}</div>
        )}
      </div>
      {votacion.calificacion !== 'neutro' && (
        <span className={`font-mono text-[9px] px-2 py-0.5 rounded border flex-shrink-0 ${cal}`}>
          {votacion.calificacion.replace('_', ' ')}
        </span>
      )}
    </div>
  )
}

function PatrimonioCard({ patrimonio }: { patrimonio: Patrimonio }) {
  return (
    <div className={`bg-[#111318] border rounded-lg p-5 ${patrimonio.alerta ? 'border-orange-800/40' : 'border-[#1e2530]'}`}>
      <div className="font-mono text-xs text-[#5a6478] mb-2">Declaración {patrimonio.año}</div>
      {patrimonio.total_declarado && (
        <div className="font-playfair text-2xl font-bold text-white mb-3">
          Q {patrimonio.total_declarado.toLocaleString('es-GT')}
        </div>
      )}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { num: patrimonio.inmuebles, label: 'Inmuebles' },
          { num: patrimonio.vehiculos, label: 'Vehículos' },
          { num: patrimonio.empresas, label: 'Empresas' },
        ].map(item => (
          <div key={item.label}>
            <div className="font-bold text-white text-lg">{item.num}</div>
            <div className="font-mono text-[9px] text-[#5a6478] uppercase">{item.label}</div>
          </div>
        ))}
      </div>
      {patrimonio.alerta_detalle && (
        <div className="mt-3 font-mono text-xs text-orange-400 flex items-center gap-1">
          ⚠️ {patrimonio.alerta_detalle}
        </div>
      )}
    </div>
  )
}

function PromesaRow({ promesa }: { promesa: Promesa }) {
  const est = {
    cumplida: { dot: 'bg-green-500', label: 'Cumplida', color: 'text-green-400 border-green-800/40 bg-green-900/10' },
    incumplida: { dot: 'bg-red-500', label: 'Incumplida', color: 'text-red-400 border-red-800/40 bg-red-900/10' },
    parcial: { dot: 'bg-orange-500', label: 'Parcial', color: 'text-orange-400 border-orange-800/40 bg-orange-900/10' },
    pendiente: { dot: 'bg-[#5a6478]', label: 'Pendiente', color: 'text-[#5a6478] border-[#252d3a]' },
  }[promesa.estado] ?? { dot: 'bg-[#5a6478]', label: '—', color: '' }

  return (
    <div className="flex items-center gap-4 bg-[#111318] border border-[#1e2530] rounded-lg px-4 py-3">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${est.dot}`} />
      <div className="flex-1 text-sm text-white">{promesa.promesa}</div>
      <span className={`font-mono text-[9px] px-2 py-0.5 rounded border flex-shrink-0 ${est.color}`}>
        {est.label}
      </span>
    </div>
  )
}
