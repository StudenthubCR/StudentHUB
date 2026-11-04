import { describe, expect, it, vi } from 'vitest'
import { renderToString } from 'react-dom/server'

import {
  normalizar,
  resolverDiaObjetivo,
  detectarIntencion,
  responderEventos,
  responderComedor,
  responderHorarios,
  responderCarnet,
  responderAyuda,
  responderDesconocido,
  generarMensajeBienvenida,
  SUGERENCIAS_RAPIDAS,
} from './chatbot.service'
import { Chatbot } from './Chatbot'
import { useChatbot } from './useChatbot'
import type { MenuDia } from '@/features/comedor/menu.types'
import type { DiaDeClases } from '@/features/horarios/horario.types'

// Regex exhaustivo para detectar cualquier emoji Unicode o pictograma
const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu

// Mocks de hooks de contexto para renderizado de Chatbot
vi.mock('@/features/estudiante/useEstudiante', () => ({
  useEstudiante: () => ({
    estudiante: {
      id: 'est-1',
      cedula: '111111111',
      nombre: 'Valeria Solís',
      grupo: '11-1',
      especialidad: 'Informática Empresarial',
      sede: 'San Rafael',
    },
    cargando: false,
    error: null,
  }),
}))

vi.mock('@/lib/useReloj', () => ({
  useReloj: () => new Date('2026-10-14T10:00:00Z'), // Miércoles
}))

vi.mock('@/features/horarios/useHorario', () => ({
  useHorario: () => ({
    dias: [
      {
        dia: 'Miercoles',
        abreviatura: 'Mié',
        esHoy: true,
        bloques: [],
        clases: [
          {
            dia: 'Miercoles',
            hora: '07:00 - 08:20',
            inicio: '07:00',
            fin: '08:20',
            materia: 'Programación Web',
            docente: 'Prof. Vargas',
            esReceso: false,
          },
          {
            dia: 'Miercoles',
            hora: '08:40 - 10:00',
            inicio: '08:40',
            fin: '10:00',
            materia: 'Bases de Datos',
            docente: 'Prof. Soto',
            esReceso: false,
          },
        ],
      },
      {
        dia: 'Jueves',
        abreviatura: 'Jue',
        esHoy: false,
        bloques: [],
        clases: [
          {
            dia: 'Jueves',
            hora: '07:00 - 09:20',
            inicio: '07:00',
            fin: '09:20',
            materia: 'Redes y Conectividad',
            docente: 'Prof. Mora',
            esReceso: false,
          },
        ],
      },
    ],
    cargando: false,
    error: null,
  }),
}))

vi.mock('@/features/comedor/useMenuSemanal', () => ({
  useMenuSemanal: () => ({
    menus: [
      {
        fecha: '2026-10-14',
        plato: 'Arroz con pollo campesino',
        acompanamiento: 'Frijoles molidos y ensalada rusa',
        bebida: 'Refresco natural de cas',
        fruta: 'Sandía fresca',
      },
      {
        fecha: '2026-10-15',
        plato: 'Carne mechada en salsa',
        acompanamiento: 'Puré de papa y arroz blanco',
        bebida: 'Té frío natural',
        fruta: 'Banano criollo',
      },
    ],
    cargando: false,
    error: null,
  }),
}))

