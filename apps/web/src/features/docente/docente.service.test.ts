import { beforeEach, describe, expect, it } from 'vitest'
import {
  ESTUDIANTE_DEMO,
  ESTUDIANTE_DEMO_2,
} from '@/features/estudiante/estudiante.fixture'
import {
  calcularNotaFinalMep,
  extraerPuntajes0a100DesdeRubrica,
} from '@/features/notas/notas.types'
import { obtenerNotasEstudiante } from '@/features/notas/notas.service'
import { obtenerAsistenciasEstudiante } from '@/features/asistencias/asistencias.service'
import type { EstadoAsistencia } from '@/features/asistencias/asistencias.types'
import { obtenerEventosParaEstudiante } from '@/features/agenda/agenda.service'
import {
  DOCENTE_DANGELO_DEMO,
  ESTUDIANTES_MASTER_DEMO,
  MATERIAS_DESARROLLO_WEB,
  OBSERVACIONES_DOCENTE_DEMO_SEED,
} from './docente.fixture'
import {
  construirMetricasEstudiantesDocente,
  crearObservacionDocente,
  esEstudianteDeEspecialidadDocente,
  filtrarEstudiantesPorDocente,
  guardarAsistenciaDocente,
  guardarItemAgendaDocente,
  guardarNotaDocente,
  marcarTodosPresentes,
} from './docente.service'

const memoryStore = new Map<string, string>()
const mockLocalStorage = {
  getItem: (key: string) => memoryStore.get(key) ?? null,
  setItem: (key: string, val: string) => memoryStore.set(key, val),
  removeItem: (key: string) => memoryStore.delete(key),
  clear: () => memoryStore.clear(),
}
// @ts-expect-error Mocking browser storage in Node
globalThis.localStorage = mockLocalStorage
// @ts-expect-error Mocking window in Node
globalThis.window = { dispatchEvent: () => true }

const EMOJI_REGEX =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/u

