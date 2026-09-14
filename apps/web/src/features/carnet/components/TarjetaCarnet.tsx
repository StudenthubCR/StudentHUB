import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { obtenerIniciales } from '@/lib/texto'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import {
  buscarTema,
  resolverInsignia,
  PERSONALIZACION_POR_DEFECTO,
  type PersonalizacionCarnet,
} from '../carnet.estilos'

type Props = {
  estudiante: Estudiante
  personalizacion?: PersonalizacionCarnet
  volteada?: boolean
  onToggleVoltear?: () => void
}

/**
 * Tarjeta de Credencial Digital del Estudiante con:
 * 1. Insignias de especialidad técnica (Idea 1).
 * 2. Lema personal del estudiante (Idea 2).
 * 3. Inclinación 3D (Tilt) y reflejo holográfico dinámico (Idea 3).
 * 4. Reverso oficial interactivo con datos de emergencia, tipo de sangre y código de barras (Idea 4).
 */
export function TarjetaCarnet({
  estudiante,
  personalizacion = PERSONALIZACION_POR_DEFECTO,
  volteada: volteadaExterna,
  onToggleVoltear: onToggleExterna,
}: Props) {
  const [volteadaInterna, setVolteadaInterna] = useState(false)
  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, xPct: 50, yPct: 50, activo: false })
  const estaVolteada = volteadaExterna !== undefined ? volteadaExterna : volteadaInterna
  const alternarVoltear = () => {
    if (onToggleExterna) {
      onToggleExterna()
    } else {
      setVolteadaInterna((prev) => !prev)
    }
  }

  const manejarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!personalizacion.efecto3d) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const xPct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    const yPct = Math.max(0, Math.min(100, (y / rect.height) * 100))

    // Rotación suave de +-10 grados
    const rotY = ((x / rect.width) - 0.5) * 20
    const rotX = -((y / rect.height) - 0.5) * 20

    setTilt({ rotX, rotY, xPct, yPct, activo: true })
  }

  const manejarMouseLeave = () => {
    setTilt({ rotX: 0, rotY: 0, xPct: 50, yPct: 50, activo: false })
  }

  const tema = buscarTema(personalizacion.temaId)
  const insignia = resolverInsignia(personalizacion.insigniaId, estudiante.especialidad)
  const valorQR = `Nombre: ${estudiante.nombre}\nSección: ${estudiante.grupo}`

  const tieneFotoReal = Boolean(
    estudiante.fotoUrl && !estudiante.fotoUrl.includes('placeholder'),
  )

  // Reflejo holográfico dinámico que sigue el cursor en 3D
  const renderizarReflejo = () => {
    if (!personalizacion.efecto3d || !tilt.activo) return null
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-30 opacity-40 mix-blend-color-dodge transition-opacity duration-150"
        style={{
          background: `radial-gradient(circle at ${tilt.xPct}% ${tilt.yPct}%, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.15) 30%, transparent 60%)`,
        }}
      />
    )
  }

  // Capa común de textura o patrón de fondo
  const renderizarPatron = () => {
    if (personalizacion.patron === 'puntos') {
      return (
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)',
            backgroundSize: '14px 14px',
          }}
        />
      )
    }
    if (personalizacion.patron === 'malla') {
      return (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.35) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      )
    }
    if (personalizacion.patron === 'lineas') {
      return (
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6) 1px, transparent 1px, transparent 8px)',
          }}
        />
      )
    }
    return null
  }

  return (
    <div
      onMouseMove={manejarMouseMove}
      onMouseLeave={manejarMouseLeave}
      className="relative w-full max-w-[350px] select-none"
      style={{ perspective: '1200px' }}
    >
      {/* Botón flotante para voltear la tarjeta en dispositivos móviles o escritorio */}
      <button
        type="button"
        onClick={alternarVoltear}
        data-print="ocultar"
        className="group absolute -top-3.5 right-3 z-30 flex cursor-pointer items-center gap-1.5 rounded-full border border-white/30 bg-black/60 px-3 py-1 text-etiqueta font-bold text-white backdrop-blur-md shadow-md transition-all duration-200 hover:scale-105 hover:bg-black/80 active:scale-95"
        title="Girar carnet (ver anverso o reverso)"
        aria-label="Girar carnet digital"
      >
        <span className="text-xs transition-transform duration-300 group-hover:rotate-180">🔄</span>
        <span>{estaVolteada ? 'Ver Frente' : 'Ver Reverso'}</span>
      </button>

      {/* Contenedor con rotación 3D Flip estable + Tilt dinámico */}
      <div
        className="relative w-full transition-transform duration-300 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateY(${estaVolteada ? 180 : 0}deg) rotateX(${tilt.activo && personalizacion.efecto3d ? tilt.rotX : 0}deg) rotateY(${tilt.activo && personalizacion.efecto3d ? (estaVolteada ? -tilt.rotY : tilt.rotY) : 0}deg)`,
        }}
      >
        {/* ========================================================= */}
        {/* CARA FRONTAL (ANVERSO)                                    */}
        {/* ========================================================= */}
        <article
          data-print="carnet"
          style={{
            background: tema.degradado,
            boxShadow: `0 22px 44px ${tema.sombra}`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)',
            zIndex: estaVolteada ? 0 : 10,
            pointerEvents: estaVolteada ? 'none' : 'auto',
          }}
          className={
            'hero-glow relative flex min-h-[535px] w-full flex-col justify-between overflow-hidden rounded-2xl text-white ' +
            'transition-all duration-300'
          }
        >
          {renderizarPatron()}
          {renderizarReflejo()}

          {/* Cabecera institucional + Insignia técnica */}
          <header className="relative z-10 flex items-center justify-between border-b border-white/15 bg-white/10 px-4.5 py-3.5 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <span className="rounded-[6px] border border-white/20 bg-white/15 px-2 py-0.5 text-nota font-extrabold tracking-[0.06em]">
                {estudiante.siglaInstitucion}
              </span>
              <span className="text-menuda font-light tracking-[0.08em] uppercase opacity-90">
                {estudiante.institucion}
              </span>
            </div>
            {/* Insignia de Especialidad (Idea 1) */}
            <span
              className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/20 px-2 py-0.5 text-etiqueta font-semibold backdrop-blur-xs shadow-xs"
              title={insignia.descripcion}
            >
              <span aria-hidden>{insignia.icono}</span>
              <span className="max-w-[80px] truncate">{insignia.nombre}</span>
            </span>
          </header>

          {/* Cuerpo principal del carnet */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-5 text-center">
            {/* Avatar con iniciales o foto, y soporte para resplandor holográfico */}
            <div
              className={`relative mb-3 flex size-[114px] items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-white/25 to-white/10 text-white backdrop-blur-md transition-all duration-300 ${
                personalizacion.efectoBrillo
                  ? 'ring-4 ring-white/60 shadow-[0_0_30px_rgba(255,255,255,0.45),0_10px_24px_rgba(0,0,0,0.3)]'
                  : 'shadow-[0_10px_24px_rgba(0,0,0,0.25)]'
              }`}
            >
              {tieneFotoReal ? (
                <img
                  src={estudiante.fotoUrl}
                  alt={`Fotografía de ${estudiante.nombre}`}
                  className="size-full rounded-full object-cover"
                />
              ) : (
                <span className="text-[2.2rem] font-extrabold tracking-wider text-white select-none drop-shadow-sm">
                  {obtenerIniciales(estudiante.nombre)}
                </span>
              )}

              {/* Indicador de estado activo */}
              <span
                className="absolute right-1 bottom-1 size-4 rounded-full border-2 border-white bg-[#10b981] shadow-sm"
                title="Estudiante activo"
              />
            </div>

            <h3 className="mb-0.5 text-titulo font-bold tracking-[-0.02em] text-white">
              {estudiante.nombre}
            </h3>
            <p className="text-menor tracking-[0.04em] text-white/80">ID: {estudiante.codigo}</p>
            <p className="mt-1 text-menor font-light text-white/95">{estudiante.especialidad}</p>

            <span className="mt-2.5 inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-menuda font-semibold backdrop-blur-xs">
              Sección {estudiante.grupo} — {estudiante.jornada}
            </span>

            {/* Lema o frase personal (Idea 2) */}
            {personalizacion.lemaPersonal && (
              <p
                className="mt-3 line-clamp-1 max-w-[280px] text-menuda font-medium italic text-white/90 drop-shadow-xs"
                title={personalizacion.lemaPersonal}
              >
                «{personalizacion.lemaPersonal}»
              </p>
            )}
          </div>

          {/* Pie blanco con Código QR real institucional y diseño premium */}
          <footer className="relative z-10 flex items-center gap-3.5 bg-white/95 px-4.5 py-3 text-slate-900 shadow-inner backdrop-blur-md">
            <div className="flex shrink-0 items-center justify-center rounded-xl border border-slate-200/90 bg-white p-1.5 shadow-sm">
              <QRCodeSVG
                value={valorQR}
                size={58}
                level="M"
                aria-label={`Código QR para ${estudiante.nombre}`}
              />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1.5">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-etiqueta font-extrabold tracking-wider text-emerald-700 uppercase">
                  Credencial Oficial
                </span>
              </div>
              <p className="mt-0.5 text-dato font-bold leading-tight text-slate-900">
                Validación de Identidad
              </p>
              <p className="mt-0.5 text-micro leading-snug text-slate-500">
                Sección {estudiante.grupo} • Escaneo para asistencia y comedor
              </p>
            </div>
          </footer>
        </article>

        {/* ========================================================= */}
        {/* CARA TRASERA (REVERSO OFICIAL) - Idea 4                  */}
        {/* ========================================================= */}
        <article
          data-print="carnet-reverso"
          style={{
            background: tema.degradado,
            boxShadow: `0 22px 44px ${tema.sombra}`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
            zIndex: estaVolteada ? 10 : 0,
            pointerEvents: estaVolteada ? 'auto' : 'none',
          }}
          className={
            'hero-glow absolute inset-0 flex min-h-[535px] w-full flex-col justify-between overflow-hidden rounded-2xl text-white ' +
            'transition-all duration-300'
          }
        >
          {renderizarPatron()}
          {renderizarReflejo()}

          {/* Franja superior imitación banda magnética / institucional */}
          <div className="relative z-10 border-b border-white/10 bg-black/40 px-5 py-2.5">
            <div className="flex items-center justify-between text-menuda font-mono tracking-widest text-white/80 uppercase">
              <span>{estudiante.siglaInstitucion} — REVERSO</span>
              <span className="font-bold text-white">CTP 2026</span>
            </div>
          </div>

          {/* Cuerpo del Reverso con Datos Médicos, Emergencia y Lema */}
          <div className="relative z-10 flex flex-1 flex-col justify-center px-5 py-3 text-left">
            {/* Lema personal destacado en el reverso (Idea 2) */}
            <div className="mb-3 rounded-xl border border-white/20 bg-white/15 p-3 text-center backdrop-blur-xs">
              <span className="block text-etiqueta font-bold tracking-wider text-white/75 uppercase">
                Lema del Estudiante
              </span>
              <p className="mt-0.5 text-nota font-semibold italic text-white">
                «{personalizacion.lemaPersonal || 'Orgullo y excelencia técnica profesional'}»
              </p>
            </div>

            {/* Ficha Médica y de Emergencia */}
            <div className="mb-3 space-y-2 rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-xs">
              <div className="flex items-center justify-between border-b border-white/15 pb-2">
                <span className="flex items-center gap-1.5 text-menor font-medium text-white/85">
                  <span>🩸</span> Grupo Sanguíneo:
                </span>
                <span className="rounded-md border border-white/30 bg-white/25 px-2.5 py-0.5 text-nota font-extrabold text-white">
                  {personalizacion.tipoSangre}
                </span>
              </div>

              <div className="text-menor">
                <span className="flex items-center gap-1.5 text-white/85">
                  <span>📞</span> Contacto de Emergencia:
                </span>
                <div className="mt-1 pl-5">
                  <p className="font-bold text-white">
                    {personalizacion.contactoEmergenciaNombre || 'Acudiente registrado'}
                  </p>
                  <p className="text-menuda text-white/80 font-mono">
                    {personalizacion.contactoEmergenciaTelefono || 'Teléfono no especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Simulación visual de Código de Barras Institucional */}
            <div className="rounded-xl border border-white/15 bg-white/90 p-3 text-center text-slate-900 shadow-inner">
              <svg
                className="mx-auto h-10 w-full max-w-[240px]"
                viewBox="0 0 200 40"
                preserveAspectRatio="none"
                aria-label="Código de barras institucional"
              >
                {/* Patrón estilizado de barras */}
                {[
                  2, 6, 12, 16, 20, 26, 32, 36, 42, 48, 54, 58, 64, 70, 76, 82, 86, 92, 98,
                  104, 110, 114, 120, 126, 132, 138, 142, 148, 154, 160, 166, 172, 178, 184, 190,
                ].map((x, idx) => (
                  <rect
                    key={x}
                    x={x}
                    y={0}
                    width={idx % 3 === 0 ? 3 : idx % 2 === 0 ? 2 : 1}
                    height={40}
                    fill="#0f172a"
                  />
                ))}
              </svg>
              <p className="mt-1 text-etiqueta font-mono tracking-widest text-slate-600">
                *CR-{estudiante.codigo}-{estudiante.grupo}*
              </p>
            </div>

            {/* Aviso legal institucional */}
            <p className="mt-2.5 text-center text-[10px] leading-tight text-white/70">
              Esta credencial es intransferible y propiedad oficial del titular en el CTP.
              En caso de extravío entregarlo en la dirección escolar.
            </p>
          </div>

          {/* Pie del Reverso */}
          <footer className="relative z-10 flex items-center justify-between border-t border-white/15 bg-black/25 px-5 py-3">
            <span className="text-etiqueta text-white/80 font-medium">
              Vigencia: {estudiante.vigencia}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                alternarVoltear()
              }}
              data-print="ocultar"
              className="relative z-20 flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/30 bg-white/20 px-2.5 py-1 text-etiqueta font-bold text-white transition-all hover:bg-white/30 active:scale-95"
            >
              <span>↺</span>
              <span>Volver al frente</span>
            </button>
          </footer>
        </article>
      </div>
    </div>
  )
}

