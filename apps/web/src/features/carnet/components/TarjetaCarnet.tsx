import { IconoCodigoQR } from '@/components/icons'
import type { Estudiante } from '@/features/estudiante/estudiante.fixture'

/**
 * La credencial. Los colores son fijos de marca: se ve igual en claro y en
 * oscuro, y así también se imprime bien.
 */
export function TarjetaCarnet({ estudiante }: { estudiante: Estudiante }) {
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
        <div className="mx-auto mb-4.5 size-[118px] rounded-full bg-white/90 p-1 shadow-[0_10px_24px_rgba(0,0,0,0.25)]">
          <img
            src={estudiante.fotoUrl}
            alt={`Fotografía de ${estudiante.nombre}`}
            className="size-full rounded-full object-cover"
          />
        </div>

        <h3 className="mb-1 text-titulo font-bold tracking-[-0.02em]">{estudiante.nombre}</h3>
        <p className="text-menor tracking-[0.04em] opacity-75">ID: {estudiante.codigo}</p>
        <p className="my-2.5 text-menor font-light opacity-95">{estudiante.especialidad}</p>

        <span className="inline-block rounded-full border border-white/20 bg-white/15 px-3.5 py-1 text-menuda font-semibold">
          Sección {estudiante.jornada}
        </span>
      </div>

      {/* Pie blanco, como un carnet impreso de verdad.
          Aquí la app actual dibuja un cuadrado negro con divs simulando un QR
          y escribe "Escanea para validar". No se portó: ese QR no codifica
          nada y no hay nada que lo valide. El plan lo dice explícito (§10):
          o el QR se hace de verdad, o el carnet se rotula como informativo. */}
      <footer className="relative flex items-center gap-3.5 bg-white px-5 py-4 text-[#1a1a1a]">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-md border border-dashed border-[#c3ccdf] text-[#8e9bb8]">
          <IconoCodigoQR className="size-[26px]" />
        </div>
        <div className="min-w-0">
          <p className="text-nota font-bold">Carnet informativo</p>
          <p className="text-etiqueta leading-snug text-[#5c6b8f]">
            La validación por QR se habilita cuando exista la credencial firmada.
          </p>
        </div>
      </footer>
    </article>
  )
}
