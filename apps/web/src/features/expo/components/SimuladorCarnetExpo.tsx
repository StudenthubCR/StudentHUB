import { useState } from 'react'
import { TarjetaCarnet } from '@/features/carnet/components/TarjetaCarnet'
import {
  TEMAS_CARNET,
  PERSONALIZACION_POR_DEFECTO,
  type PersonalizacionCarnet,
  type PatronFondo,
} from '@/features/carnet/carnet.estilos'
import { ESTUDIANTE_DEMO, type Estudiante } from '@/features/estudiante/estudiante.fixture'
import { IconoFlechaDerecha } from '@/components/icons'

export function SimuladorCarnetExpo() {
  const [modoAvanzado, setModoAvanzado] = useState(false)
  const [escenarioActivo, setEscenarioActivo] = useState<string>('oficial')

  const [estudiante, setEstudiante] = useState<Estudiante>({
    ...ESTUDIANTE_DEMO,
    nombre: 'Valeria Solano Méndez',
    codigo: '2026-CTP-0842',
    especialidad: 'Desarrollo Web',
    grupo: '12-1',
    nivel: 'Duodécimo Año',
  })

  const [personalizacion, setPersonalizacion] = useState<PersonalizacionCarnet>({
    ...PERSONALIZACION_POR_DEFECTO,
    temaId: 'azul-oficial',
    insigniaId: 'software',
    patron: 'puntos',
    efectoBrillo: true,
    efecto3d: true,
    lemaPersonal: 'Construyendo el futuro digital',
    tipoSangre: 'O+',
    contactoEmergenciaNombre: 'Carlos Solano (Padre)',
    contactoEmergenciaTelefono: '8888-4321',
  })

  const [volteada, setVolteada] = useState(false)

  const especialidadesOpciones = [
    { nombre: 'Desarrollo Web', insigniaId: 'software', emoji: '💻', grupo: '12-1' },
    { nombre: 'Electrónica & Telecom', insigniaId: 'electronica', emoji: '⚡', grupo: '12-2' },
    { nombre: 'Mecatrónica & Precisión', insigniaId: 'mecanica', emoji: '⚙️', grupo: '12-3' },
    { nombre: 'Contabilidad & Finanzas', insigniaId: 'contabilidad', emoji: '📊', grupo: '12-4' },
    { nombre: 'Diseño Gráfico', insigniaId: 'diseno', emoji: '🎨', grupo: '12-5' },
  ]

  const cambiarEspecialidad = (opt: (typeof especialidadesOpciones)[0]) => {
    setEstudiante((prev) => ({
      ...prev,
      especialidad: opt.nombre,
      grupo: opt.grupo,
    }))
    setPersonalizacion((prev) => ({
      ...prev,
      insigniaId: opt.insigniaId,
    }))
  }

  const patrones: { id: PatronFondo; label: string }[] = [
    { id: 'puntos', label: 'Puntos' },
    { id: 'malla', label: 'Malla' },
    { id: 'lineas', label: 'Líneas' },
    { id: 'liso', label: 'Liso' },
  ]

  const escenariosJueces = [
    {
      id: 'oficial',
      titulo: '1. Credencial Oficial Web',
      subtitulo: 'Valeria Solano · Grupo 12-1',
      icono: '💻',
      badge: 'Estándar',
      accentGlow: 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/10 shadow-md shadow-blue-500/10',
      badgeStyle: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30',
      descripcion: 'Demuestra el holograma reactivo, validez institucional y código QR dinámico.',
      ejecutar: () => {
        setEscenarioActivo('oficial')
        setEstudiante({
          ...ESTUDIANTE_DEMO,
          nombre: 'Valeria Solano Méndez',
          codigo: '2026-CTP-0842',
          especialidad: 'Desarrollo Web',
          grupo: '12-1',
          nivel: 'Duodécimo Año',
        })
        setPersonalizacion({
          ...PERSONALIZACION_POR_DEFECTO,
          temaId: 'azul-oficial',
          insigniaId: 'software',
          patron: 'puntos',
          efectoBrillo: true,
          efecto3d: true,
          lemaPersonal: 'Construyendo el futuro digital',
          tipoSangre: 'O+',
          contactoEmergenciaNombre: 'Carlos Solano (Padre)',
          contactoEmergenciaTelefono: '8888-4321',
        })
        setVolteada(false)
      },
    },
    {
      id: 'electronica',
      titulo: '2. Especialidad Electrónica',
      subtitulo: 'Bryan Castro · Grupo 12-2',
      icono: '⚡',
      badge: 'Técnico',
      accentGlow: 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/10 shadow-md shadow-emerald-500/10',
      badgeStyle: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
      descripcion: 'Demuestra la adaptación dinámica de paletas e insignias por taller técnico.',
      ejecutar: () => {
        setEscenarioActivo('electronica')
        setEstudiante({
          ...ESTUDIANTE_DEMO,
          nombre: 'Bryan Castro Vargas',
          codigo: '2026-CTP-0511',
          especialidad: 'Electrónica & Telecom',
          grupo: '12-2',
          nivel: 'Duodécimo Año',
        })
        setPersonalizacion({
          ...PERSONALIZACION_POR_DEFECTO,
          temaId: 'esmeralda',
          insigniaId: 'electronica',
          patron: 'malla',
          efectoBrillo: true,
          efecto3d: true,
          lemaPersonal: 'Conectando sistemas inteligentes',
          tipoSangre: 'A+',
          contactoEmergenciaNombre: 'Marta Vargas (Madre)',
          contactoEmergenciaTelefono: '8765-4321',
        })
        setVolteada(false)
      },
    },
    {
      id: 'emergencia',
      titulo: '3. Caso Emergencia Médica',
      subtitulo: '¡Giro Automático al Reverso!',
      icono: '🩺',
      badge: 'Giro Auto',
      accentGlow: 'border-rose-500 ring-2 ring-rose-500/30 bg-rose-500/10 shadow-md shadow-rose-500/10',
      badgeStyle: 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30',
      descripcion: 'Muestra datos críticos (Tipo de Sangre O+ y contacto de padres) para uso de docentes o paramédicos.',
      ejecutar: () => {
        setEscenarioActivo('emergencia')
        setEstudiante({
          ...ESTUDIANTE_DEMO,
          nombre: 'Valeria Solano Méndez',
          codigo: '2026-CTP-0842',
          especialidad: 'Desarrollo Web',
          grupo: '12-1',
          nivel: 'Duodécimo Año',
        })
        setPersonalizacion({
          ...PERSONALIZACION_POR_DEFECTO,
          temaId: 'rojo-rubi',
          insigniaId: 'software',
          patron: 'lineas',
          efectoBrillo: true,
          efecto3d: true,
          lemaPersonal: 'Alergia a la penicilina • Diabética Tipo 1',
          tipoSangre: 'O+',
          contactoEmergenciaNombre: 'Carlos Solano (Padre)',
          contactoEmergenciaTelefono: '8888-4321',
        })
        setVolteada(true)
      },
    },
    {
      id: 'comedor',
      titulo: '4. Paso Rápido al Comedor',
      subtitulo: 'Validación Óptica < 1s',
      icono: '🍽️',
      badge: 'Velocidad',
      accentGlow: 'border-amber-500 ring-2 ring-amber-500/30 bg-amber-500/10 shadow-md shadow-amber-500/10',
      badgeStyle: 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30',
      descripcion: 'Código QR dinámico de alta legibilidad para agilizar el comedor y portón escolar.',
      ejecutar: () => {
        setEscenarioActivo('comedor')
        setEstudiante({
          ...ESTUDIANTE_DEMO,
          nombre: 'Valeria Solano Méndez',
          codigo: '2026-CTP-0842',
          especialidad: 'Desarrollo Web',
          grupo: '12-1',
          nivel: 'Duodécimo Año',
        })
        setPersonalizacion({
          ...PERSONALIZACION_POR_DEFECTO,
          temaId: 'dorado',
          insigniaId: 'software',
          patron: 'puntos',
          efectoBrillo: true,
          efecto3d: true,
          lemaPersonal: 'Beca de Comedor 100% Activa',
          tipoSangre: 'O+',
          contactoEmergenciaNombre: 'Carlos Solano (Padre)',
          contactoEmergenciaTelefono: '8888-4321',
        })
        setVolteada(false)
      },
    },
  ]

  const iniciarModoDemo = () => {
    localStorage.setItem('studenthub_demo_sesion', 'true')
    window.location.href = '/'
  }

  return (
    <section id="simulador" className="py-16 sm:py-24 bg-surface-alt/40 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
            <span>Demostración en Vivo para Jueces</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Simulador del Carnet Digital 3D
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Probá el carnet en tiempo real tocando cualquiera de los <strong>4 Escenarios Rápidos</strong> o
            interactuando directamente con el teléfono a la izquierda.
          </p>
        </div>

        {/* Contenedor Principal: Simulador en Teléfono a la izquierda + Panel de Control a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado izquierdo: Marco de Celular con el Carnet interactivo */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            {/* Teléfono Mockup con iluminación ambiental */}
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[46px] border-[7px] border-slate-900 bg-slate-950 p-3.5 shadow-[0_25px_70px_-15px_rgba(37,99,235,0.35)] ring-1 ring-white/20">
              {/* Parlante / Notch de teléfono */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-black flex items-center justify-center z-10 shadow-inner">
                <div className="size-2 rounded-full bg-slate-800 mr-2" />
                <div className="h-1 w-10 rounded-full bg-slate-800" />
              </div>

              {/* Pantalla del Celular */}
              <div className="mt-4 pt-3.5 pb-2.5 rounded-[32px] overflow-hidden bg-bg text-text min-h-[480px] flex flex-col items-center justify-between border border-border/50">
                {/* Header simulado de app */}
                <div className="w-full px-4 flex items-center justify-between text-menuda font-semibold text-text-muted border-b border-border/40 pb-2">
                  <span className="flex items-center gap-1.5 font-bold">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                    Student HUB
                  </span>
                  <span className="text-[10px] font-mono bg-primary-tint px-2 py-0.5 rounded-full text-primary font-black border border-primary/20">
                    {volteada ? 'REVERSO SOS' : 'FRENTE QR'}
                  </span>
                </div>

                {/* El componente real del Carnet */}
                <div className="w-full my-auto py-2 flex items-center justify-center">
                  <TarjetaCarnet
                    estudiante={estudiante}
                    personalizacion={personalizacion}
                    volteada={volteada}
                    onToggleVoltear={() => setVolteada(!volteada)}
                  />
                </div>

                {/* Botón grande para girar */}
                <div className="w-full px-3 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setVolteada(!volteada)}
                    className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white text-nota font-black shadow-md shadow-primary/30 hover:opacity-95 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    <span>🔄 {volteada ? 'Ver Frente Oficial (Credencial)' : 'Girar a Reverso Médico (SOS)'}</span>
                  </button>
                </div>
              </div>

              {/* Botón Home bar inferior */}
              <div className="mt-2 flex justify-center">
                <div className="h-1 w-32 rounded-full bg-slate-700/80" />
              </div>
            </div>

            {/* Hint interactivo */}
            <div className="mt-4 flex items-center gap-2 text-menuda text-text-muted bg-surface px-3 py-1.5 rounded-full border border-border">
              <span>💡</span>
              <span><strong>Mueve el mouse</strong> sobre el carnet para ver el efecto 3D holográfico.</span>
            </div>
          </div>

          {/* Lado derecho: Panel de Control Interactivo (Modo Guiado vs Avanzado) */}
          <div className="lg:col-span-7 bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-md space-y-6">
            {/* Selector de Modo: Modo Juez (1 Clic) vs Modo Personalización */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-text">
                  Panel de Pruebas del Jurado
                </h3>
                <p className="text-nota text-text-muted mt-0.5">
                  Selecciona un caso para probar instantáneamente la reacción del carnet.
                </p>
              </div>

              <div className="inline-flex rounded-xl bg-surface-alt p-1 border border-border text-menuda font-bold shrink-0">
                <button
                  type="button"
                  onClick={() => setModoAvanzado(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !modoAvanzado
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  ⚡ Modo Juez
                </button>
                <button
                  type="button"
                  onClick={() => setModoAvanzado(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    modoAvanzado
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-text-muted hover:text-text'
                  }`}
                >
                  🎨 Manual
                </button>
              </div>
            </div>

            {/* VISTA 1: MODO JUEZ (Presets Rápidos de 1 Clic) */}
            {!modoAvanzado ? (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {escenariosJueces.map((esc) => {
                    const activo = escenarioActivo === esc.id
                    return (
                      <button
                        key={esc.id}
                        type="button"
                        onClick={esc.ejecutar}
                        className={`text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-0.5 ${
                          activo
                            ? `${esc.accentGlow}`
                            : 'border-border bg-surface-alt/70 hover:border-primary/40 hover:bg-surface-alt'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="text-xl">{esc.icono}</span>
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                              activo
                                ? `${esc.badgeStyle} shadow-2xs`
                                : 'bg-surface border border-border text-text-muted'
                            }`}
                          >
                            {esc.badge}
                          </span>
                        </div>
                        <h4 className="font-black text-nota text-text mt-1">{esc.titulo}</h4>
                        <p className="text-menuda font-medium text-text-muted mt-0.5">
                          {esc.subtitulo}
                        </p>
                        <p className="text-micro text-text-muted mt-2.5 border-t border-border/40 pt-2 leading-relaxed">
                          {esc.descripcion}
                        </p>
                      </button>
                    )
                  })}
                </div>

                {/* Explicación de impacto para el evaluador */}
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg">🎯</span>
                    <div className="text-nota">
                      <p className="font-bold">Qué evalúa el jurado en este simulador:</p>
                      <p className="text-menuda opacity-90 mt-0.5">
                        1) Eliminación de plástico en carnets. 2) Cero riesgo de extravío con sincronización offline.
                        3) Reverso con datos médicos y teléfonos de auxilio que salvan vidas en emergencias de aula o taller.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botón para saltar a la App Real */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={iniciarModoDemo}
                    className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-primary-tint border border-primary/30 text-primary hover:bg-primary-tint-strong font-bold text-nota transition-all cursor-pointer"
                  >
                    <span>⚡ ¿Querés probar la app completa en vivo? Entrar en Modo Juez</span>
                    <IconoFlechaDerecha className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* VISTA 2: PERSONALIZACIÓN MANUAL (Avanzado) */
              <div className="space-y-6 animate-fade-in">
                {/* 1. Especialidad Técnica */}
                <div>
                  <label className="block text-etiqueta font-bold text-text uppercase tracking-wider mb-2.5">
                    1. Especialidad Técnica (Insignia & Sección)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {especialidadesOpciones.map((esp) => {
                      const activa = estudiante.especialidad === esp.nombre
                      return (
                        <button
                          key={esp.nombre}
                          type="button"
                          onClick={() => cambiarEspecialidad(esp)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-nota font-medium cursor-pointer transition-all duration-150 ${
                            activa
                              ? 'bg-primary text-white shadow-sm scale-102'
                              : 'bg-surface-alt border border-border text-text hover:border-primary/40'
                          }`}
                        >
                          <span>{esp.emoji}</span>
                          <span>{esp.nombre}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 2. Paleta de Temas de Color */}
                <div>
                  <label className="block text-etiqueta font-bold text-text uppercase tracking-wider mb-2.5">
                    2. Tema de Color Institucional
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TEMAS_CARNET.map((tema) => {
                      const activo = personalizacion.temaId === tema.id
                      return (
                        <button
                          key={tema.id}
                          type="button"
                          onClick={() => setPersonalizacion((p) => ({ ...p, temaId: tema.id }))}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-left cursor-pointer transition-all ${
                            activo
                              ? 'border-primary ring-2 ring-primary/20 bg-primary-tint/30'
                              : 'border-border bg-surface-alt hover:border-text-muted/30'
                          }`}
                        >
                          <span
                            className="size-4 rounded-full shadow-xs shrink-0"
                            style={{ backgroundColor: tema.muestra }}
                          />
                          <span className="text-menuda font-medium text-text truncate">
                            {tema.nombre.split(' ')[0]}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* 3. Textura de Fondo y Efectos 3D */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-etiqueta font-bold text-text uppercase tracking-wider mb-2">
                      3. Textura de Fondo
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {patrones.map((pat) => (
                        <button
                          key={pat.id}
                          type="button"
                          onClick={() => setPersonalizacion((p) => ({ ...p, patron: pat.id }))}
                          className={`px-2.5 py-1.5 rounded-lg text-menuda font-medium capitalize cursor-pointer transition-all ${
                            personalizacion.patron === pat.id
                              ? 'bg-primary text-white'
                              : 'bg-surface-alt border border-border text-text hover:border-primary/40'
                          }`}
                        >
                          {pat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-etiqueta font-bold text-text uppercase tracking-wider mb-2">
                      4. Efectos Visuales
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-nota text-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={personalizacion.efectoBrillo}
                          onChange={(e) =>
                            setPersonalizacion((p) => ({ ...p, efectoBrillo: e.target.checked }))
                          }
                          className="size-4 accent-primary rounded cursor-pointer"
                        />
                        <span>Efecto Holográfico</span>
                      </label>

                      <label className="flex items-center gap-2 text-nota text-text cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={personalizacion.efecto3d}
                          onChange={(e) =>
                            setPersonalizacion((p) => ({ ...p, efecto3d: e.target.checked }))
                          }
                          className="size-4 accent-primary rounded cursor-pointer"
                        />
                        <span>Inclinación 3D (Tilt)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
