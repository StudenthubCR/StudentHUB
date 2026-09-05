import { QRCodeSVG } from 'qrcode.react'
import { obtenerIniciales } from '@/lib/texto'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'

/**
 * La credencial oficial del estudiante.
 * Incluye avatar personalizado con iniciales (sin placeholders de fotos genéricas)
 * y código QR interactivo con el nombre del estudiante y su sección.
 */
export function TarjetaCarnet({ estudiante }: { estudiante: Estudiante }) {
  const tieneFotoReal = Boolean(
    estudiante.fotoUrl &&
      !estudiante.fotoUrl.includes('student.webp') &&
      !estudiante.fotoUrl.includes('placeholder'),
  )

  const valorQR = `Nombre: ${estudiante.nombre}\nSección: ${estudiante.grupo}`

  return (
    <article
      data-print="carnet"
      className={
        'hero-glow relative w-full max-w-[350px] overflow-hidden rounded-xl ' +
        'bg-[linear-gradient(140deg,#0130B2_0%,#0B2B80_55%,#071c56_100%)] text-white ' +
        'shadow-[0_22px_44px_rgba(11,43,128,0.32)]'
      }
    >
      <header className="relative flex items-center gap-2.5 border-b border-white/15 bg-white/10 px-5 py-4.5">
        <span className="rounded-[6px] border border-white/20 bg-white/15 px-2.5 py-1 text-nota font-extrabold tracking-[0.06em]">
          {estudiante.siglaInstitucion}
        </span>
        <span className="text-menuda font-light tracking-[0.09em] uppercase opacity-90">
          {estudiante.institucion}
        </span>
      </header>

      <div className="relative px-5 py-7 text-center">
        {/* Avatar sin placeholder: iniciales estilizadas con relieve */}
        <div className="mx-auto mb-4.5 flex size-[118px] items-center justify-center rounded-full border-2 border-white/30 bg-gradient-to-br from-white/25 to-white/10 text-white shadow-[0_10px_24px_rgba(0,0,0,0.25)] backdrop-blur-md">
          {tieneFotoReal ? (
            <img
              src={estudiante.fotoUrl}
              alt={`Fotografía de ${estudiante.nombre}`}
              className="size-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[2.25rem] font-extrabold tracking-wider text-white select-none">
              {obtenerIniciales(estudiante.nombre)}
            </span>
          )}
        </div>

        <h3 className="mb-1 text-titulo font-bold tracking-[-0.02em]">{estudiante.nombre}</h3>
        <p className="text-menor tracking-[0.04em] opacity-75">ID: {estudiante.codigo}</p>
        <p className="my-2.5 text-menor font-light opacity-95">{estudiante.especialidad}</p>

        <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-menuda font-semibold">
          Sección {estudiante.grupo} — {estudiante.jornada}
        </span>
      </div>

      {/* Pie blanco con Código QR real que codifica nombre y sección */}
      <footer className="relative flex items-center gap-3.5 bg-white px-5 py-4 text-[#1a1a1a]">
        <div className="flex shrink-0 items-center justify-center rounded-lg border border-[#e2e8f0] bg-white p-1.5 shadow-sm">
          <QRCodeSVG
            value={valorQR}
            size={56}
            level="M"
            aria-label={`Código QR para ${estudiante.nombre}`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-nota font-bold text-[#0c142c]">Validación de Sección</p>
          <p className="text-etiqueta leading-snug text-[#5c6b8f]">
            QR oficial con el nombre del estudiante y su grupo ({estudiante.grupo}).
          </p>
        </div>
      </footer>
    </article>
  )
}
