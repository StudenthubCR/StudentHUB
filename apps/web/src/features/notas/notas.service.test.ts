import { describe, expect, it } from 'vitest'
import { calcularResumenNotas, obtenerNotasEstudiante } from './notas.service'
import { obtenerEstadoCalificacion, type NotaMateria } from './notas.types'

describe('notas.service - Lógica Académica MEP', () => {
  const notasPrueba: NotaMateria[] = [
    {
      id: '1',
      estudianteId: 'e-1',
      periodo: 'I Periodo',
      materia: 'Desarrollo Web',
      notaFinal: 95.0,
      rubrica: { trabajoCotidiano: 38, tareas: 10, pruebas: 32, proyecto: 10, asistencia: 5 },
      aprobada: true,
    },
    {
      id: '2',
      estudianteId: 'e-1',
      periodo: 'I Periodo',
      materia: 'Matemática',
      notaFinal: 68.0,
      rubrica: { trabajoCotidiano: 30, tareas: 8, pruebas: 20, proyecto: 7, asistencia: 3 },
      aprobada: false,
    },
    {
      id: '3',
      estudianteId: 'e-1',
      periodo: 'I Periodo',
      materia: 'Bases de Datos',
      notaFinal: 85.0,
      rubrica: { trabajoCotidiano: 35, tareas: 9, pruebas: 28, proyecto: 8, asistencia: 5 },
      aprobada: true,
    },
  ]

  it('calcula el promedio general ponderado correctamente con 1 decimal', () => {
    const resumen = calcularResumenNotas(notasPrueba)
    // (95 + 68 + 85) / 3 = 248 / 3 = 82.666... -> 82.7
    expect(resumen.promedioGeneral).toBe(82.7)
    expect(resumen.totalMaterias).toBe(3)
    expect(resumen.materiasAprobadas).toBe(2)
    expect(resumen.materiasEnRiesgo).toBe(1)
    expect(resumen.progresoPeriodo).toBe(100)
  })

  it('clasifica estados de calificación según el umbral MEP de 70', () => {
    expect(obtenerEstadoCalificacion(90).estado).toBe('aprobada')
    expect(obtenerEstadoCalificacion(70).estado).toBe('aprobada')
    expect(obtenerEstadoCalificacion(69.9).estado).toBe('riesgo')
    expect(obtenerEstadoCalificacion(60).estado).toBe('riesgo')
    expect(obtenerEstadoCalificacion(59.9).estado).toBe('reprobada')
  })

  it('maneja listas vacías de notas sin dividir por cero', () => {
    const resumen = calcularResumenNotas([])
    expect(resumen.promedioGeneral).toBe(0)
    expect(resumen.materiasAprobadas).toBe(0)
    expect(resumen.materiasEnRiesgo).toBe(0)
    expect(resumen.totalMaterias).toBe(0)
  })

  it('obtiene notas con fallback a fixtures enriquecidos en modo demo', async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('studenthub_demo_sesion', 'true')
    }
    const notas = await obtenerNotasEstudiante('00000000-0000-0000-0000-000000000001', 'I Periodo')
    expect(notas.length).toBeGreaterThan(0)
    expect(notas.every((n) => n.periodo === 'I Periodo')).toBe(true)
  })
})
