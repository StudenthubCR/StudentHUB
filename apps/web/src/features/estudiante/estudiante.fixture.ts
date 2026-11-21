/**
 * DATOS DE DEMOSTRACIÓN — Cumplen la Ley N° 8968 de protección de datos personales.
 *
 * Datos ficticios para evaluación de jueces en Expotécnica 2026.
 */

export type RolUsuario = 'estudiante' | 'encargado'

export type Estudiante = {
  id?: string
  user_id?: string
  correo?: string
  cedula?: string
  nombre: string
  /** Código interno del colegio, nunca la cédula (plan §10). */
  codigo: string
  especialidad: string
  institucion: string
  siglaInstitucion: string
  grupo: string
  seccion?: string
  nivel: string
  jornada: string
  vigencia: string
  fotoUrl: string
  activo: boolean
  genero?: string
  rol?: string
  esRespaldo?: boolean
  parentesco?: string
}

export type Encargado = {
  id: string
  user_id?: string
  correo: string
  nombreCompleto: string
  cedula?: string
  telefono?: string
  parentesco?: string
  activo: boolean
}

export const ESTUDIANTE_DEMO: Estudiante = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Erick García Burgos',
  codigo: '208520530',
  especialidad: 'Desarrollo Web',
  institucion: 'Colegio Técnico Profesional',
  siglaInstitucion: 'CTP',
  grupo: '11-1',
  seccion: '11-1',
  nivel: 'Undécimo Año',
  jornada: 'Diurna',
  vigencia: 'Ciclo Lectivo 2026',
  fotoUrl: '',
  activo: true,
  parentesco: 'Hijo',
}

export const ESTUDIANTE_DEMO_2: Estudiante = {
  id: '00000000-0000-0000-0000-000000000003',
  nombre: 'Sofía García Burgos',
  codigo: '208520531',
  especialidad: 'Contabilidad & Finanzas',
  institucion: 'Colegio Técnico Profesional',
  siglaInstitucion: 'CTP',
  grupo: '10-2',
  seccion: '10-2',
  nivel: 'Décimo Año',
  jornada: 'Diurna',
  vigencia: 'Ciclo Lectivo 2026',
  fotoUrl: '',
  activo: true,
  parentesco: 'Hija',
}

export const ENCARGADO_DEMO: Encargado = {
  id: '00000000-0000-0000-0000-000000000002',
  correo: 'encargado.demo@gmail.com',
  nombreCompleto: 'María Elena Burgos Soto',
  cedula: '1-0845-0921',
  telefono: '8844-1290',
  parentesco: 'Madre de Familia',
  activo: true,
}
