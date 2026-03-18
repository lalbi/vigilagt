// src/app/admin/politicos/nuevo/page.tsx
'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

export default function NuevoPolitico() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    nombre_completo: '',
    nombre_corto: '',
    slug: '',
    cargo_actual: '',
    profesion: '',
    fecha_nacimiento: '',
    en_politica_desde: '',
    nivel_riesgo: 'medio',
    indice_integridad: '5',
    resumen: '',
    publicado: false,
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    if (name === 'nombre_completo') {
      setForm(f => ({ ...f, nombre_completo: value, slug: slugify(value) }))
    } else {
      setForm(f => ({ ...f, [name]: val }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const payload: any = {
      nombre_completo: form.nombre_completo,
      nombre_corto: form.nombre_corto || null,
      slug: form.slug,
      cargo_actual: form.cargo_actual || null,
      profesion: form.profesion || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      en_politica_desde: form.en_politica_desde ? parseInt(form.en_politica_desde) : null,
      nivel_riesgo: form.nivel_riesgo,
      indice_integridad: parseFloat(form.indice_integridad),
      resumen: form.resumen || null,
      publicado: form.publicado,
    }

    const { error } = await (supabase as any).from('politicos').insert([payload])

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/admin'), 1500)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <div className="font-mono text-white text-lg">Político guardado</div>
          <div className="font-mono text-[#5a6478] text-sm mt-2">Redirigiendo al panel...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0c0f]">
      {/* Header */}
      <div className="border-b border-[#1e2530] bg-[#111318]">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-mono text-xs text-[#5a6478] hover:text-white transition-colors">
              ← Panel admin
            </Link>
            <div className="font-mono text-xs text-[#5a6478] border-l border-[#1e2530] pl-4">
              Nuevo político
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Datos básicos */}
          <Section title="Datos básicos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre completo *" required>
                <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required
                  className={inputClass} placeholder="Ej: Sandra Julieta Torres Casanova" />
              </Field>
              <Field label="Nombre corto">
                <input name="nombre_corto" value={form.nombre_corto} onChange={handleChange}
                  className={inputClass} placeholder="Ej: Sandra Torres" />
              </Field>
              <Field label="Slug (URL) *" required>
                <input name="slug" value={form.slug} onChange={handleChange} required
                  className={inputClass} placeholder="sandra-torres-casanova" />
                <p className="font-mono text-[9px] text-[#5a6478] mt-1">
                  vigilagt.com/politicos/{form.slug || '...'}
                </p>
              </Field>
              <Field label="Cargo actual">
                <input name="cargo_actual" value={form.cargo_actual} onChange={handleChange}
                  className={inputClass} placeholder="Ej: Diputada · Congreso Nacional" />
              </Field>
              <Field label="Profesión declarada">
                <input name="profesion" value={form.profesion} onChange={handleChange}
                  className={inputClass} placeholder="Ej: Comunicadora" />
              </Field>
              <Field label="Fecha de nacimiento">
                <input name="fecha_nacimiento" type="date" value={form.fecha_nacimiento} onChange={handleChange}
                  className={inputClass} />
              </Field>
              <Field label="En política desde (año)">
                <input name="en_politica_desde" type="number" value={form.en_politica_desde} onChange={handleChange}
                  className={inputClass} placeholder="Ej: 2003" min="1900" max="2030" />
              </Field>
            </div>
          </Section>

          {/* Evaluación */}
          <Section title="Evaluación inicial">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nivel de riesgo">
                <select name="nivel_riesgo" value={form.nivel_riesgo} onChange={handleChange} className={inputClass}>
                  <option value="bajo">Bajo</option>
                  <option value="medio">Medio</option>
                  <option value="alto">Alto</option>
                  <option value="critico">Crítico</option>
                </select>
              </Field>
              <Field label="Índice de integridad (0–10)">
                <input name="indice_integridad" type="number" value={form.indice_integridad} onChange={handleChange}
                  className={inputClass} min="0" max="10" step="0.1" />
              </Field>
            </div>
          </Section>

          {/* Resumen */}
          <Section title="Resumen biográfico">
            <textarea name="resumen" value={form.resumen} onChange={handleChange} rows={4}
              className={`${inputClass} resize-none`}
              placeholder="Breve descripción de la trayectoria del político. Solo información verificable con fuente pública." />
          </Section>

          {/* Publicar */}
          <div className="bg-[#111318] border border-[#1e2530] rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-sm text-white">Publicar perfil</div>
              <div className="font-mono text-xs text-[#5a6478] mt-1">
                Si está desactivado se guarda como borrador y no es visible en el sitio
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="publicado" checked={form.publicado}
                onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-[#1e2530] peer-checked:bg-[#1B3A6B] rounded-full transition-colors
                after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:w-5 after:h-5
                after:bg-white after:rounded-full after:transition-all peer-checked:after:translate-x-5" />
            </label>
          </div>

          {error && (
            <div className="font-mono text-xs text-red-400 bg-red-900/10 border border-red-800/40 rounded-lg px-4 py-3">
              Error: {error}
            </div>
          )}

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="flex-1 bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 disabled:opacity-50 text-white font-mono text-sm font-bold py-3 rounded-lg transition-colors">
              {loading ? 'Guardando...' : 'Guardar político'}
            </button>
            <Link href="/admin"
              className="px-6 py-3 border border-[#1e2530] text-[#5a6478] hover:text-white font-mono text-sm rounded-lg transition-colors text-center">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputClass = "w-full bg-[#0a0c0f] border border-[#1e2530] rounded-lg px-4 py-3 text-white text-sm font-mono focus:outline-none focus:border-[#1B3A6B] transition-colors"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111318] border border-[#1e2530] rounded-xl p-6">
      <h2 className="font-mono text-xs text-[#5a6478] uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-xs text-[#5a6478] uppercase tracking-wider block mb-2">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