describe('docente.service - Alcance estricto Desarrollo Web y sincronización', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockLocalStorage.setItem('studenthub_demo_sesion', 'true')
    mockLocalStorage.setItem('studenthub_demo_rol', 'docente')
  })

  it('filtra estrictamente solo estudiantes de Desarrollo Web para Prof. Dangelo y excluye otras especialidades', () => {
    const autorizados = filtrarEstudiantesPorDocente(
      ESTUDIANTES_MASTER_DEMO,
      DOCENTE_DANGELO_DEMO,
    )

    expect(autorizados.length).toBeGreaterThanOrEqual(6)
    expect(autorizados.every((e) => e.especialidad === 'Desarrollo Web')).toBe(true)

    const secciones = new Set(autorizados.map((e) => e.grupo))
    expect(secciones.has('10-1')).toBe(true)
    expect(secciones.has('11-1')).toBe(true)
    expect(secciones.has('12-1')).toBe(true)

    // Excluye explícitamente Contabilidad, Ciberseguridad, Electromecánica y Redes
    expect(autorizados.some((e) => e.id === ESTUDIANTE_DEMO_2.id)).toBe(false)
    expect(autorizados.some((e) => e.especialidad === 'Ciberseguridad')).toBe(false)
    expect(autorizados.some((e) => e.especialidad === 'Electromecánica')).toBe(false)
    expect(autorizados.some((e) => e.especialidad === 'Soporte y Configuración de Redes')).toBe(false)
  })

  it('deniega acceso si el docente está inactivo o si el estudiante es de otra especialidad', () => {
    expect(esEstudianteDeEspecialidadDocente(ESTUDIANTE_DEMO, DOCENTE_DANGELO_DEMO)).toBe(true)
    expect(esEstudianteDeEspecialidadDocente(ESTUDIANTE_DEMO_2, DOCENTE_DANGELO_DEMO)).toBe(false)
    expect(
      filtrarEstudiantesPorDocente(ESTUDIANTES_MASTER_DEMO, {
        ...DOCENTE_DANGELO_DEMO,
        activo: false,
      }),
    ).toEqual([])
  })

  it('calcula correctamente la rúbrica MEP 0-100 y determina aprobación >= 70', () => {
    const aprobado = calcularNotaFinalMep({
      trabajoCotidiano: 95,
      tareas: 100,
      pruebas: 91.4,
      proyecto: 100,
      asistencia: 90,
    })
    expect(aprobado.notaFinal).toBe(94.5)
    expect(aprobado.aprobada).toBe(true)
    expect(aprobado.rubricaPonderada).toEqual({
      trabajoCotidiano: 38,
      tareas: 10,
      pruebas: 32,
      proyecto: 10,
      asistencia: 4.5,
    })

    const enRiesgo = calcularNotaFinalMep({
      trabajoCotidiano: 65,
      tareas: 60,
      pruebas: 65,
      proyecto: 70,
      asistencia: 80,
    })
    expect(enRiesgo.notaFinal).toBe(65.8)
    expect(enRiesgo.aprobada).toBe(false)

    const reconvertido = extraerPuntajes0a100DesdeRubrica(aprobado.rubricaPonderada)
    expect(reconvertido.trabajoCotidiano).toBe(95)
    expect(reconvertido.tareas).toBe(100)
  })

  it('bloquea mutaciones de notas, asistencias y observaciones para estudiantes fuera de Desarrollo Web', async () => {
    const resNota = await guardarNotaDocente(DOCENTE_DANGELO_DEMO, ESTUDIANTE_DEMO_2, {
      estudianteId: ESTUDIANTE_DEMO_2.id || '',
      periodo: 'I Periodo',
      materia: 'Contabilidad General',
      notaFinal: 90,
      rubrica: { trabajoCotidiano: 36, tareas: 9, pruebas: 30, proyecto: 10, asistencia: 5 },
    })
    expect(resNota.ok).toBe(false)
    expect(resNota.error).toContain('Acceso denegado')

    const resAsist = await guardarAsistenciaDocente(
      DOCENTE_DANGELO_DEMO,
      [ESTUDIANTE_DEMO_2],
      [
        {
          estudianteId: ESTUDIANTE_DEMO_2.id || '',
          fecha: '2026-04-10',
          periodo: 'I Periodo',
          materia: 'Contabilidad General',
          bloque: 'Lecciones 1-4 (7:00 AM - 10:00 AM)',
          estado: 'presente',
        },
      ],
    )
    expect(resAsist.ok).toBe(false)

    const resObs = await crearObservacionDocente(DOCENTE_DANGELO_DEMO, ESTUDIANTE_DEMO_2, {
      periodo: 'I Periodo',
      categoria: 'academica',
      observacion: 'Intento no autorizado',
    })
    expect(resObs.ok).toBe(false)
  })

  it('sincroniza notas y asistencias editadas por Prof. Dangelo directamente con la vista del estudiante', async () => {
    const calculo = calcularNotaFinalMep({
      trabajoCotidiano: 98,
      tareas: 100,
      pruebas: 96,
      proyecto: 100,
      asistencia: 100,
    })

    const resNota = await guardarNotaDocente(DOCENTE_DANGELO_DEMO, ESTUDIANTE_DEMO, {
      id: 'nota-11-1-prog-web-p1',
      estudianteId: ESTUDIANTE_DEMO.id || '',
      periodo: 'I Periodo',
      materia: 'Programación y Desarrollo Web',
      notaFinal: calculo.notaFinal,
      rubrica: calculo.rubricaPonderada,
      observaciones: 'Actualizado por Prof. Dangelo para Expotécnica 2026.',
    })
    expect(resNota.ok).toBe(true)

    const notasErick = await obtenerNotasEstudiante(ESTUDIANTE_DEMO.id || '', 'I Periodo')
    const progWeb = notasErick.find((n) => n.materia === 'Programación y Desarrollo Web')
    expect(progWeb?.notaFinal).toBe(97.8)
    expect(progWeb?.observaciones).toContain('Prof. Dangelo')

    const resAsist = await guardarAsistenciaDocente(
      DOCENTE_DANGELO_DEMO,
      [ESTUDIANTE_DEMO],
      [
        {
          estudianteId: ESTUDIANTE_DEMO.id || '',
          fecha: '2026-04-15',
          periodo: 'I Periodo',
          materia: 'Programación y Desarrollo Web',
          bloque: 'Lecciones 1-4 (7:00 AM - 10:00 AM)',
          estado: 'tardia',
          justificacion: 'Ingreso posterior a acto cívico.',
        },
      ],
    )
    expect(resAsist.ok).toBe(true)

    const asistErick = await obtenerAsistenciasEstudiante(ESTUDIANTE_DEMO.id || '', 'I Periodo')
    const registroNuevo = asistErick.find((a) => a.fecha === '2026-04-15')
    expect(registroNuevo?.estado).toBe('tardia')
    expect(registroNuevo?.justificacion).toContain('acto cívico')
  })

  it('aplica marcarTodosPresentes y detecta estudiantes en alerta en métricas grupales', () => {
    const entrada: Array<{ estudianteId: string; estado: EstadoAsistencia }> = [
      { estudianteId: 'a', estado: 'ausencia_injustificada' },
      { estudianteId: 'b', estado: 'tardia' },
    ]
    const lista = marcarTodosPresentes(entrada)
    expect(lista.every((i) => i.estado === 'presente')).toBe(true)

    const autorizados = filtrarEstudiantesPorDocente(
      ESTUDIANTES_MASTER_DEMO,
      DOCENTE_DANGELO_DEMO,
    )
    const { resumen, listado } = construirMetricasEstudiantesDocente(autorizados, [], [])
    expect(resumen.totalEstudiantes).toBe(autorizados.length)
    expect(listado.every((i) => i.estudiante.especialidad === 'Desarrollo Web')).toBe(true)
  })

  it('publica actividades en Agenda Docente visibles para Desarrollo Web y ocultas para otras especialidades', async () => {
    const res = await guardarItemAgendaDocente(DOCENTE_DANGELO_DEMO, {
      tipo: 'tarea',
      titulo: 'Laboratorio de Seguridad RLS',
      materia: 'Bases de Datos y PostgreSQL',
      fecha: '2026-04-20',
      hora: '14:00',
      prioridad: 'alta',
      seccionObjetivo: '11-1',
      descripcion: 'Entregar script SQL validado.',
    })
    expect(res.ok).toBe(true)

    const eventosErick = obtenerEventosParaEstudiante(ESTUDIANTE_DEMO)
    expect(eventosErick.some((e) => e.titulo === 'Laboratorio de Seguridad RLS')).toBe(true)

    const eventosSofia = obtenerEventosParaEstudiante(ESTUDIANTE_DEMO_2)
    expect(eventosSofia.some((e) => e.titulo === 'Laboratorio de Seguridad RLS')).toBe(false)
  })

  it('no contiene emojis Unicode en fixtures ni textos institucionales y usa CTP Rosario de Naranjo', () => {
    const texto = JSON.stringify({
      DOCENTE_DANGELO_DEMO,
      ESTUDIANTES_MASTER_DEMO,
      MATERIAS_DESARROLLO_WEB,
      OBSERVACIONES_DOCENTE_DEMO_SEED,
    })
    expect(texto).not.toMatch(EMOJI_REGEX)
    expect(texto).toContain('CTP Rosario de Naranjo')
  })
})