describe('Chatbot Service — Detección Semántica y Regla Cero Emojis', () => {
  const fechaMiercoles = new Date('2026-10-14T10:00:00Z')
  const fechaSabado = new Date('2026-10-17T10:00:00Z')

  const menusPrueba: MenuDia[] = [
    {
      fecha: '2026-10-14',
      plato: 'Casado tradicional con carne',
      acompanamiento: 'Arroz, frijoles y plátano maduro',
      bebida: 'Fresco de frutas',
      fruta: 'Piña dulce',
    },
    {
      fecha: '2026-10-15',
      plato: 'Pescado empanizado',
      acompanamiento: 'Papas salteadas y ensalada verde',
      bebida: 'Limonada con hierbabuena',
      fruta: 'Manzana',
    },
  ]

  const horariosPrueba: DiaDeClases[] = [
    {
      dia: 'Miercoles',
      abreviatura: 'Mié',
      esHoy: true,
      bloques: [],
      clases: [
        {
          dia: 'Miercoles',
          hora: '07:00 - 08:20',
          inicio: '07:00',
          fin: '08:20',
          materia: 'Sistemas Operativos',
          docente: 'Prof. Castro',
          esReceso: false,
        },
      ],
    },
    {
      dia: 'Jueves',
      abreviatura: 'Jue',
      esHoy: false,
      bloques: [],
      clases: [
        {
          dia: 'Jueves',
          hora: '08:40 - 10:00',
          inicio: '08:40',
          fin: '10:00',
          materia: 'Ciberseguridad',
          docente: 'Prof. Rojas',
          esReceso: false,
        },
      ],
    },
  ]

  it('normalizar elimina acentos, mayúsculas y espacios duplicados', () => {
    expect(normalizar('  ¿QUÉ HAY DE ALMUERZO MAÑANA?  ')).toBe('¿que hay de almuerzo manana?')
  })

  it('detectarIntencion reconoce correctamente todas las intenciones clave', () => {
    expect(detectarIntencion('hola')).toBe('saludo')
    expect(detectarIntencion('buenos dias')).toBe('saludo')
    expect(detectarIntencion('¿Qué hay de almuerzo hoy?')).toBe('comedor')
    expect(detectarIntencion('menu del viernes')).toBe('comedor')
    expect(detectarIntencion('¿Cuáles son mis clases de mañana?')).toBe('horarios')
    expect(detectarIntencion('horario del jueves')).toBe('horarios')
    expect(detectarIntencion('¿Cuándo es la feria vocacional o expotecnica?')).toBe('eventos')
    expect(detectarIntencion('¿Cómo guardo mi carnet offline?')).toBe('carnet')
    expect(detectarIntencion('ayuda con los comandos')).toBe('ayuda')
    expect(detectarIntencion('cuanto es la raiz cuadrada de 144')).toBe('desconocido')
  })

  it('resolverDiaObjetivo resuelve referencias temporales relativas y nombres de días', () => {
    expect(resolverDiaObjetivo('que hay de comer hoy', fechaMiercoles).etiqueta).toBe('hoy')
    expect(resolverDiaObjetivo('que hay manana', fechaMiercoles).etiqueta).toBe('mañana')
    expect(resolverDiaObjetivo('pasado manana que toca', fechaMiercoles).etiqueta).toBe('pasado mañana')
    expect(resolverDiaObjetivo('que hubo ayer', fechaMiercoles).etiqueta).toBe('ayer')
    expect(resolverDiaObjetivo('que hubo antier', fechaMiercoles).etiqueta).toBe('antier')
    expect(resolverDiaObjetivo('menu del viernes', fechaMiercoles).etiqueta).toBe('viernes')
  })

  it('generarMensajeBienvenida NO contiene ningún carácter emoji', () => {
    const bienvenidaConNombre = generarMensajeBienvenida('Valeria')
    const bienvenidaSinNombre = generarMensajeBienvenida()

    expect(bienvenidaConNombre).toContain('¡Hola, Valeria!')
    expect(bienvenidaConNombre.match(EMOJI_REGEX)).toBeNull()

    expect(bienvenidaSinNombre).toContain('¡Hola!')
    expect(bienvenidaSinNombre.match(EMOJI_REGEX)).toBeNull()
  })

  it('responderComedor genera texto estructurado sin emojis tanto para días lectivos como fin de semana', () => {
    // Día lectivo con menú
    const resHoy = responderComedor('¿Qué hay hoy?', menusPrueba, fechaMiercoles)
    expect(resHoy.texto).toContain('Menú del Comedor Institucional')
    expect(resHoy.texto).toContain('Casado tradicional con carne')
    expect(resHoy.texto.match(EMOJI_REGEX)).toBeNull()

    // Día siguiente
    const resManana = responderComedor('¿Qué hay mañana?', menusPrueba, fechaMiercoles)
    expect(resManana.texto).toContain('Pescado empanizado')
    expect(resManana.texto.match(EMOJI_REGEX)).toBeNull()

    // Fin de semana
    const resSabado = responderComedor('¿Qué hay hoy?', menusPrueba, fechaSabado)
    expect(resSabado.texto).toContain('cerrado')
    expect(resSabado.texto.match(EMOJI_REGEX)).toBeNull()

    // Menú no encontrado
    const resVacio = responderComedor('¿Qué hay hoy?', [], fechaMiercoles)
    expect(resVacio.texto).toContain('No hay información del menú registrada')
    expect(resVacio.texto.match(EMOJI_REGEX)).toBeNull()
  })

  it('responderHorarios genera texto estructurado sin emojis para días de clases y fin de semana', () => {
    // Día lectivo
    const resMiercoles = responderHorarios('¿Qué clases tengo hoy?', horariosPrueba, '11-1', fechaMiercoles)
    expect(resMiercoles.texto).toContain('Horario de Clases')
    expect(resMiercoles.texto).toContain('Sistemas Operativos')
    expect(resMiercoles.texto.match(EMOJI_REGEX)).toBeNull()

    // Fin de semana
    const resSabado = responderHorarios('¿Qué tengo hoy?', horariosPrueba, '11-1', fechaSabado)
    expect(resSabado.texto).toContain('fin de semana')
    expect(resSabado.texto.match(EMOJI_REGEX)).toBeNull()

    // Sin horarios cargados
    const resVacio = responderHorarios('¿Qué tengo hoy?', [], '11-1', fechaMiercoles)
    expect(resVacio.texto).toContain('No hay horarios registrados')
    expect(resVacio.texto.match(EMOJI_REGEX)).toBeNull()
  })

  it('responderEventos, responderCarnet, responderAyuda y responderDesconocido NO contienen emojis', () => {
    const resEv = responderEventos('eventos')
    expect(resEv.texto.match(EMOJI_REGEX)).toBeNull()

    const resCarnet = responderCarnet()
    expect(resCarnet.texto).toContain('Carnet Digital Estudiantil')
    expect(resCarnet.texto.match(EMOJI_REGEX)).toBeNull()

    const resAyuda = responderAyuda()
    expect(resAyuda.texto).toContain('Asistente Virtual de Student HUB')
    expect(resAyuda.texto.match(EMOJI_REGEX)).toBeNull()

    const resDesconocido = responderDesconocido()
    expect(resDesconocido.texto).toContain('No he podido identificar tu consulta')
    expect(resDesconocido.texto.match(EMOJI_REGEX)).toBeNull()
  })

  it('todas las SUGERENCIAS_RAPIDAS carecen de emojis en etiquetas y consultas', () => {
    SUGERENCIAS_RAPIDAS.forEach((sug) => {
      expect(sug.etiqueta.match(EMOJI_REGEX)).toBeNull()
      expect(sug.consulta.match(EMOJI_REGEX)).toBeNull()
    })
  })
})

