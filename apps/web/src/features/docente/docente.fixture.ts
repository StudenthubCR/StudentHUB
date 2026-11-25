import {
  ESTUDIANTE_DEMO,
  ESTUDIANTE_DEMO_2,
  type Estudiante,
} from '@/features/estudiante/estudiante.fixture'
import type { DocenteProfile, ObservacionDocente } from './docente.types'

export const ESPECIALIDAD_DESARROLLO_WEB = 'Desarrollo Web'

export const DOCENTE_DANGELO_DEMO: DocenteProfile = {
  id: '00000000-0000-0000-0000-000000000010',
  authUserId: '00000000-0000-0000-0000-000000000010',
  correoInstitucional: 'dangelo@mep.go.cr',
  nombreCompleto: 'Prof. Dangelo',
  especialidadAsignada: ESPECIALIDAD_DESARROLLO_WEB,
  seccionesAsignadas: ['10-1', '11-1', '12-1'],
  activo: true,
}

export const MATERIAS_DESARROLLO_WEB = [
  'Programación y Desarrollo Web',
  'Bases de Datos y PostgreSQL',
  'Diseño Web y UX/UI',
  'Desarrollo de Aplicaciones Móviles',
  'Arquitectura Cliente-Servidor',
  'Proyecto Integrador Web',
] as const

export const BLOQUES_DOCENTE_DEMO = [
  'Lecciones 1-4 (7:00 AM - 10:00 AM)',
  'Lecciones 3-6 (8:30 AM - 11:30 AM)',
  'Lecciones 5-8 (10:15 AM - 1:15 PM)',
  'Lecciones 9-12 (1:30 PM - 4:30 PM)',
] as const

/**
 * Padrón maestro de demostración que incluye estudiantes de Desarrollo Web (10°, 11°, 12°)
 * y estudiantes de OTRAS especialidades para validar que el filtro por especialidad
 * excluye estrictamente a quienes no pertenecen a Desarrollo Web.
 */
export const ESTUDIANTES_MASTER_DEMO: Estudiante[] = [
  // Desarrollo Web - 10°
  {
    id: 'dw-10-1-mateo',
    nombre: 'Mateo Alvarado Rojas',
    codigo: '2026-DW-101',
    correo: 'mateo.alvarado@mep.go.cr',
    especialidad: 'Desarrollo Web',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '10-1',
    seccion: '10-1',
    nivel: 'Décimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
  {
    id: 'dw-10-1-lucia',
    nombre: 'Lucía Fernández Castro',
    codigo: '2026-DW-102',
    correo: 'lucia.fernandez@mep.go.cr',
    especialidad: 'Desarrollo Web',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '10-1',
    seccion: '10-1',
    nivel: 'Décimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
  // Desarrollo Web - 11° (incluye al estudiante demo principal Erick García Burgos)
  {
    ...ESTUDIANTE_DEMO,
    correo: 'estudiante.demo@mep.go.cr',
  },
  {
    id: 'dw-11-1-camila',
    nombre: 'Camila Quesada Herrera',
    codigo: '2026-DW-112',
    correo: 'camila.quesada@mep.go.cr',
    especialidad: 'Desarrollo Web',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '11-1',
    seccion: '11-1',
    nivel: 'Undécimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
  // Desarrollo Web - 12°
  {
    id: 'dw-12-1-valeria',
    nombre: 'Valeria Solano Méndez',
    codigo: '2026-DW-121',
    correo: 'valeria.solano@mep.go.cr',
    especialidad: 'Desarrollo Web',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '12-1',
    seccion: '12-1',
    nivel: 'Duodécimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
  {
    id: 'dw-12-1-sebastian',
    nombre: 'Sebastián Mora Jiménez',
    codigo: '2026-DW-122',
    correo: 'sebastian.mora@mep.go.cr',
    especialidad: 'Desarrollo Web',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '12-1',
    seccion: '12-1',
    nivel: 'Duodécimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },

  // OTRAS ESPECIALIDADES (deben ser excluidas estrictamente para Prof. Dangelo)
  ESTUDIANTE_DEMO_2, // Contabilidad & Finanzas (10-2)
  {
    id: 'ciber-12-2-bryan',
    nombre: 'Bryan Castro Vargas',
    codigo: '2026-CB-201',
    correo: 'bryan.castro@mep.go.cr',
    especialidad: 'Ciberseguridad',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '12-2',
    seccion: '12-2',
    nivel: 'Duodécimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
  {
    id: 'electro-11-2-andres',
    nombre: 'Andrés Porras Chacón',
    codigo: '2026-EL-202',
    correo: 'andres.porras@mep.go.cr',
    especialidad: 'Electromecánica',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '11-2',
    seccion: '11-2',
    nivel: 'Undécimo Año',
    jornada: 'Nocturna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
  {
    id: 'redes-10-3-paula',
    nombre: 'Paula Vega Fallas',
    codigo: '2026-RD-203',
    correo: 'paula.vega@mep.go.cr',
    especialidad: 'Soporte y Configuración de Redes',
    institucion: 'CTP Rosario de Naranjo',
    siglaInstitucion: 'CTP',
    grupo: '10-3',
    seccion: '10-3',
    nivel: 'Décimo Año',
    jornada: 'Diurna',
    vigencia: 'Ciclo Lectivo 2026',
    fotoUrl: '',
    activo: true,
  },
]

export const OBSERVACIONES_DOCENTE_DEMO_SEED: ObservacionDocente[] = [
  {
    id: 'obs-dw-1',
    estudianteId: '00000000-0000-0000-0000-000000000001',
    docenteId: DOCENTE_DANGELO_DEMO.id,
    docenteNombre: DOCENTE_DANGELO_DEMO.nombreCompleto,
    periodo: 'I Periodo',
    materia: 'Programación y Desarrollo Web',
    categoria: 'felicitacion',
    observacion: 'Liderazgo sobresaliente en la arquitectura de Student HUB para Expotécnica 2026.',
    visibleFamilia: true,
    creadoEl: '2026-03-19T14:30:00.000Z',
  },
  {
    id: 'obs-dw-2',
    estudianteId: 'dw-10-1-lucia',
    docenteId: DOCENTE_DANGELO_DEMO.id,
    docenteNombre: DOCENTE_DANGELO_DEMO.nombreCompleto,
    periodo: 'I Periodo',
    materia: 'Programación y Desarrollo Web',
    categoria: 'asistencia',
    observacion: 'Se registra seguimiento preventivo por 3 ausencias injustificadas y prácticas pendientes.',
    visibleFamilia: true,
    creadoEl: '2026-03-20T10:15:00.000Z',
  },
]
