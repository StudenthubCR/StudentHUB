import { QRCodeSVG } from 'qrcode.react'
import { obtenerIniciales } from '@/lib/texto'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'
import {
  buscarTema,
  PERSONALIZACION_POR_DEFECTO,
  type PersonalizacionCarnet,
} from '../carnet.estilos'

type Props = {
  estudiante: Estudiante
  personalizacion?: PersonalizacionCarnet
}

/**
 * La credencial oficial del estudiante.
 * Incluye personalización de colores, texturas de fondo, avatar con iniciales
 * y código QR interactivo con el nombre del estudiante y su sección.
 */
export function TarjetaCarnet({
  estudiante,
  personalizacion = PERSONALIZACION_POR_DEFECTO,
}: Props) {
  const tieneFotoReal = Boolean(
    estudiante.fotoUrl &&
      !estudiante.fotoUrl.includes('student.webp') &&
      !estudiante.fotoUrl.includes('placeholder'),
  )

  const tema = buscarTema(personalizacion.temaId)
  const valorQR = `Nombre: ${estudiante.nombre}\nSección: ${estudiante.grupo}`

  return (
    <article
      data-print="carnet"
      style={{
        background: tema.degradado,
        boxShadow: `0 22px 44px ${tema.sombra}`,
      }}
      className={
        'hero-glow relative w-full max-w-[350px] overflow-hidden rounded-2xl text-white ' +
        'transition-all duration-300'
      }
    >
      {/* Capas de texturas/patrones personalizables */}
      {personalizacion.patron === 'puntos' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.45) 1.2px, transparent 1.2px)',
            backgroundSize: '14px 14px',
          }}
        />
      )}
      {personalizacion.patron === 'malla' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.35) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />
      )}
      {personalizacion.patron === 'lineas' && (
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6) 1px, transparent 1px, transparent 8px)',
          }}
        />
      )}

      {/* Cabecera institucional */}
      <header className="relative flex items-center gap-2.5 border-b border-white/15 bg-white/10 px-5 py-4.5 backdrop-blur-sm">
        <span className="rounded-[6px] border border-white/20 bg-white/15 px-2.5 py-1 text-nota font-extrabold tracking-[0.06em]">
          {estudiante.siglaInstitucion}
        </span>
        <span className="text-menuda font-light tracking-[0.09em] uppercase opacity-90">
          {estudiante.institucion}
        </span>
      </header>

      {/* Cuerpo principal del carnet */}
      <div className="relative px-5 py-7 text-center">
        {/* Avatar con iniciales o foto, y soporte para resplandor holográfico */}
        <div
          className={`mx-auto mb-4.5 flex size-[118px] items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-white/25 to-white/10 text-white backdrop-blur-md transition-all duration-300 ${
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
            <span className="text-[2.25rem] font-extrabold tracking-wider text-white select-none drop-shadow-sm">
              {obtenerIniciales(estudiante.nombre)}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-titulo font-bold tracking-[-0.02em] text-white">
          {estudiante.nombre}
        </h3>
        <p className="text-menor tracking-[0.04em] text-white/80">ID: {estudiante.codigo}</p>
        <p className="my-2.5 text-menor font-light text-white/95">{estudiante.especialidad}</p>

        <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-menuda font-semibold backdrop-blur-xs">
          Sección {estudiante.grupo} — {estudiante.jornada}
        </span>
      </div>

      {/* Pie blanco con Código QR real */}
      <footer className="relative flex items-center gap-3.5 bg-white px-5 py-4 text-[#1a1a1a]">
        <div className="flex shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white p-1.5 shadow-sm">
          <QRCodeSVG
            value={valorQR}
            size={56}
            level="M"
            aria-label={`Código QR para ${estudiante.nombre}`}
          />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-nota font-bold text-[#0c142c]">Validación de Sección</p>
          <p className="text-etiqueta leading-snug text-[#5c6b8f]">
            QR oficial con el nombre del estudiante y su grupo ({estudiante.grupo}).
          </p>
        </div>
      </footer>
    </article>
  )
}
