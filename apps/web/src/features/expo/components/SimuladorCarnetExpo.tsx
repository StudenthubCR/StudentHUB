import { useState } from 'react'
import { TarjetaCarnet } from '@/features/carnet/components/TarjetaCarnet'
import {
  TEMAS_CARNET,
  PERSONALIZACION_POR_DEFECTO,
  type PersonalizacionCarnet,
  type PatronFondo,
} from '@/features/carnet/carnet.estilos'
import { ESTUDIANTE_DEMO, type Estudiante } from '@/features/estudiante/estudiante.fixture'

export function SimuladorCarnetExpo() {
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

  return (
    <section id="simulador" className="py-16 sm:py-24 bg-surface-alt/40 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
            <span>Demostración en Vivo</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Simulador del Carnet Digital 3D
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Los estudiantes pueden personalizar su credencial oficial manteniendo la validez institucional.
            <strong> Interactúa con los controles abajo para probar los temas, la física 3D y el reverso médico.</strong>
          </p>
        </div>

        {/* Contenedor Principal: Simulador en Teléfono a la izquierda + Panel de Control a la derecha */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Lado izquierdo: Marco de Celular con el Carnet interactivo */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center">
            {/* Teléfono Mockup */}
            <div className="relative w-full max-w-[340px] sm:max-w-[360px] rounded-[44px] border-[8px] border-slate-900 bg-slate-950 p-4 shadow-2xl shadow-primary/20 ring-1 ring-white/20">
              {/* Parlante / Notch de teléfono */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 h-4 w-28 rounded-full bg-black flex items-center justify-center">
                <div className="size-2 rounded-full bg-slate-800 mr-2" />
                <div className="h-1 w-10 rounded-full bg-slate-800" />
              </div>

              {/* Pantalla del Celular */}
              <div className="mt-4 pt-4 pb-2 rounded-[32px] overflow-hidden bg-bg text-text min-h-[440px] flex flex-col items-center justify-between">
                {/* Header simulado de app */}
                <div className="w-full px-4 flex items-center justify-between text-menuda font-semibold text-text-muted border-b border-border/40 pb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    Student HUB
                  </span>
                  <span className="text-micro font-mono">EN VIVO</span>
                </div>

                {/* El componente real del Carnet */}
                <div className="w-full my-auto py-2">
                  <TarjetaCarnet
                    estudiante={estudiante}
                    personalizacion={personalizacion}
                    volteada={volteada}
                    onToggleVoltear={() => setVolteada(!volteada)}
                  />
                </div>

                {/* Pie con instrucción */}
                <div className="w-full text-center px-4 pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={() => setVolteada(!volteada)}
                    className="w-full py-1.5 px-3 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-micro font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {volteada ? '🔄 Ver Frente Oficial' : '🔄 Tocar para Voltear (Reverso Médico)'}
                  </button>
                </div>
              </div>

              {/* Botón Home bar inferior */}
              <div className="mt-2 flex justify-center">
                <div className="h-1 w-32 rounded-full bg-slate-700" />
              </div>
            </div>

            {/* Hint interactivo */}
            <p className="mt-4 text-center text-menuda text-text-muted flex items-center gap-1.5">
              <span>💡</span>
              <span>En computadoras, mueve el cursor sobre el carnet para ver el reflejo holográfico.</span>
            </p>
          </div>

          {/* Lado derecho: Panel de Control Interactivo */}
          <div className="lg:col-span-6 bg-surface rounded-3xl p-6 sm:p-8 border border-border shadow-md space-y-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-text">
                Personalización en Tiempo Real
              </h3>
              <p className="text-nota text-text-muted mt-1">
                Comprueba cómo reacciona el componente oficial ante cada cambio de configuración.
              </p>
            </div>

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

            {/* Botón para alternar reverso */}
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setVolteada(!volteada)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary/30 bg-primary-tint hover:bg-primary-tint-strong text-primary text-nota font-bold transition-all cursor-pointer"
              >
                <span>🔄 {volteada ? 'Ver Cara Frontal Oficial' : 'Girar y Ver Reverso Médico (Tipo Sangre & Emergencias)'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