describe('Chatbot Component — Verificación de Renderizado e Iconografía SVG (Gate 3)', () => {
  it('renderiza el botón flotante cerrado con accesibilidad e ícono SVG sin emojis', () => {
    const html = renderToString(<Chatbot inicialmenteAbierto={false} />)

    expect(html).toContain('aria-label="Abrir asistente virtual"')
    expect(html).toContain('title="Asistente virtual institucional de Student HUB"')
    // Debe usar SVG
    expect(html).toContain('<svg')
    // No debe contener emojis en ningún punto del DOM
    expect(html.match(EMOJI_REGEX)).toBeNull()
  })

  it('renderiza la ventana de diálogo abierta con cabecera accesible, chips SVG y cero emojis', () => {
    const html = renderToString(<Chatbot inicialmenteAbierto={true} />)

    // Accesibilidad semántica
    expect(html).toContain('role="dialog"')
    expect(html).toContain('aria-label="Asistente virtual de Student HUB"')
    expect(html).toContain('role="log"')
    expect(html).toContain('aria-live="polite"')

    // Cabecera e íconos de acción
    expect(html).toContain('Asistente Student HUB')
    expect(html).toContain('En línea • 100% Offline')
    expect(html).toContain('aria-label="Reiniciar conversación"')
    expect(html).toContain('aria-label="Cerrar chat"')

    // Chips de sugerencias rápidas
    expect(html).toContain('Almuerzo mañana')
    expect(html).toContain('Clases mañana')
    expect(html).toContain('Eventos del colegio')
    expect(html).toContain('Carnet offline')

    // Barra de entrada accesible
    expect(html).toContain('placeholder="Escribe tu consulta aquí..."')
    expect(html).toContain('aria-label="Enviar mensaje"')

    // Cero emojis en la totalidad del HTML renderizado
    expect(html.match(EMOJI_REGEX)).toBeNull()
  })
})

