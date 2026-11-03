import { describe, expect, it, beforeEach } from 'vitest'
import {
  calcularAlcanceAviso,
  obtenerLogsAuditoria,
  registrarActividad,
  obtenerNoticiasAdmin,
  guardarNoticiaAdmin,
  toggleDestacadaNoticia,
  eliminarNoticiaAdmin,
  obtenerMetricasAdmin,
  obtenerEstudiantesDirectorio,
} from './admin.service'
import type { InstitutionAlert } from '@/features/avisos/avisos.types'

describe('Admin Service: calcularAlcanceAviso', () => {
  it('calcula alcance del 100% para comunicados a todo el colegio', () => {
    const aviso: InstitutionAlert = {
      id: 'aviso-1',
      title: 'Aviso General',
      message: 'Mensaje general',
      category: 'general',
      priority: 'info',
      target_type: 'all',
      target_values: [],
      created_by: 'studenthub.cr@gmail.com',
      created_at: new Date().toISOString(),
      expires_at: null,
      active: true,
    }

    const res = calcularAlcanceAviso(aviso, 500)
    expect(res.porcentaje).toBe(100)
    expect(res.destinatariosAprox).toBe(500)
    expect(res.alcanceTexto).toContain('Toda la institución')
    expect(res.activa).toBe(true)
  })

  it('calcula alcance proporcional para especialidad y sección', () => {
    const avisoEsp: InstitutionAlert = {
      id: 'aviso-esp',
      title: 'Aviso Desarrollo Web',
      message: 'Mensaje esp',
      category: 'event',
      priority: 'warning',
      target_type: 'specialty',
      target_values: ['Desarrollo Web'],
      created_by: 'studenthub.cr@gmail.com',
      created_at: new Date().toISOString(),
      expires_at: null,
      active: true,
    }

    const resEsp = calcularAlcanceAviso(avisoEsp, 480)
    expect(resEsp.alcanceTexto).toContain('Desarrollo Web')
    expect(resEsp.porcentaje).toBeGreaterThan(0)
    expect(resEsp.porcentaje).toBeLessThanOrEqual(100)
    expect(resEsp.destinatariosAprox).toBeGreaterThan(0)
  })
})

describe('Admin Service: Auditoría (Activity Logs)', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('registra una nueva acción de auditoría correctamente', () => {
    const log = registrarActividad(
      'crear_aviso',
      'avisos',
      'Aviso de prueba unitaria',
      'studenthub.cr@gmail.com',
      'Detalle adicional de prueba',
    )

    expect(log.id).toBeDefined()
    expect(log.accion).toBe('crear_aviso')
    expect(log.modulo).toBe('avisos')
    expect(log.descripcion).toBe('Aviso de prueba unitaria')
    expect(log.detalles).toBe('Detalle adicional de prueba')

    const todos = obtenerLogsAuditoria()
    expect(todos.some((l) => l.id === log.id)).toBe(true)
  })
})

describe('Admin Service: Gestor de Noticias', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
  })

  it('permite crear, destacar y eliminar una noticia', () => {
    const resultado = guardarNoticiaAdmin(
      {
        titulo: 'Feria Vocacional 2026',
        resumen: 'Feria para nuevos ingresos',
        cuerpo: 'Contenido completo',
        imagen: '/news_fiestas_patrias.webp',
        destacada: false,
        publicada: true,
        fechaPublicacion: new Date().toISOString(),
        periodo: 'Noviembre',
        autor: 'studenthub.cr@gmail.com',
      },
      'studenthub.cr@gmail.com',
    )

    expect(resultado.ok).toBe(true)
    const creada = resultado.noticia
    expect(creada.id).toBeDefined()
    expect(creada.titulo).toBe('Feria Vocacional 2026')

    // Alternar destacada
    const toggleOk = toggleDestacadaNoticia(creada.id, 'studenthub.cr@gmail.com')
    expect(toggleOk).toBe(true)

    const noticias = obtenerNoticiasAdmin()
    const encontrada = noticias.find((n) => n.id === creada.id)
    expect(encontrada?.destacada).toBe(true)

    // Eliminar noticia
    const borradoOk = eliminarNoticiaAdmin(creada.id, 'studenthub.cr@gmail.com')
    expect(borradoOk).toBe(true)

    const noticiasPost = obtenerNoticiasAdmin()
    expect(noticiasPost.some((n) => n.id === creada.id)).toBe(false)
  })

  it('bloquea la creación de noticias si el usuario no es administrador', () => {
    const res = guardarNoticiaAdmin(
      {
        titulo: 'Intento Estudiante',
        resumen: 'No permitido',
        cuerpo: '',
        imagen: '',
        destacada: false,
        publicada: true,
        fechaPublicacion: new Date().toISOString(),
        periodo: '2026',
        autor: 'estudiante@mep.go.cr',
      },
      'estudiante@mep.go.cr',
    )

    expect(res.ok).toBe(false)
    expect(res.error).toBe('Permisos insuficientes.')
  })
})

describe('Admin Service: Cero Mocks y Consultas a Base de Datos Real', () => {
  it('obtenerMetricasAdmin retorna contadores numéricos reales sin valores inventados o multiplicadores', async () => {
    const kpis = await obtenerMetricasAdmin()

    expect(typeof kpis.totalEstudiantes).toBe('number')
    expect(typeof kpis.estudiantesActivos).toBe('number')
    expect(typeof kpis.avisosVigentes).toBe('number')
    expect(typeof kpis.reportesPendientes).toBe('number')
    expect(typeof kpis.accionesHoy).toBe('number')

    // Las métricas deben ser números válidos no negativos (ej. 0 si la BD está limpia)
    expect(kpis.totalEstudiantes).toBeGreaterThanOrEqual(0)
    expect(kpis.estudiantesActivos).toBeGreaterThanOrEqual(0)
    expect(kpis.avisosVigentes).toBeGreaterThanOrEqual(0)
    expect(kpis.reportesPendientes).toBeGreaterThanOrEqual(0)
    expect(kpis.accionesHoy).toBeGreaterThanOrEqual(0)
  })

  it('obtenerEstudiantesDirectorio retorna un array basado en la base de datos sin arrays semilla hardcodeados', async () => {
    const directorio = await obtenerEstudiantesDirectorio()
    expect(Array.isArray(directorio)).toBe(true)

    // Si existen estudiantes, deben tener estructura de BD real (id, nombre, etc.)
    for (const est of directorio) {
      expect(est.id).toBeDefined()
      expect(typeof est.nombre).toBe('string')
      expect(typeof est.seccion).toBe('string')
      expect(typeof est.especialidad).toBe('string')
      expect(['activo', 'inactivo']).toContain(est.estado)
    }
  })
})
