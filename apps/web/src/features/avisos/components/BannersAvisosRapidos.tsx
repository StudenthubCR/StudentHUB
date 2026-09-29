import { useState } from 'react'
import {
  IconoChevron,
  IconoCerrar,
  IconoAlertaTriangulo,
  IconoInfo,
  IconoReloj,
  IconoBirrete,
  IconoComedor,
  IconoCalendario,
  IconoMegafono,
  IconoUsuarios,
  IconoColegio,
  IconoEliminar,
} from '@/components/icons'
import { cn } from '@/lib/cn'
import { formatearTiempoAviso } from '../avisos.service'
import type { InstitutionAlert, PrioridadAviso } from '../avisos.types'
import { ModalCrearAviso } from './ModalCrearAviso'
import { useAvisos } from '../useAvisos'

const ESTILOS_PRIORIDAD = {
  urgent: {
    borde: 'border-rose-500/40 dark:border-rose-500/50',
    fondo: 'bg-rose-500/10 dark:bg-rose-950/25',
    textoBadge: 'text-rose-700 dark:text-rose-300',
    badgeBg: 'bg-rose-500/20 border-rose-500/30',
    Icono: IconoAlertaTriangulo,
    labelPrioridad: 'Urgente',
  },
  warning: {
    borde: 'border-amber-500/35 dark:border-amber-500/45',
    fondo: 'bg-amber-500/10 dark:bg-amber-950/25',
    textoBadge: 'text-amber-700 dark:text-amber-300',
    badgeBg: 'bg-amber-500/20 border-amber-500/30',
    Icono: IconoAlertaTriangulo,
    labelPrioridad: 'Importante',
  },
  info: {
    borde: 'border-blue-500/35 dark:border-blue-500/40',
    fondo: 'bg-blue-500/10 dark:bg-blue-950/20',
    textoBadge: 'text-blue-700 dark:text-blue-300',
    badgeBg: 'bg-blue-500/20 border-blue-500/30',
    Icono: IconoInfo,
    labelPrioridad: 'Aviso',
  },
} as const

const ETIQUETAS_CATEGORIA = {
  early_departure: { Icono: IconoReloj, label: 'Salida Anticipada' },
  absence: { Icono: IconoBirrete, label: 'Ausencia Docente' },
  menu_change: { Icono: IconoComedor, label: 'Cambio de Menú' },
  event: { Icono: IconoCalendario, label: 'Actividad' },
  general: { Icono: IconoMegafono, label: 'Comunicado' },
} as const

