import type { CategoriaAviso, PrioridadAviso } from '@/features/avisos/avisos.types'

export type AdminKpis = {
  totalEstudiantes: number
  estudiantesActivos: number
  avisosVigentes: number
  avisosTotales: number
  reportesPendientes: number
  accionesHoy: number
}

export type AlcanceAvisoStat = {
  id: string
  titulo: string
  categoria: CategoriaAviso
  prioridad: PrioridadAviso
  alcanceTexto: string
  porcentaje: number
  destinatariosAprox: number
  fecha: string
  activa: boolean
}

export type TipoAccionAuditoria =
  | 'crear_aviso'
  | 'editar_aviso'
  | 'desactivar_aviso'
  | 'eliminar_aviso'
  | 'duplicar_aviso'
  | 'crear_noticia'
  | 'editar_noticia'
  | 'eliminar_noticia'
  | 'reasignar_estudiante'
  | 'cambiar_estado_estudiante'
  | 'alerta_urgente'
  | 'inicio_sesion_admin'

export type ModuloAuditoria = 'avisos' | 'noticias' | 'estudiantes' | 'sistema'

export type ActivityLogItem = {
  id: string
  accion: TipoAccionAuditoria
  modulo: ModuloAuditoria
  descripcion: string
  detalles?: string
  autor: string
  timestamp: string
}

export type EstudianteDirectorio = {
  id: string
  codigo: string
  cedula: string
  nombre: string
  correo: string
  especialidad: string
  seccion: string
  estado: 'activo' | 'inactivo'
  fechaIngreso?: string
}

export type NoticiaAdmin = {
  id: string
  titulo: string
  resumen: string
  cuerpo: string
  imagen: string
  destacada: boolean
  publicada: boolean
  fechaPublicacion: string
  periodo: string
  autor: string
}

export type AdminTab = 'dashboard' | 'avisos' | 'noticias' | 'estudiantes' | 'auditoria'
