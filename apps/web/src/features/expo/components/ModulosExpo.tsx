import { useState } from 'react'
import {
  IconoCarnet,
  IconoCalendario,
  IconoComedor,
  IconoDispositivo,
  IconoCodigoQR,
  IconoFlechaDerecha,
  IconoReloj,
  IconoAgenda,
} from '@/components/icons'

export function ModulosExpo() {
  const [moduloActivo, setModuloActivo] = useState(0)

  const navegarAModulo = (ruta: string) => {
    localStorage.setItem('studenthub_demo_sesion', 'true')
    window.location.href = ruta
  }

  const modulos = [
    {
      id: 'carnet',
      nombre: 'Carnet Digital 3D',
      icono: <IconoCarnet className="size-5" />,
      badge: 'Identidad',
      titulo: 'Identidad Estudiantil Moderna y Segura',
      rutaApp: '/carnet',
      resumen:
        'Sustituye el carnet físico de plástico o papel por una credencial digital interactiva enriquecida con física 3D, reflejo holográfico y código QR dinámico.',
      caracteristicas: [
        'Efecto de inclinación 3D reactivo al cursor y giroscopio móvil',
        'Insignias oficiales por especialidad técnica (Web, Electrónica, Mecatrónica)',
        'Reverso interactivo con tipo de sangre y teléfono SOS de emergencia',
        'Código QR de validación óptica para portón y comedor escolar',
      ],
      renderPreview: () => (
        <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-6 text-white shadow-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden border border-white/20">
          <div className="absolute -right-8 -bottom-8 size-44 rounded-full bg-blue-500/25 blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between">
              <span className="text-micro uppercase tracking-widest font-mono bg-white/10 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/20">
                Credencial Digital
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300 text-micro font-bold bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                OFICIAL 2026
              </span>
            </div>
            <div className="mt-5 flex items-center gap-3.5">
              <div className="size-13 rounded-2xl border-2 border-white/40 bg-white/15 backdrop-blur-xs flex items-center justify-center font-black text-lg shadow-inner">
                VS
              </div>
              <div>
                <h4 className="font-black text-lg leading-tight tracking-tight">Valeria Solano Méndez</h4>
                <p className="text-menuda text-white/80 font-mono mt-0.5">2026-CTP-0842 · Sec. 12-1</p>
              </div>
            </div>
            <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-3 py-1.5 text-menuda font-semibold backdrop-blur-xs border border-white/10">
              <span>💻 Especialidad: Desarrollo Web</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20 flex items-center justify-between text-menuda">
            <span className="flex items-center gap-1.5 font-mono text-white/90">
              <IconoCodigoQR className="size-4 text-emerald-300" />
              <span>QR Dinámico Activo</span>
            </span>
            <span className="text-micro font-bold bg-white/20 px-2.5 py-1 rounded-full border border-white/20 font-mono">
              Tipo: O+
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'agenda',
      nombre: 'Agenda & Avisos Docentes',
      icono: <IconoAgenda className="size-5" />,
      badge: 'Productividad',
      titulo: 'Planificación Académica y Notificaciones en Vivo',
      rutaApp: '/agenda',
      resumen:
        'Centraliza tareas, proyectos, exámenes y avisos tempranos de docentes ausentes. Evita desplazamientos innecesarios y desorientación durante las horas libres.',
      caracteristicas: [
        'Avisos de docentes ausentes con indicación de trabajo autónomo o aula asignada',
        'Registro de tareas con fecha límite y checklist de seguimiento',
        'Calendario de exámenes con conteo regresivo de días restantes',
        'Funciona 100% offline para consulta sin saldo ni conexión Wi-Fi',
      ],
      renderPreview: () => (
        <div className="w-full max-w-sm rounded-3xl bg-surface border-2 border-amber-500/25 p-5.5 shadow-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7.5 items-center justify-center rounded-xl bg-primary text-white text-nota font-bold shadow-xs">
                <IconoAgenda className="size-4" />
              </span>
              <span className="text-nota font-bold text-text">Mi Agenda Escolar</span>
            </div>
            <span className="text-micro font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
              3 Pendientes
            </span>
          </div>

          <div className="my-3 space-y-2">
            {/* Alerta de docente ausente */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-900 dark:text-amber-200 shadow-xs">
              <div className="flex items-center gap-1.5 text-micro font-bold">
                <span>⚠️</span>
                <span>Docente ausente hoy: Prof. Marco Rojas</span>
              </div>
              <p className="text-menuda text-amber-800/80 dark:text-amber-300 mt-0.5 ml-4">
                Taller Mecatrónica · Guía autónoma en biblioteca
              </p>
            </div>

            {/* Tarea con checklist */}
            <div className="rounded-2xl border border-primary/25 bg-primary-tint/30 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-5 rounded-md border-2 border-primary items-center justify-center text-primary text-xs font-black">
                  ✓
                </span>
                <div>
                  <h5 className="text-menuda font-bold text-text">Proyecto Final Frontend</h5>
                  <p className="text-micro text-text-muted">Entrega hoy 11:59 pm</p>
                </div>
              </div>
              <span className="text-micro font-bold text-primary bg-surface px-2 py-0.5 rounded-md border border-border">
                Hoy
              </span>
            </div>

            {/* Examen próximo */}
            <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <div>
                  <h5 className="text-menuda font-bold text-text">Examen de Matemáticas</h5>
                  <p className="text-micro text-text-muted">Funciones y Trigonometría</p>
                </div>
              </div>
              <span className="text-micro font-bold text-rose-600 dark:text-rose-400 font-mono bg-rose-500/10 px-2 py-0.5 rounded-md">
                En 3 días
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-menuda text-text-muted">
            <span className="font-mono">Recordatorios activos</span>
            <span className="text-primary font-bold">Sincronizado</span>
          </div>
        </div>
      ),
    },
    {
      id: 'horarios',
      nombre: 'Horarios Inteligentes',
      icono: <IconoCalendario className="size-5" />,
      badge: 'Académico',
      titulo: 'Planificación Académica en Tiempo Real',
      rutaApp: '/horarios',
      resumen:
        'Cada estudiante consulta el horario exacto de su sección, visualizando la lección en curso, el taller técnico y los bloques lectivos del día.',
      caracteristicas: [
        'Filtro dinámico por nivel y grupo (10°, 11° y 12° año)',
        'Resaltado automático de la clase que se está impartiendo en este minuto',
        'Diferenciación visual entre lecciones académicas y talleres técnicos de especialidad',
        'Cero riesgo de desactualización: sincronizado en tiempo real',
      ],
      renderPreview: () => (
        <div className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-2xl flex flex-col justify-between min-h-[300px] relative">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-nota font-bold text-text">En Curso Ahora</span>
            </div>
            <span className="text-micro font-mono bg-primary-tint text-primary font-bold px-2 py-0.5 rounded-full border border-primary/20">
              Sección 12-1
            </span>
          </div>

          <div className="my-3 space-y-2">
            <div className="rounded-2xl border-2 border-primary/40 bg-primary-tint/30 p-3.5 shadow-xs">
              <div className="flex items-center justify-between text-micro font-bold text-primary mb-1">
                <span>BLOQUE 3 Y 4</span>
                <span className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md">
                  <IconoReloj className="size-3" />
                  <span>Restan 25 min</span>
                </span>
              </div>
              <h5 className="font-black text-text text-base">Desarrollo Web Frontend</h5>
              <p className="text-menuda text-text-muted mt-0.5">Laboratorio de Informática 3</p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-surface-alt/60 p-3 opacity-80">
              <div className="text-micro font-medium text-text-muted">SIGUIENTE CLASE (11:15 AM)</div>
              <p className="text-nota font-bold text-text">Inglés Técnico para la Industria</p>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-menuda text-text-muted">
            <span>Jornada: 7:00 am - 4:20 pm</span>
            <span className="text-primary font-bold">10 lecciones</span>
          </div>
        </div>
      ),
    },
    {
      id: 'comedor',
      nombre: 'Comedor Estudiantil',
      icono: <IconoComedor className="size-5" />,
      badge: 'Nutrición',
      titulo: 'Menú Semanal y Gestión Eficiente',
      rutaApp: '/comedor',
      resumen:
        'Transparencia total sobre la alimentación diaria del colegio con control ágil de raciones y balance nutricional avalado por el PANEA.',
      caracteristicas: [
        'Menú semanal programado con rotación automática por fecha',
        'Desglose claro de plato fuerte, acompañamientos, ensalada y fruta fresca',
        'Validación por QR que acelera la fila a menos de un segundo por plato',
        'Auditoría y conteo de porciones servidas sin usar hojas de papel',
      ],
      renderPreview: () => (
        <div className="w-full max-w-sm rounded-3xl bg-surface border border-border p-6 shadow-2xl flex flex-col justify-between min-h-[300px] relative">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="text-micro font-bold uppercase tracking-wider text-amber-600 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
              Almuerzo de Hoy
            </span>
            <span className="text-micro font-mono text-emerald-600 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
              ✓ Beca Activa
            </span>
          </div>

          <div className="my-3 space-y-2">
            <h5 className="text-base font-black text-text">
              Arroz con Pollo Criollo
            </h5>
            <div className="space-y-1.5 text-menuda text-text-muted">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                <span>Acompañamiento: Frijoles molidos arreglados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                <span>Ensalada: Repollo fresco, zanahoria y tomate</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                <span>Fruta y Bebida: Piña madura y Fresco de Cas</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-border flex items-center justify-between text-menuda text-text-muted">
            <span className="font-mono">Turno: 11:20 am - 1:00 pm</span>
            <span className="text-emerald-600 font-bold">Pase Rápido QR</span>
          </div>
        </div>
      ),
    },
    {
      id: 'pwa',
      nombre: 'PWA Offline-First',
      icono: <IconoDispositivo className="size-5" />,
      badge: 'Tecnología',
      titulo: 'Instalable y Siempre Disponible',
      rutaApp: '/',
      resumen:
        'Funciona como una aplicación nativa sin pasar por tiendas de aplicaciones y sin gastar el saldo de internet del estudiante.',
      caracteristicas: [
        'Instalación directa con 1 toque en Android e iOS (pantalla completa)',
        'Service Worker inteligente con estrategia Stale-While-Revalidate',
        'Apertura instantánea en menos de 0.3 segundos',
        'Peso ultra liviano: menos de 500 KB totales de almacenamiento',
      ],
      renderPreview: () => (
        <div className="w-full max-w-sm rounded-3xl bg-gradient-to-br from-purple-800 via-violet-900 to-slate-950 p-6 text-white shadow-2xl flex flex-col justify-between min-h-[300px] relative overflow-hidden border border-purple-500/30">
          <div className="flex items-center justify-between">
            <span className="text-micro uppercase tracking-widest font-mono bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/30">
              PWA Certificada
            </span>
            <span className="text-emerald-300 font-mono text-menuda font-bold bg-emerald-500/20 px-2 py-0.5 rounded-full">
              100% Offline
            </span>
          </div>

          <div className="my-3 space-y-2.5">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-menuda text-white/70">Almacenamiento Total</span>
              <span className="font-mono font-bold text-white">&lt; 500 KB</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-menuda text-white/70">Velocidad de Arranque</span>
              <span className="font-mono font-bold text-emerald-300">0.2 seg</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-menuda text-white/70">Modo Avión / Sin Saldo</span>
              <span className="font-mono font-bold text-white">Activo y Listo</span>
            </div>
          </div>

          <div className="pt-3 border-t border-white/20 text-center">
            <span className="text-menuda text-white/80 font-medium">
              Instalación sin Google Play ni Apple Store
            </span>
          </div>
        </div>
      ),
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
            Todo lo que el Estudiante Necesita en un Solo Lugar
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Toca cualquiera de las pestañas para ver la previsualización interactiva de cada servicio estudiantil.
          </p>
        </div>

        {/* Pestañas de selección con Badges y estilo enriquecido */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10">
          {modulos.map((mod, idx) => {
            const activo = moduloActivo === idx
            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setModuloActivo(idx)}
                className={`flex items-center gap-2 px-4.5 py-3 rounded-2xl text-nota font-bold cursor-pointer transition-all duration-200 ${
                  activo
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-102 ring-2 ring-primary/20'
                    : 'bg-surface border border-border text-text-muted hover:text-text hover:border-primary/40 hover:shadow-xs'
                }`}
              >
                {mod.icono}
                <span>{mod.nombre}</span>
              </button>
            )
          })}
        </div>

        {/* Tarjeta de Detalle del Módulo Seleccionado */}
        <div className="rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-lg grid grid-cols-1 lg:grid-cols-12 gap-8 items-center backdrop-blur-xs">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-primary font-bold text-etiqueta uppercase tracking-wider">
              {actual.icono}
              <span>Módulo Oficial · {actual.badge}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-text">{actual.titulo}</h3>
            <p className="text-base text-text-muted leading-relaxed">{actual.resumen}</p>

            <div className="pt-4 border-t border-border">
              <h4 className="text-etiqueta font-bold uppercase tracking-wider text-text mb-3">
                Beneficios Clave Evaluados
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

            {/* Botón de acción directa hacia la App Real */}
            <div className="pt-4">
              <button
                type="button"
                onClick={() => navegarAModulo(actual.rutaApp)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-nota font-bold text-white hover:bg-primary-dark shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-98"
              >
                <span>Probar {actual.nombre} en la App Real</span>
                <IconoFlechaDerecha className="size-4" />
              </button>
            </div>
          </div>

          {/* Tarjeta Visual de Previsualización Interactiva */}
          <div className="lg:col-span-5 flex justify-center">
            {actual.renderPreview()}
          </div>
        </div>
      </div>
    </section>
  )
}
