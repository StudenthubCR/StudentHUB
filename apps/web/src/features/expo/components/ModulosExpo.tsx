import { useState } from 'react'
import {
  IconoCarnet,
  IconoCalendario,
  IconoComedor,
  IconoDispositivo,
  IconoCodigoQR,
} from '@/components/icons'

export function ModulosExpo() {
  const [moduloActivo, setModuloActivo] = useState(0)

  const modulos = [
    {
      id: 'carnet',
      nombre: 'Carnet Digital 3D',
      icono: <IconoCarnet className="size-5" />,
      titulo: 'Identidad Estudiantil Moderna y Segura',
      resumen:
        'Sustituye el carnet físico con una credencial digital interactiva enriquecida con física 3D, reflejo holográfico y código QR dinámico.',
      caracteristicas: [
        'Efecto de inclinación 3D (Tilt) reactivo al movimiento',
        'Insignias oficiales por especialidad técnica',
        'Reverso interactivo con tipo de sangre y teléfono de emergencia',
        'Código QR de validación para portón y comedor',
      ],
      previewColor: 'from-blue-600 to-indigo-800',
    },
    {
      id: 'horarios',
      nombre: 'Horarios Inteligentes',
      icono: <IconoCalendario className="size-5" />,
      titulo: 'Planificación Académica en Tiempo Real',
      resumen:
        'Cada estudiante consulta el horario exacto de su sección, visualizando la lección en curso y los bloques lectivos del día.',
      caracteristicas: [
        'Filtro dinámico por nivel y grupo (10°, 11° y 12°)',
        'Resaltado automático de la clase que se está impartiendo en este minuto',
        'Diferenciación visual entre lecciones académicas y talleres técnicos',
        'Cero riesgo de desactualización',
      ],
      previewColor: 'from-emerald-600 to-teal-800',
    },
    {
      id: 'comedor',
      nombre: 'Comedor Estudiantil',
      icono: <IconoComedor className="size-5" />,
      titulo: 'Menú Semanal y Gestión Eficiente',
      resumen:
        'Transparencia total sobre la alimentación diaria del colegio con control ágil de raciones.',
      caracteristicas: [
        'Menú semanal programado con rotación automática por fecha',
        'Desglose claro de plato fuerte, acompañamientos, ensalada y fruta',
        'Validación por QR que acelera la fila a menos de un segundo por plato',
        'Auditoría y conteo de porciones servidas',
      ],
      previewColor: 'from-amber-600 to-orange-800',
    },
    {
      id: 'pwa',
      nombre: 'PWA Offline-First',
      icono: <IconoDispositivo className="size-5" />,
      titulo: 'Instalable y Siempre Disponible',
      resumen:
        'Funciona como una aplicación nativa sin pasar por tiendas de aplicaciones y sin gastar el saldo de internet del estudiante.',
      caracteristicas: [
        'Instalación directa con 1 toque en Android e iOS',
        'Service Worker inteligente con estrategia Stale-While-Revalidate',
        'Apertura instantánea en modo pantalla completa',
        'Peso ultra liviano: menos de 500 KB totales',
      ],
      previewColor: 'from-purple-600 to-pink-800',
    },
  ]

  const actual = modulos[moduloActivo]

  return (
    <section id="modulos" className="py-16 sm:py-24 bg-surface-alt/30 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
            <span>Módulos de la Aplicación</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Todo lo que el Estudiante Necesita
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Un ecosistema unificado que centraliza los servicios más consultados de la vida estudiantil.
          </p>
        </div>

        {/* Pestañas de selección */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
          {modulos.map((mod, idx) => {
            const activo = moduloActivo === idx
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setModuloActivo(idx)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-nota font-semibold cursor-pointer transition-all duration-200 ${
                  activo
                    ? 'bg-primary text-white shadow-md shadow-primary/20 scale-102'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:border-primary/40'
                }`}
              >
                {mod.icono}
                <span>{mod.nombre}</span>
              </button>
            )
          })}
        </div>

        {/* Tarjeta de Detalle del Módulo Seleccionado */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-etiqueta uppercase tracking-wider">
              {actual.icono}
              <span>Módulo Oficial</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-text">{actual.titulo}</h3>
            <p className="text-base text-text-muted leading-relaxed">{actual.resumen}</p>

            <div className="pt-4 border-t border-border">
              <h4 className="text-etiqueta font-bold uppercase tracking-wider text-text mb-3">
                Beneficios Principales
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-nota text-text">
                {actual.caracteristicas.map((car, cIdx) => (
                  <li key={cIdx} className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary-tint text-primary text-xs font-bold mt-0.5">
                      ✓
                    </span>
                    <span>{car}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tarjeta Visual de Previsualización */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${actual.previewColor} p-6 text-white shadow-xl flex flex-col justify-between min-h-[260px] relative overflow-hidden`}
            >
              {/* Círculo decorativo */}
              <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-micro uppercase tracking-widest font-mono bg-black/20 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                    Student HUB Core
                  </span>
                  <span className="text-white/80">{actual.icono}</span>
                </div>
                <h4 className="mt-4 text-xl font-bold">{actual.nombre}</h4>
                <p className="mt-2 text-menuda text-white/80 leading-snug">{actual.titulo}</p>
              </div>

              <div className="pt-4 border-t border-white/20 flex items-center justify-between text-menuda font-mono text-white/90">
                <span className="flex items-center gap-1">
                  <IconoCodigoQR className="size-4" />
                  <span>Sincronizado</span>
                </span>
                <span className="text-emerald-300 font-bold">● Activo 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
