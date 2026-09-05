import { useState } from 'react'
import { cn } from '@/lib/cn'
import {
  TEMAS_CARNET,
  PATRONES,
  INSIGNIAS_ESPECIALIDAD,
  LEMAS_SUGERIDOS,
  TIPOS_SANGRE,
  type PersonalizacionCarnet,
  type PatronFondo,
  type TipoSangre,
} from '../carnet.estilos'

type Props = {
  personalizacion: PersonalizacionCarnet
  onCambiarTema: (temaId: string) => void
  onCambiarPatron: (patron: PatronFondo) => void
  onToggleBrillo: () => void
  onToggleEfecto3d: () => void
  onCambiarInsignia: (insigniaId: string) => void
  onCambiarLema: (lema: string) => void
  onCambiarTipoSangre: (tipoSangre: TipoSangre) => void
  onCambiarContactoEmergencia: (nombre: string, telefono: string) => void
  onRestablecer: () => void
}

export function SelectorPersonalizacionCarnet({
  personalizacion,
  onCambiarTema,
  onCambiarPatron,
  onToggleBrillo,
  onToggleEfecto3d,
  onCambiarInsignia,
  onCambiarLema,
  onCambiarTipoSangre,
  onCambiarContactoEmergencia,
  onRestablecer,
}: Props) {
  const [seccionActiva, setSeccionActiva] = useState<'visual' | 'identidad' | 'reverso'>('visual')

  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Sub-navegación entre categorías de personalización */}
      <div className="flex rounded-lg border border-border bg-surface-alt/70 p-1">
        <button
          type="button"
          onClick={() => setSeccionActiva('visual')}
          className={cn(
            'flex-1 cursor-pointer rounded-md py-1.5 text-menuda font-semibold transition-all',
            seccionActiva === 'visual'
              ? 'bg-surface text-primary shadow-xs font-bold'
              : 'text-text-muted hover:text-text',
          )}
        >
          🎨 Color y 3D
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('identidad')}
          className={cn(
            'flex-1 cursor-pointer rounded-md py-1.5 text-menuda font-semibold transition-all',
            seccionActiva === 'identidad'
              ? 'bg-surface text-primary shadow-xs font-bold'
              : 'text-text-muted hover:text-text',
          )}
        >
          ⭐ Insignia y Lema
        </button>
        <button
          type="button"
          onClick={() => setSeccionActiva('reverso')}
          className={cn(
            'flex-1 cursor-pointer rounded-md py-1.5 text-menuda font-semibold transition-all',
            seccionActiva === 'reverso'
              ? 'bg-surface text-primary shadow-xs font-bold'
              : 'text-text-muted hover:text-text',
          )}
        >
          📇 Reverso y Salud
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECCIÓN 1: ESTILOS VISUALES Y 3D                         */}
      {/* ======================================================== */}
      {seccionActiva === 'visual' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Paleta de Color */}
          <div>
            <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
              Paleta y Degradado
            </label>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
              {TEMAS_CARNET.map((tema) => {
                const esActivo = personalizacion.temaId === tema.id
                return (
                  <button
                    key={tema.id}
                    type="button"
                    onClick={() => onCambiarTema(tema.id)}
                    title={tema.nombre}
                    aria-label={`Color ${tema.nombre}`}
                    className={cn(
                      'group relative flex aspect-square size-10 cursor-pointer items-center justify-center rounded-full transition-all duration-200',
                      esActivo
                        ? 'scale-110 ring-3 ring-primary ring-offset-2 ring-offset-surface'
                        : 'hover:scale-105 opacity-85 hover:opacity-100',
                    )}
                    style={{ background: tema.muestra }}
                  >
                    {esActivo && <span className="size-2 rounded-full bg-white shadow-sm" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Textura de Fondo */}
          <div>
            <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
              Textura de Fondo
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PATRONES.map((p) => {
                const esActivo = personalizacion.patron === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onCambiarPatron(p.id)}
                    className={cn(
                      'cursor-pointer rounded-xl border px-3 py-2 text-menuda font-semibold transition-all duration-200',
                      esActivo
                        ? 'border-primary bg-primary-solid text-white shadow-sm'
                        : 'border-border bg-surface-alt/70 text-text hover:border-primary/40 hover:bg-surface-alt',
                    )}
                  >
                    {p.nombre}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Interruptor: Efecto 3D Tilt Interactivo (Idea 3) */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/40 p-3">
            <div>
              <span className="block text-menor font-semibold text-text">Inclinación 3D y Reflejo</span>
              <span className="block text-micro text-text-muted">
                Efecto de tarjeta plástica que rota con el cursor y produce brillo
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={personalizacion.efecto3d}
              onClick={onToggleEfecto3d}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                personalizacion.efecto3d ? 'bg-primary-solid' : 'bg-border-strong',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  personalizacion.efecto3d ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>

          {/* Interruptor: Resplandor holográfico en Avatar */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-alt/40 p-3">
            <div>
              <span className="block text-menor font-semibold text-text">Aura Holográfica</span>
              <span className="block text-micro text-text-muted">
                Añade un anillo luminoso iridiscente en el avatar
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={personalizacion.efectoBrillo}
              onClick={onToggleBrillo}
              className={cn(
                'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out',
                personalizacion.efectoBrillo ? 'bg-primary-solid' : 'bg-border-strong',
              )}
            >
              <span
                className={cn(
                  'pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out',
                  personalizacion.efectoBrillo ? 'translate-x-5' : 'translate-x-0',
                )}
              />
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN 2: INSIGNIA TÉCNICA Y LEMA PERSONAL              */}
      {/* ======================================================== */}
      {seccionActiva === 'identidad' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Selector de Insignias Técnicas (Idea 1) */}
          <div>
            <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
              Insignia de Especialidad
            </label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INSIGNIAS_ESPECIALIDAD.map((insignia) => {
                const esActiva = personalizacion.insigniaId === insignia.id
                return (
                  <button
                    key={insignia.id}
                    type="button"
                    onClick={() => onCambiarInsignia(insignia.id)}
                    title={insignia.descripcion}
                    className={cn(
                      'flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border p-2.5 text-center transition-all duration-200',
                      esActiva
                        ? 'border-primary bg-primary-tint text-primary ring-2 ring-primary/40 font-bold'
                        : 'border-border bg-surface-alt/50 text-text hover:border-primary/40 hover:bg-surface-alt',
                    )}
                  >
                    <span className="text-xl">{insignia.icono}</span>
                    <span className="text-etiqueta font-medium leading-tight line-clamp-1">
                      {insignia.nombre}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lema o Frase Personal (Idea 2) */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label
                htmlFor="input-lema-personal"
                className="block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase"
              >
                Frase o Lema Personal
              </label>
              <span className="text-micro text-text-muted">
                {personalizacion.lemaPersonal.length}/70
              </span>
            </div>
            <input
              id="input-lema-personal"
              type="text"
              maxLength={70}
              value={personalizacion.lemaPersonal}
              onChange={(e) => onCambiarLema(e.target.value)}
              placeholder="Escribe tu lema o frase inspiradora..."
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-menor text-text shadow-xs transition-colors focus:border-primary focus:outline-hidden"
            />

            {/* Sugerencias Rápidas de Lema */}
            <div className="mt-2.5">
              <span className="mb-1.5 block text-micro font-medium text-text-muted">
                Sugerencias con 1 clic:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {LEMAS_SUGERIDOS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => onCambiarLema(sug)}
                    className="cursor-pointer rounded-lg border border-border/80 bg-surface-alt/60 px-2 py-1 text-micro text-text-muted transition-colors hover:border-primary/50 hover:bg-primary-tint hover:text-primary"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* SECCIÓN 3: DATOS DEL REVERSO (SALUD Y CONTACTO)         */}
      {/* ======================================================== */}
      {seccionActiva === 'reverso' && (
        <div className="flex flex-col gap-4 animate-fade-in">
          {/* Tipo de Sangre */}
          <div>
            <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
              🩸 Tipo de Sangre (Reverso Oficial)
            </label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {TIPOS_SANGRE.map((sangre) => {
                const esActivo = personalizacion.tipoSangre === sangre
                return (
                  <button
                    key={sangre}
                    type="button"
                    onClick={() => onCambiarTipoSangre(sangre)}
                    className={cn(
                      'cursor-pointer rounded-xl border py-2 text-center text-menor font-bold transition-all duration-200',
                      esActivo
                        ? 'border-red-500 bg-red-500 text-white shadow-xs'
                        : 'border-border bg-surface-alt/50 text-text hover:border-red-400 hover:bg-red-500/10',
                    )}
                  >
                    {sangre}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Contacto de Emergencia */}
          <div className="rounded-xl border border-border bg-surface-alt/40 p-3.5">
            <label className="mb-2 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
              📞 Contacto Familiar de Emergencia
            </label>
            <div className="space-y-2.5">
              <div>
                <span className="mb-1 block text-micro text-text-muted">Nombre o Parentesco:</span>
                <input
                  type="text"
                  maxLength={50}
                  value={personalizacion.contactoEmergenciaNombre}
                  onChange={(e) =>
                    onCambiarContactoEmergencia(
                      e.target.value,
                      personalizacion.contactoEmergenciaTelefono,
                    )
                  }
                  placeholder="Ej: Mamá (María Morales)"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-menor text-text transition-colors focus:border-primary focus:outline-hidden"
                />
              </div>
              <div>
                <span className="mb-1 block text-micro text-text-muted">Teléfono de contacto:</span>
                <input
                  type="tel"
                  maxLength={25}
                  value={personalizacion.contactoEmergenciaTelefono}
                  onChange={(e) =>
                    onCambiarContactoEmergencia(
                      personalizacion.contactoEmergenciaNombre,
                      e.target.value,
                    )
                  }
                  placeholder="Ej: 8888-8888"
                  className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-menor text-text transition-colors focus:border-primary focus:outline-hidden"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de restablecer al diseño oficial */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onRestablecer}
          className="cursor-pointer text-menuda font-medium text-text-muted transition-colors hover:text-primary underline underline-offset-4"
        >
          Restablecer a valores iniciales
        </button>
      </div>
    </div>
  )
}

