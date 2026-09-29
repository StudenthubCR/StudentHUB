import { useEffect, useState } from 'react'
import {
  obtenerNoticiasAdmin,
  guardarNoticiaAdmin,
  eliminarNoticiaAdmin,
  toggleDestacadaNoticia,
} from '../services/admin.service'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { ModalConfirmacion } from '../components/ModalConfirmacion'
import { SkeletonCard } from '../components/Skeletons'
import {
  IconoMas,
  IconoEditar,
  IconoEliminar,
  IconoEstrella,
  IconoCerrar,
  IconoPeriodico,
} from '@/components/icons'
import type { NoticiaAdmin } from '../services/admin.types'

export function AdminNoticiasPage() {
  const { email } = useAdminAuth()
  const [noticias, setNoticias] = useState<NoticiaAdmin[]>([])
  const [cargando, setCargando] = useState(true)

  // Estado del formulario modal
  const [modalAbierto, setModalAbierto] = useState(false)
  const [noticiaAEditar, setNoticiaAEditar] = useState<NoticiaAdmin | null>(null)
  const [titulo, setTitulo] = useState('')
  const [resumen, setResumen] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [imagen, setImagen] = useState('')
  const [periodo, setPeriodo] = useState('2026')
  const [destacada, setDestacada] = useState(false)
  const [publicada, setPublicada] = useState(true)
  const [fechaPublicacion, setFechaPublicacion] = useState('')

  // Diálogos de confirmación
  const [confirmacionBorrar, setConfirmacionBorrar] = useState<NoticiaAdmin | null>(null)

  const cargarNoticias = () => {
    setCargando(true)
    try {
      const data = obtenerNoticiasAdmin()
      setNoticias(data)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarNoticias()
    const alActualizar = () => cargarNoticias()
    window.addEventListener('studenthub:admin-noticias-updated', alActualizar)
    return () => window.removeEventListener('studenthub:admin-noticias-updated', alActualizar)
  }, [])

  const abrirModalCrear = () => {
    setNoticiaAEditar(null)
    setTitulo('')
    setResumen('')
    setCuerpo('')
    setImagen('/news_fiestas_patrias.webp')
    setPeriodo('Septiembre')
    setDestacada(false)
    setPublicada(true)
    setFechaPublicacion(new Date().toISOString().slice(0, 10))
    setModalAbierto(true)
  }

  const abrirModalEditar = (noticia: NoticiaAdmin) => {
    setNoticiaAEditar(noticia)
    setTitulo(noticia.titulo)
    setResumen(noticia.resumen)
    setCuerpo(noticia.cuerpo)
    setImagen(noticia.imagen)
    setPeriodo(noticia.periodo)
    setDestacada(noticia.destacada)
    setPublicada(noticia.publicada)
    setFechaPublicacion(noticia.fechaPublicacion.slice(0, 10))
    setModalAbierto(true)
  }

  const manejarGuardar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titulo.trim() || !resumen.trim()) return

    guardarNoticiaAdmin(
      {
        id: noticiaAEditar?.id,
        titulo,
        resumen,
        cuerpo: cuerpo || resumen,
        imagen: imagen || '/news_fiestas_patrias.webp',
        periodo: periodo || '2026',
        destacada,
        publicada,
        fechaPublicacion: new Date(fechaPublicacion || Date.now()).toISOString(),
        autor: email,
      },
      email,
    )

    setModalAbierto(false)
    cargarNoticias()
  }

  const confirmarEliminar = () => {
    if (!confirmacionBorrar) return
    eliminarNoticiaAdmin(confirmacionBorrar.id, email)
    setConfirmacionBorrar(null)
    cargarNoticias()
  }

  const alternarDestacada = (id: string) => {
    toggleDestacadaNoticia(id, email)
    cargarNoticias()
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-micro font-black uppercase tracking-wider text-primary">
            Boletín Institucional
          </span>
          <h1 className="text-titulo font-black text-text md:text-hero">
            Gestor de Noticias y Eventos Generales
          </h1>
          <p className="text-menor text-text-muted">
            Publicación enriquecida, afiches y selección de noticias destacadas en el carrusel de inicio.
          </p>
        </div>

        <button
          type="button"
          onClick={abrirModalCrear}
          className="flex min-h-[44px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-95"
        >
          <IconoMas className="size-4" />
          <span>Redactar Noticia</span>
        </button>
      </div>

      {/* Grid de Noticias */}
      {cargando ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : noticias.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center text-text-muted">
          <div className="flex flex-col items-center gap-2">
            <IconoPeriodico className="size-10 text-text-muted/60" />
            <p className="font-bold text-text">No hay noticias registradas</p>
            <p className="text-menuda">
              Hacé clic en &quot;Redactar Noticia&quot; para publicar un comunicado general.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {noticias.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all hover:border-border-strong hover:shadow-md"
            >
              {/* Portada */}
              <div className="relative aspect-video w-full overflow-hidden bg-surface-alt">
                <img
                  src={item.imagen}
                  alt={item.titulo}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = '/news_fiestas_patrias.webp'
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="rounded-md bg-black/60 px-2 py-0.5 text-micro font-bold text-white backdrop-blur-xs">
                    {item.periodo}
                  </span>
                  {item.destacada && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-micro font-black text-white shadow-xs">
                      <IconoEstrella className="size-3 fill-white" />
                      Destacada
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex flex-1 flex-col p-4.5">
                <h3 className="text-cuerpo font-bold text-text line-clamp-1">{item.titulo}</h3>
                <p className="mt-1 flex-1 text-menuda text-text-muted line-clamp-2">
                  {item.resumen}
                </p>

                <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                  <button
                    type="button"
                    onClick={() => alternarDestacada(item.id)}
                    className={`inline-flex min-h-[44px] sm:min-h-0 items-center gap-1.5 cursor-pointer rounded-lg px-2.5 py-1 text-micro font-bold transition-all border ${
                      item.destacada
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'border-border text-text-muted hover:border-border-strong'
                    }`}
                  >
                    <IconoEstrella
                      className={`size-3.5 ${item.destacada ? 'fill-amber-500 text-amber-500' : ''}`}
                    />
                    <span>{item.destacada ? 'En Carrusel' : 'Destacar'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => abrirModalEditar(item)}
                      className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-surface-alt hover:text-primary transition-colors"
                      title="Editar noticia"
                    >
                      <IconoEditar className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmacionBorrar(item)}
                      className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-lg text-text-muted hover:bg-rose-500/10 hover:text-rose-600 transition-colors"
                      title="Eliminar noticia"
                    >
                      <IconoEliminar className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar Noticia (Mobile Bottom-Sheet / Desktop Centered) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-100 flex items-end justify-center sm:items-center p-0 sm:p-5">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setModalAbierto(false)}
          />
          <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col animate-fade-in rounded-t-3xl sm:rounded-3xl border border-border bg-surface shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-dato font-bold text-text sm:text-cuerpo">
                {noticiaAEditar ? 'Editar Noticia Institucional' : 'Nueva Noticia Institucional'}
              </h2>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="flex size-9 min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl text-text-muted hover:bg-surface-alt"
                aria-label="Cerrar modal"
              >
                <IconoCerrar className="size-5" />
              </button>
            </div>

            <form onSubmit={manejarGuardar} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  Título de la Noticia
                </label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Proceso de Matrícula y Admisión 2027"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-cuerpo text-text outline-none focus:border-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  URL de Imagen de Portada / Afiche
                </label>
                <input
                  type="text"
                  value={imagen}
                  onChange={(e) => setImagen(e.target.value)}
                  placeholder="/news_matricula_2027.webp o https://..."
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
                />
                <p className="mt-1 text-[11px] text-text-muted">
                  Podés usar imágenes existentes como /news_fiestas_patrias.webp, /news_festival_artes.webp o enlaces web.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                    Periodo / Mes
                  </label>
                  <input
                    type="text"
                    value={periodo}
                    onChange={(e) => setPeriodo(e.target.value)}
                    placeholder="Ej. Octubre, Noviembre..."
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                    Fecha de Publicación
                  </label>
                  <input
                    type="date"
                    value={fechaPublicacion}
                    onChange={(e) => setFechaPublicacion(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  Resumen Corto (Para tarjetas y carrusel)
                </label>
                <textarea
                  rows={2}
                  required
                  value={resumen}
                  onChange={(e) => setResumen(e.target.value)}
                  placeholder="Breve sinopsis que atraiga la atención de los estudiantes..."
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2 text-menor text-text outline-none focus:border-primary min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-etiqueta font-bold uppercase tracking-wider text-text-muted mb-1">
                  Cuerpo Completo de la Noticia
                </label>
                <textarea
                  rows={4}
                  value={cuerpo}
                  onChange={(e) => setCuerpo(e.target.value)}
                  placeholder="Detalles ampliados, requisitos, cronograma, instrucciones..."
                  className="w-full resize-none rounded-xl border border-border bg-surface px-3.5 py-2 text-menor text-text outline-none focus:border-primary"
                />
              </div>

              {/* Opciones de publicación */}
              <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-alt/40 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={destacada}
                    onChange={(e) => setDestacada(e.target.checked)}
                    className="size-4 rounded text-primary"
                  />
                  <span className="inline-flex items-center gap-1.5 text-menuda font-bold text-text">
                    <IconoEstrella className="size-4 text-amber-500 fill-amber-500" />
                    Marcar como Destacada (Carrusel de Inicio)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={publicada}
                    onChange={(e) => setPublicada(e.target.checked)}
                    className="size-4 rounded text-primary"
                  />
                  <span className="text-menuda font-semibold text-text">
                    Visible inmediatamente
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="min-h-[44px] cursor-pointer rounded-xl border border-border bg-surface px-4 py-2 text-menor font-semibold text-text-muted hover:bg-surface-alt transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] cursor-pointer rounded-xl bg-primary px-5 py-2 text-menor font-bold text-white shadow-xs transition-all hover:bg-primary-dark active:scale-98"
                >
                  {noticiaAEditar ? 'Guardar Cambios' : 'Publicar Noticia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      <ModalConfirmacion
        abierto={Boolean(confirmacionBorrar)}
        titulo="¿Eliminar esta noticia?"
        mensaje={`Se eliminará "${confirmacionBorrar?.titulo}". Esta acción retirará la noticia del portal público de los estudiantes.`}
        textoConfirmar="Eliminar Noticia"
        variante="danger"
        alCerrar={() => setConfirmacionBorrar(null)}
        alConfirmar={confirmarEliminar}
      />
    </div>
  )
}