export function BannersAvisosRapidos() {
  const {
    avisos,
    esAdmin,
    descartarAviso,
    publicarAviso,
    borrarAviso,
  } = useAvisos()

  const [indiceActual, setIndiceActual] = useState(0)
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false)

  const total = avisos.length
  const indiceSeguro = total > 0 ? Math.min(indiceActual, total - 1) : 0
  const avisoActual: InstitutionAlert | undefined = avisos[indiceSeguro]

  // Si no hay avisos activos para el usuario:
  if (total === 0) {
    // Si es administrador, mostrar barra con opción de redactar un aviso
    if (esAdmin) {
      return (
        <>
          <div className="mb-3.5 flex items-center justify-between gap-3 rounded-2xl border border-dashed border-primary/30 bg-primary-tint/30 p-2.5 sm:px-3.5">
            <div className="flex items-center gap-2">
              <IconoMegafono className="size-4 text-primary" />
              <p className="text-micro font-bold text-text">
                Panel Administrador: No hay comunicados activos en este momento.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalCrearAbierto(true)}
              className="cursor-pointer rounded-xl bg-primary px-3 py-1 text-micro font-bold text-white shadow-2xs transition-all hover:bg-primary-dark active:scale-95"
            >
              + Publicar Aviso
            </button>
          </div>
          <ModalCrearAviso
            abierto={modalCrearAbierto}
            alCerrar={() => setModalCrearAbierto(false)}
            alGuardar={publicarAviso}
          />
        </>
      )
    }
    // Para estudiantes: no mostrar nada si no hay avisos
    return null
  }

  const estilo = ESTILOS_PRIORIDAD[avisoActual.priority as PrioridadAviso] ?? ESTILOS_PRIORIDAD.info
  const cat = ETIQUETAS_CATEGORIA[avisoActual.category as keyof typeof ETIQUETAS_CATEGORIA] ?? {
    Icono: IconoMegafono,
    label: 'Comunicado',
  }
  const IconoPrioridad = estilo.Icono
  const IconoCat = cat.Icono

  const siguiente = () => setIndiceActual((prev) => (prev + 1) % total)
  const anterior = () => setIndiceActual((prev) => (prev - 1 + total) % total)

  return (
    <>
      <section
        aria-label="Comunicados y alertas oficiales"
        className={cn(
          'relative mb-3.5 sm:mb-4 w-full rounded-2xl border p-3 sm:p-3.5 transition-all duration-300 shadow-2xs backdrop-blur-xs',
          estilo.borde,
          estilo.fondo,
        )}
      >
        {/* Barra superior de la tarjeta */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex flex-wrap items-center gap-1.5 min-w-0">
            {/* Badge de Urgencia */}
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border shadow-2xs',
                estilo.badgeBg,
                estilo.textoBadge,
              )}
            >
              <IconoPrioridad className="size-3" />
              <span>{estilo.labelPrioridad}</span>
            </span>

            {/* Badge de Categoría */}
            <span className="inline-flex items-center gap-1 rounded-md bg-surface/80 border border-border/60 px-2 py-0.5 text-[10.5px] font-bold text-text-muted">
              <IconoCat className="size-3 text-primary" />
              <span>{cat.label}</span>
            </span>

            {/* Badge de Audiencia Destinataria */}
            {avisoActual.target_type === 'section' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface/80 border border-border/60 px-1.5 py-0.5 text-[10px] font-bold text-text-muted">
                <IconoUsuarios className="size-3 text-primary" />
                <span>Sección: {avisoActual.target_values.join(', ')}</span>
              </span>
            )}
            {avisoActual.target_type === 'specialty' && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface/80 border border-border/60 px-1.5 py-0.5 text-[10px] font-bold text-text-muted truncate max-w-[200px]">
                <IconoBirrete className="size-3 text-primary" />
                <span>{avisoActual.target_values.join(', ')}</span>
              </span>
            )}
            {avisoActual.target_type === 'all' && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-surface/80 border border-border/60 px-1.5 py-0.5 text-[10px] font-medium text-text-muted">
                <IconoColegio className="size-3 text-primary" />
                <span>Toda la Institución</span>
              </span>
            )}

            <span className="text-[10.5px] font-medium text-text-muted">
              · {formatearTiempoAviso(avisoActual.created_at)}
            </span>
          </div>

          {/* Acciones y Controles */}
          <div className="flex items-center gap-1 shrink-0">
            {total > 1 && (
              <div className="flex items-center gap-1 mr-1">
                <span className="text-[10.5px] font-bold text-text-muted">
                  {indiceSeguro + 1}/{total}
                </span>
                <button
                  type="button"
                  onClick={anterior}
                  aria-label="Aviso anterior"
                  title="Aviso anterior"
                  className="flex size-5.5 cursor-pointer items-center justify-center rounded-md bg-surface/80 border border-border text-text-muted hover:text-text active:scale-90"
                >
                  <IconoChevron hacia="izquierda" className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={siguiente}
                  aria-label="Aviso siguiente"
                  title="Aviso siguiente"
                  className="flex size-5.5 cursor-pointer items-center justify-center rounded-md bg-surface/80 border border-border text-text-muted hover:text-text active:scale-90"
                >
                  <IconoChevron hacia="derecha" className="size-3" />
                </button>
              </div>
            )}

            {/* Botón "+ Publicar" visible ÚNICAMENTE para Administradores */}
            {esAdmin && (
              <button
                type="button"
                onClick={() => setModalCrearAbierto(true)}
                title="Publicar nuevo comunicado institucional (Solo Administrador)"
                className="cursor-pointer rounded-lg bg-primary px-2 py-0.5 text-[10.5px] font-bold text-white shadow-2xs hover:bg-primary-dark transition-all mr-1"
              >
                + Publicar
              </button>
            )}

            {/* Botón borrar visible ÚNICAMENTE para Administradores */}
            {esAdmin && (
              <button
                type="button"
                onClick={() => void borrarAviso(avisoActual.id)}
                aria-label="Eliminar aviso de la base de datos"
                title="Eliminar este aviso (Solo Administrador)"
                className="flex size-6 cursor-pointer items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25 transition-colors"
              >
                <IconoEliminar className="size-3.5" />
              </button>
            )}

            {/* Botón de descarte para el usuario en su sesión */}
            <button
              type="button"
              onClick={() => descartarAviso(avisoActual.id)}
              aria-label="Descartar aviso"
              title="Descartar aviso en esta sesión"
              className="flex size-6 cursor-pointer items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-border/40 hover:text-text"
            >
              <IconoCerrar className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Título y Contenido del Comunicado */}
        <div className="pr-6">
          <h3 className="text-micro sm:text-dato font-black text-text tracking-tight mb-0.5 leading-snug">
            {avisoActual.title}
          </h3>
          <p className="text-micro sm:text-dato text-text-muted leading-relaxed line-clamp-2">
            {avisoActual.message}
          </p>
        </div>
      </section>

      {/* Modal de Publicación restringido por permisos */}
      {esAdmin && (
        <ModalCrearAviso
          abierto={modalCrearAbierto}
          alCerrar={() => setModalCrearAbierto(false)}
          alGuardar={publicarAviso}
        />
      )}
    </>
  )
}
