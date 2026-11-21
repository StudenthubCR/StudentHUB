import { describe, expect, it } from 'vitest'
import {
  calcularResumenAsistencias,
  formatearFechaAsistencia,
  obtenerAsistenciasEstudiante,
} from './asistencias.service'
import type { RegistroAsistencia } from './asistencias.types'

describe('asistencias.service - Métricas y Formateo', () => {
  const listaPrueba: RegistroAsistencia[] = [
    {
      id: '1',
      estudianteId: 'e-1',
      fecha: '2026-03-20',
      periodo: 'I Periodo',
      materia: 'Desarrollo Web',
      bloque: '1-4',
      estado: 'presente',
    },
    {
      id: '2',
      estudianteId: 'e-1',
      fecha: '2026-03-19',
      periodo: 'I Periodo',
      materia: 'Bases de Datos',
      bloque: '3-6',
      estado: 'tardia',
    },
    {
      id: '3',
      estudianteId: 'e-1',
      fecha: '2026-03-18',
      periodo: 'I Periodo',
      materia: 'Matemática',
      bloque: '1-2',
      estado: 'ausencia_justificada',
      justificacion: 'Cita médica CCSS',
    },
    {
      id: '4',
      estudianteId: 'e-1',
      fecha: '2026-03-17',
      periodo: 'I Periodo',
      materia: 'Inglés',
      bloque: '5-6',
      estado: 'ausencia_injustificada',
    },
  ]

  it('calcula porcentaje y recuentos de asistencia correctamente', () => {
    const resumen = calcularResumenAsistencias(listaPrueba)
    expect(resumen.totalSesiones).toBe(4)
    expect(resumen.presentes).toBe(1)
    expect(resumen.tardias).toBe(1)
    expect(resumen.ausenciasJustificadas).toBe(1)
    expect(resumen.ausenciasInjustificadas).toBe(1)
    // 3 válidas de 4 = 75%
    expect(resumen.porcentajeAsistencia).toBe(75)
    // Al ser < 85%, debe activar alerta temprana
    expect(resumen.alertaTemprana).toBe(true)
    expect(resumen.mensajeAlerta).toContain('Porcentaje de asistencia actual')
  })

  it('dispara alerta preventiva si se acumulan 3 o más ausencias injustificadas', () => {
    const conTresAusencias: RegistroAsistencia[] = [
      ...listaPrueba,
      {
        id: '5',
        estudianteId: 'e-1',
        fecha: '2026-03-16',
        periodo: 'I Periodo',
        materia: 'Física',
        bloque: '1-2',
        estado: 'ausencia_injustificada',
      },
      {
        id: '6',
        estudianteId: 'e-1',
        fecha: '2026-03-15',
        periodo: 'I Periodo',
        materia: 'Química',
        bloque: '3-4',
        estado: 'ausencia_injustificada',
      },
    ]

    const resumen = calcularResumenAsistencias(conTresAusencias)
    expect(resumen.ausenciasInjustificadas).toBe(3)
    expect(resumen.alertaTemprana).toBe(true)
    expect(resumen.mensajeAlerta).toContain('Registra 3 ausencias injustificadas')
  })

  it('formatea fechas en formato natural costarricense es-CR', () => {
    const texto = formatearFechaAsistencia('2026-03-20')
    expect(texto.toLowerCase()).toContain('marzo')
    expect(texto).toContain('2026')
  })

  it('retorna 100% para lista vacía de asistencias sin errores', () => {
    const resumen = calcularResumenAsistencias([])
    expect(resumen.porcentajeAsistencia).toBe(100)
    expect(resumen.totalSesiones).toBe(0)
    expect(resumen.alertaTemprana).toBe(false)
  })

  it('obtiene registros con fallback en modo demo', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('studenthub_demo_sesion', 'true')
    }
    const asistencias = await obtenerAsistenciasEstudiante('00000000-0000-0000-0000-000000000001', 'I Periodo')
    expect(asistencias.length).toBeGreaterThan(0)
    expect(asistencias.every((a) => a.periodo === 'I Periodo')).toBe(true)
  })
})
