// src/app/reportar/page.tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function ReportarPage() {
  const [form, setForm] = useState({
    nombre_politico: '',
    tipo: '',
    descripcion: '',
    fuente_url: '',
    fuente_nombre: '',
    reportado_por: '',
  })
  const [estado, setEstado] = useState<'idle' | 'enviando' | 'ok' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.descripcion || !form.tipo) return
    setEstado('enviando')

    const { error } = await (supabase as any)
      .from('reportes_ciudadanos')
      .insert([{
        nombre_politico: form.nombre_politico || null,
        tipo: form.tipo as any,
        descripcion: form.descripcion,
        fuente_url: form.fuente_url || null,
        fuente_nombre: form.fuente_nombre || null,
        reportado_por: form.reportado_por || null,
        estado: 'pendiente',
      }])

    setEstado(error ? 'error' : 'ok')
  }

  if (estado === 'ok') {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <div className="text-5xl mb-6">✅</div>
        <h2 className="font-playfair text-3xl font-black text-white mb-4">
          Reporte recibido
        </h2>
        <p className="text-[#8a94a8] mb-8">
          Su reporte fue enviado y será revisado por el equipo de moderación antes de publicarse. Gracias por contribuir a la transparencia de Guatemala.
        </p>
        <a
          href="/politicos"
          className="inline-block bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 text-white font-semibold px-8 py-3 rounded-md transition-colors"
        >
          Ver directorio
        </a>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-10">
        <div className="font-mono text-xs tracking-[0.15em] uppercase text-[#5a6478] mb-2">
          Participación ciudadana
        </div>
        <h1 className="font-playfair text-4xl font-black text-white mb-3">
          Enviar reporte
        </h1>
        <p className="text-[#8a94a8]">
          Todo reporte pasa por moderación antes de publicarse. Solo publicamos información con fuente pública verificable.
        </p>
      </div>

      <div className="bg-[#111318] border border-[#1e2530] rounded-xl p-8">
        <div className="space-y-6">

          {/* Nombre del político */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
              Político involucrado *
            </label>
            <input
              value={form.nombre_politico}
              onChange={e => setForm(f => ({ ...f, nombre_politico: e.target.value }))}
              placeholder="Nombre completo del político"
              className="w-full bg-[#0a0c0f] border border-[#1e2530] focus:border-[#1B3A6B] text-white text-sm px-4 py-3 rounded-md outline-none transition-colors placeholder:text-[#5a6478]"
            />
          </div>

          {/* Tipo de reporte */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
              Tipo de reporte *
            </label>
            <select
              value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
              className="w-full bg-[#0a0c0f] border border-[#1e2530] focus:border-[#1B3A6B] text-white text-sm px-4 py-3 rounded-md outline-none transition-colors"
            >
              <option value="">Seleccionar tipo...</option>
              <option value="corrupcion">Corrupción</option>
              <option value="patrimonio">Patrimonio / Enriquecimiento</option>
              <option value="votacion">Votación cuestionable</option>
              <option value="promesa">Promesa incumplida</option>
              <option value="vinculo">Vínculo empresarial o familiar</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
              Descripción detallada *
            </label>
            <textarea
              value={form.descripcion}
              onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Describa los hechos con la mayor precisión posible. ¿Qué ocurrió? ¿Cuándo? ¿Dónde está documentado?"
              rows={5}
              className="w-full bg-[#0a0c0f] border border-[#1e2530] focus:border-[#1B3A6B] text-white text-sm px-4 py-3 rounded-md outline-none transition-colors placeholder:text-[#5a6478] resize-none"
            />
          </div>

          {/* Fuente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
                URL de la fuente
              </label>
              <input
                value={form.fuente_url}
                onChange={e => setForm(f => ({ ...f, fuente_url: e.target.value }))}
                placeholder="https://..."
                type="url"
                className="w-full bg-[#0a0c0f] border border-[#1e2530] focus:border-[#1B3A6B] text-white text-sm px-4 py-3 rounded-md outline-none transition-colors placeholder:text-[#5a6478]"
              />
            </div>
            <div>
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
                Nombre de la fuente
              </label>
              <input
                value={form.fuente_nombre}
                onChange={e => setForm(f => ({ ...f, fuente_nombre: e.target.value }))}
                placeholder="Ej: Expediente MP 011-2022"
                className="w-full bg-[#0a0c0f] border border-[#1e2530] focus:border-[#1B3A6B] text-white text-sm px-4 py-3 rounded-md outline-none transition-colors placeholder:text-[#5a6478]"
              />
            </div>
          </div>

          {/* Email opcional */}
          <div>
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5a6478] block mb-2">
              Su correo (opcional — para seguimiento)
            </label>
            <input
              value={form.reportado_por}
              onChange={e => setForm(f => ({ ...f, reportado_por: e.target.value }))}
              placeholder="correo@ejemplo.com"
              type="email"
              className="w-full bg-[#0a0c0f] border border-[#1e2530] focus:border-[#1B3A6B] text-white text-sm px-4 py-3 rounded-md outline-none transition-colors placeholder:text-[#5a6478]"
            />
            <p className="font-mono text-[9px] text-[#5a6478] mt-1.5">
              No publicamos su correo. Solo se usa para confirmar si su reporte fue aceptado.
            </p>
          </div>

          {/* Aviso */}
          <div className="bg-[#0a0c0f] border border-[#252d3a] rounded-lg p-4 text-xs text-[#5a6478] font-mono">
            ⚠️ Al enviar este reporte confirma que la información proporcionada es verídica y cuenta con respaldo en fuentes públicas. Los reportes sin fuente verificable no serán publicados.
          </div>

          {/* Botón */}
          <button
            onClick={handleSubmit}
            disabled={estado === 'enviando' || !form.descripcion || !form.tipo}
            className="w-full bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-md transition-colors"
          >
            {estado === 'enviando' ? 'Enviando...' : 'Enviar reporte'}
          </button>

          {estado === 'error' && (
            <p className="text-center text-sm text-red-400 font-mono">
              Hubo un error al enviar. Intente nuevamente.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
