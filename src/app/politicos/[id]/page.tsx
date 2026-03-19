// src/app/admin/politicos/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useParams } from 'next/navigation'
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

export default function EditarPolitico() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

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

  useEffect(() => {
    async function cargar() {
      const { data, error } = await (supabase as any)
        .from('politicos')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        setError('No se encontró el político')
        setLoading(false)
        return
      }

      setForm({
        nombre_completo: data.nombre_completo ?? '',
        nombre_corto: data.nombre_corto ?? '',
        slug: data.slug ?? '',
        cargo_actual: data.cargo_actual ?? '',
        profesion: data.profesion ?? '',
        fecha_nacimiento: data.fecha_nacimiento ?? '',
        en_politica_desde: data.en_politica_desde?.toString() ?? '',
        nivel_riesgo: data.nivel_riesgo ?? 'medio',
        indice_integridad: data.indice_integridad?.toString() ?? '5',
        resumen: data.resumen ?? '',
        publicado: data.publicado ?? false,
      })
      setLoading(false)
    }
    cargar()
  }, [id])

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
    setSaving(true)
    setError('')
    setSuccess('')

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

    const { error } = await (supabase as any)
      .from('politicos')
      .update(payload)
      .eq('id', id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess('Cambios guardados correctamente')
      setTimeout(() => setSuccess(''), 3000)
    }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    const { error } = await (supabase as any)
      .from('politicos')
      .delete()
      .eq('id', id)

    if (error) {
      setError(error.message)
      setDeleting(false)
    } else {
      router.push('/admin')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0c0f] flex items-center justify-center">
        <div className="font-mono text-[#5a6478] text-sm">Cargando...</div>
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
              Editar político
            </div>
          </div>
          <Link
            href={`/politicos/${form.slug}`}
            target="_blank"
            className="font-mono text-xs text-[#1B3A6B] hover:text-white transition-colors"
          >
            Ver perfil público →
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Datos básicos */}
          <Section title="Datos básicos">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre completo *" required>
                <input name="nombre_completo" value={form.nombre_completo} onChange={handleChange} required
                  className={inputClass} />
              </Field>
              <Field label="Nombre corto">
                <input name="nombre_corto" value={form.nombre_corto} onChange={handleChange}
                  className={inputClass} placeholder="Ej: Sandra Torres" />
              </Field>
              <Field label="Slug (URL) *" required>
                <input name="slug" value={form.slug} onChange={handleChange} required
                  className={inputClass} />
                <p className="font-mono text-[9px] text-[#5a6478] mt-1">
                  vigilagt.com/politicos/{form.slug}
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
          <Section title="Evaluación">
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
              placeholder="Breve descripción de la trayectoria del político." />
          </Section>

          {/* Publicar */}
          <div className="bg-[#111318] border border-[#1e2530] rounded-xl p-5 flex items-center justify-between">
            <div>
              <div className="font-mono text-sm text-white">Publicar perfil</div>
              <div className="font-mono text-xs text-[#5a6478] mt-1">
                {form.publicado ? 'Visible en el sitio público' : 'Guardado como borrador — no visible al público'}
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

          {/* Mensajes */}
          {error && (
            <div className="font-mono text-xs text-red-400 bg-red-900/10 border border-red-800/40 rounded-lg px-4 py-3">
              Error: {error}
            </div>
          )}
          {success && (
            <div className="font-mono text-xs text-green-400 bg-green-900/10 border border-green-800/40 rounded-lg px-4 py-3">
              ✓ {success}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button type="submit" disabled={saving}
              className="flex-1 bg-[#1B3A6B] hover:bg-[#1B3A6B]/80 disabled:opacity-50 text-white font-mono text-sm font-bold py-3 rounded-lg transition-colors">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <Link href="/admin"
              className="px-6 py-3 border border-[#1e2530] text-[#5a6478] hover:text-white font-mono text-sm rounded-lg transition-colors text-center">
              Cancelar
            </Link>
          </div>
        </form>

        {/* Zona de peligro */}
        <div className="mt-10 border border-red-900/40 rounded-xl p-6">
          <h3 className="font-mono text-xs text-red-400 uppercase tracking-widest mb-3">Zona de peligro</h3>
          <p className="font-mono text-xs text-[#5a6478] mb-4">
            Eliminar este político borrará permanentemente su perfil y todos sus datos asociados. Esta acción no se puede deshacer.
          </p>
          {confirmDelete ? (
            <div className="flex gap-3">
              <button onClick={handleDelete} disabled={deleting}
                className="bg-red-900/30 border border-red-800/40 text-red-400 hover:bg-red-900/50 font-mono text-xs font-bold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {deleting ? 'Eliminando...' : '⚠️ Confirmar eliminación'}
              </button>
              <button onClick={() => setConfirmDelete(false)}
                className="border border-[#1e2530] text-[#5a6478] hover:text-white font-mono text-xs px-4 py-2.5 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={handleDelete}
              className="border border-red-900/40 text-red-400/60 hover:text-red-400 hover:border-red-800/40 font-mono text-xs px-4 py-2.5 rounded-lg transition-colors">
              Eliminar político
            </button>
          )}
        </div>
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
