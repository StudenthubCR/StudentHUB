import { IconoCalendario, IconoComedor } from '@/components/icons'
import { nombreLargoDeFecha, separarAderezo } from '../menu.service'
import type { EstadoVista } from '../menu.types'

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex flex-col">
      <span className="mb-0.5 text-etiqueta tracking-[0.08em] text-white/65 uppercase">
        {etiqueta}
      </span>
      <span className="text-dato leading-snug font-semibold text-white">{valor}</span>
    </div>
  )
}

function Badge({ Icono, children }: { Icono: typeof IconoComedor; children: string }) {
  return (
    <p
      className={
        'relative mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 ' +
        'bg-white/15 px-3.5 py-1.5 text-menuda font-bold backdrop-blur-[10px]'
      }
    >
      <Icono className="size-3.5 shrink-0" />
      {children}
    </p>
  )
}

function Titulo({ children, atenuado }: { children: string; atenuado?: boolean }) {
  return (
    <h3
      className={
        'relative text-titulo leading-[1.2] font-bold tracking-[-0.02em] text-white ' +
        'md:text-[1.6rem] ' +
        (atenuado ? 'animate-pulse' : '')
      }
    >
      {children}
    </h3>
  )
}

const CONTENEDOR =
  'hero-glow relative overflow-hidden rounded-xl px-6 py-6.5 text-white elev-hero ' +
  'bg-[linear-gradient(140deg,#0130B2_0%,#0B2B80_60%,#071c56_100%)] md:px-7 md:py-8'

type Props = {
  estado: EstadoVista
  hoy: Date
  onReintentar?: () => void
}

/**
 * Banner del menú del día. Los colores son fijos de marca a propósito: el
 * texto blanco mantiene contraste en los dos temas, igual que hoy.
 */
export function MenuHoyCard({ estado, hoy, onReintentar }: Props) {
  const fechaDeHoy = `Hoy es ${nombreLargoDeFecha(hoy)}`

  if (estado.tipo === 'servido') {
    const { acompanamiento, aderezo } = separarAderezo(estado.menu.acompanamiento)

    return (
      <article className={CONTENEDOR}>
        <Badge Icono={IconoComedor}>Menú Recomendado de Hoy</Badge>
        <Titulo>{estado.menu.plato}</Titulo>

        {acompanamiento && (
          <div className="relative mt-5 border-t border-white/20 pt-4">
            <Dato etiqueta="Acompañamiento" valor={acompanamiento} />
          </div>
        )}

        <div
          className={
            'relative mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/20 pt-4 ' +
            (aderezo ? 'xs:grid-cols-3' : 'xs:grid-cols-2')
          }
        >
          {aderezo && <Dato etiqueta="Aderezo" valor={aderezo} />}
          <Dato etiqueta="Bebida" valor={estado.menu.bebida} />
          <Dato etiqueta="Fruta" valor={estado.menu.fruta} />
        </div>
      </article>
    )
  }

  // Estados sin plato que mostrar. No se pinta la fila de datos en "—":
  // cuatro guiones no informan de nada y sólo alargan la tarjeta.
  const informativo: Record<string, { titulo: string; detalle: string }> = {
    cargando: {
      titulo: 'Consultando el menú de hoy…',
      detalle: 'Estamos leyendo la programación del comedor institucional.',
    },
    error: {
      titulo: 'No pudimos cargar el menú',
      detalle: estado.tipo === 'error' ? estado.mensaje : '',
    },
    cerrado: {
      titulo: 'Comedor Cerrado',
      detalle:
        'El servicio de comedor no está activo durante los fines de semana. ¡Que tengas un excelente descanso!',
    },
    'sin-menu': {
      titulo: 'Sin menú publicado para hoy',
      detalle:
        'La cocina todavía no ha publicado el almuerzo de este día. Revisá la programación semanal más abajo.',
    },
  }

  const { titulo, detalle } = informativo[estado.tipo]!

  return (
    <article className={CONTENEDOR} aria-busy={estado.tipo === 'cargando'}>
      <Badge Icono={IconoCalendario}>{fechaDeHoy}</Badge>
      <Titulo atenuado={estado.tipo === 'cargando'}>{titulo}</Titulo>

      <p className="relative mt-3 max-w-[650px] text-dato leading-[1.55] text-white/85">
        {detalle}
      </p>

      {estado.tipo === 'error' && onReintentar && (
        <button
          type="button"
          onClick={onReintentar}
          className={
            'relative mt-5 cursor-pointer rounded-full border border-white/30 bg-white/15 ' +
            'px-4 py-2 text-nota font-semibold transition-colors duration-250 ' +
            'hover:bg-white/25 active:scale-95'
          }
        >
          Reintentar
        </button>
      )}
    </article>
  )
}