describe('useChatbot Hook — Control de Concurrencia, Bloqueo y Cancelación (Gate 3)', () => {
  it('inicializa con el mensaje de bienvenida determinista sin emojis', () => {
    let hookResult: ReturnType<typeof useChatbot> | null = null

    function Harness() {
      hookResult = useChatbot({
        primerNombre: 'Carlos',
        grupoActivo: '11-1',
        horariosDias: [],
        menusComedor: [],
        ahora: new Date(),
      })
      return null
    }

    renderToString(<Harness />)

    expect(hookResult).not.toBeNull()
    if (hookResult) {
      const { mensajes, escribiendo, error } = hookResult as ReturnType<typeof useChatbot>
      expect(mensajes).toHaveLength(1)
      expect(mensajes[0].id).toBe('bienvenida')
      expect(mensajes[0].texto).toContain('Carlos')
      expect(mensajes[0].texto.match(EMOJI_REGEX)).toBeNull()
      expect(escribiendo).toBe(false)
      expect(error).toBeNull()
    }
  })

  it('permite enviar un mensaje y recibir la respuesta del bot sin emojis (simulación de envío)', async () => {
    let hookResult: ReturnType<typeof useChatbot> | null = null

    function Harness() {
      hookResult = useChatbot({
        primerNombre: 'Valeria',
        grupoActivo: '11-1',
        horariosDias: [],
        menusComedor: [],
        ahora: new Date('2026-10-14T10:00:00Z'),
      })
      return null
    }

    renderToString(<Harness />)

    if (hookResult) {
      const hook = hookResult as ReturnType<typeof useChatbot>
      const exito = await hook.enviarMensaje('¿Cómo guardo mi carnet offline?')
      expect(exito).toBe(true)

      // Debe contener el mensaje del usuario y la respuesta del bot
      expect(hook.mensajes.length).toBe(3) // bienvenida + usuario + bot
      const msgUsuario = hook.mensajes[1]
      const msgBot = hook.mensajes[2]

      expect(msgUsuario.emisor).toBe('usuario')
      expect(msgUsuario.texto).toBe('¿Cómo guardo mi carnet offline?')

      expect(msgBot.emisor).toBe('bot')
      expect(msgBot.texto).toContain('Carnet Digital Estudiantil')
      expect(msgBot.texto.match(EMOJI_REGEX)).toBeNull()
      expect(hook.escribiendo).toBe(false)
      expect(hook.error).toBeNull()
    }
  })

  it('impide envíos concurrentes cuando un mensaje ya está en procesamiento (submission lock)', async () => {
    let hookResult: ReturnType<typeof useChatbot> | null = null

    function Harness() {
      hookResult = useChatbot({
        primerNombre: 'Carlos',
        grupoActivo: '11-1',
        horariosDias: [],
        menusComedor: [],
        ahora: new Date(),
      })
      return null
    }

    renderToString(<Harness />)

    if (hookResult) {
      const hook = hookResult as ReturnType<typeof useChatbot>
      // Primer envío (inicia promesa asíncrona)
      const p1 = hook.enviarMensaje('¿Qué hay de almuerzo?')
      // Segundo envío concurrente inmediato antes de que termine el primero
      const p2 = hook.enviarMensaje('¿Cuáles son mis clases?')

      const [res1, res2] = await Promise.all([p1, p2])

      // res1 debe procesarse exitosamente
      expect(res1).toBe(true)
      // res2 debe ser bloqueado por el semáforo enviandoRef
      expect(res2).toBe(false)
    }
  })

  it('soporta reintentar() para reenviar la última consulta', async () => {
    let hookResult: ReturnType<typeof useChatbot> | null = null

    function Harness() {
      hookResult = useChatbot({
        primerNombre: 'Carlos',
        grupoActivo: '11-1',
        horariosDias: [],
        menusComedor: [],
        ahora: new Date('2026-10-14T10:00:00Z'),
      })
      return null
    }

    renderToString(<Harness />)

    if (hookResult) {
      const hook = hookResult as ReturnType<typeof useChatbot>
      await hook.enviarMensaje('¿Qué eventos hay?')
      const conteoAntes = hook.mensajes.length

      // Reintentar reenvía la última consulta
      await hook.reintentar()
      expect(hook.mensajes.length).toBeGreaterThan(conteoAntes)
    }
  })

  it('limpiarConversacion restablece el historial al mensaje de bienvenida inicial', async () => {
    let hookResult: ReturnType<typeof useChatbot> | null = null

    function Harness() {
      hookResult = useChatbot({
        primerNombre: 'Elena',
        grupoActivo: '12-2',
        horariosDias: [],
        menusComedor: [],
        ahora: new Date(),
      })
      return null
    }

    renderToString(<Harness />)

    if (hookResult) {
      const hook = hookResult as ReturnType<typeof useChatbot>
      await hook.enviarMensaje('Hola asistente')
      expect(hook.mensajes.length).toBeGreaterThan(1)

      // Ejecutar limpieza
      hook.limpiarConversacion()

      expect(hook.mensajes).toHaveLength(1)
      expect(hook.mensajes[0].id).toContain('bienvenida')
      expect(hook.mensajes[0].texto).toContain('Elena')
      expect(hook.error).toBeNull()
      expect(hook.escribiendo).toBe(false)
    }
  })
})
