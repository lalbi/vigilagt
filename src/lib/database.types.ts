// src/lib/database.types.ts
// Tipos TypeScript que reflejan el esquema de Supabase
// Actualizar si se agregan columnas a la base de datos

export type NivelRiesgo = 'alto' | 'medio' | 'bajo'
export type EstadoPolitico = 'activo' | 'inactivo' | 'fallecido'
export type SeveridadCaso = 'critico' | 'grave' | 'leve'
export type EstadoCaso = 'activo' | 'cerrado' | 'sobreseido' | 'condenado' | 'absuelto' | 'en_investigacion'
export type TipoCaso = 'corrupcion' | 'peculado' | 'enriquecimiento' | 'nepotismo' | 'abuso' | 'otro'
export type Voto = 'a_favor' | 'en_contra' | 'abstencion' | 'ausente'
export type CalificacionVoto = 'positivo' | 'cuestionable' | 'conflicto_interes' | 'neutro'
export type EstadoPromesa = 'cumplida' | 'incumplida' | 'parcial' | 'pendiente'
export type EstadoReporte = 'pendiente' | 'aprobado' | 'rechazado'
export type TipoReporte = 'corrupcion' | 'patrimonio' | 'votacion' | 'promesa' | 'vinculo' | 'otro'
export type TipoVinculo = 'familiar' | 'empresarial' | 'partido' | 'caso' | 'otro'

export interface Partido {
  id: string
  nombre: string
  siglas: string | null
  color_hex: string | null
  activo: boolean
  fundado: number | null
  descripcion: string | null
  created_at: string
}

export interface Politico {
  id: string
  slug: string
  nombre_completo: string
  nombre_corto: string | null
  foto_url: string | null
  fecha_nacimiento: string | null
  lugar_nacimiento: string | null
  profesion: string | null
  colegiado: string | null
  nivel_riesgo: NivelRiesgo
  indice_integridad: number
  en_politica_desde: number | null
  partido_actual_id: string | null
  cargo_actual: string | null
  estado: EstadoPolitico
  resumen: string | null
  fuentes: string[] | null
  publicado: boolean
  created_at: string
  updated_at: string
  // Joins opcionales
  partido_actual?: Partido
}

export interface Cargo {
  id: string
  politico_id: string
  cargo: string
  institucion: string | null
  partido_id: string | null
  fecha_inicio: string | null
  fecha_fin: string | null
  es_actual: boolean
  notas: string | null
  created_at: string
  partido?: Partido
}

export interface Caso {
  id: string
  politico_id: string
  titulo: string
  descripcion: string | null
  tipo: TipoCaso | null
  severidad: SeveridadCaso
  estado: EstadoCaso
  institucion: string | null
  expediente: string | null
  fecha_inicio: string | null
  fecha_resolucion: string | null
  fuente_url: string | null
  fuente_nombre: string | null
  publicado: boolean
  created_at: string
  updated_at: string
}

export interface Votacion {
  id: string
  politico_id: string
  decreto: string | null
  descripcion: string
  fecha: string | null
  voto: Voto | null
  calificacion: CalificacionVoto
  notas: string | null
  fuente_url: string | null
  created_at: string
}

export interface Patrimonio {
  id: string
  politico_id: string
  año: number
  total_declarado: number | null
  inmuebles: number
  vehiculos: number
  empresas: number
  notas: string | null
  alerta: boolean
  alerta_detalle: string | null
  fuente_url: string | null
  created_at: string
}

export interface Promesa {
  id: string
  politico_id: string
  promesa: string
  contexto: string | null
  estado: EstadoPromesa
  fecha: string | null
  notas: string | null
  fuente_url: string | null
  created_at: string
}

export interface Contrato {
  id: string
  politico_id: string
  empresa: string
  tipo_vinculo: string | null
  entidad_estado: string | null
  objeto_contrato: string | null
  monto: number | null
  año: number | null
  alerta: string | null
  fuente_url: string | null
  created_at: string
}

export interface Vinculo {
  id: string
  politico_id: string
  nombre_vinculo: string
  tipo: TipoVinculo | null
  descripcion: string | null
  es_riesgo: boolean
  created_at: string
}

export interface ReporteCiudadano {
  id: string
  politico_id: string | null
  nombre_politico: string | null
  tipo: TipoReporte | null
  descripcion: string
  fuente_url: string | null
  fuente_nombre: string | null
  reportado_por: string | null
  estado: EstadoReporte
  notas_moderacion: string | null
  ip_hash: string | null
  created_at: string
}

// Tipo completo de perfil con todos los datos relacionados
export interface PerfilCompleto extends Politico {
  partido_actual: Partido | null
  cargos: Cargo[]
  casos: Caso[]
  votaciones: Votacion[]
  patrimonio: Patrimonio[]
  promesas: Promesa[]
  contratos: Contrato[]
  vinculos: Vinculo[]
}

// Tipo para el listado del directorio (datos mínimos)
export interface PoliticoResumen {
  id: string
  slug: string
  nombre_completo: string
  foto_url: string | null
  cargo_actual: string | null
  nivel_riesgo: NivelRiesgo
  indice_integridad: number
  partido_actual: Pick<Partido, 'nombre' | 'siglas' | 'color_hex'> | null
  casos_count?: number
}

export interface Database {
  public: {
    Tables: {
      politicos: { Row: Politico; Insert: Partial<Politico>; Update: Partial<Politico> }
      partidos: { Row: Partido; Insert: Partial<Partido>; Update: Partial<Partido> }
      cargos: { Row: Cargo; Insert: Partial<Cargo>; Update: Partial<Cargo> }
      casos: { Row: Caso; Insert: Partial<Caso>; Update: Partial<Caso> }
      votaciones: { Row: Votacion; Insert: Partial<Votacion>; Update: Partial<Votacion> }
      patrimonio: { Row: Patrimonio; Insert: Partial<Patrimonio>; Update: Partial<Patrimonio> }
      promesas: { Row: Promesa; Insert: Partial<Promesa>; Update: Partial<Promesa> }
      contratos: { Row: Contrato; Insert: Partial<Contrato>; Update: Partial<Contrato> }
      vinculos: { Row: Vinculo; Insert: Partial<Vinculo>; Update: Partial<Vinculo> }
      reportes_ciudadanos: { Row: ReporteCiudadano; Insert: Partial<ReporteCiudadano>; Update: Partial<ReporteCiudadano> }
    }
  }
}
