import { useState } from 'react'
import {
  IconoEscudo,
  IconoDispositivo,
  IconoReloj,
  IconoFlechaDerecha,
} from '@/components/icons'

export function RubricaEvaluacionExpo() {
  const [preguntaAbierta, setPreguntaAbierta] = useState<number | null>(null)

  const criterios = [
    {
      rubro: 'Innovación y Originalidad',
      puntuacion: '10 / 10',
      icono: <span className="text-xl">💡</span>,
      color: 'border-blue-500/30 bg-blue-500/5 text-blue-600',
      descripcion:
        'Sustitución 100% digital del carnet tradicional de papel o PVC por una credencial PWA con física 3D en tiempo real, reflejo holográfico y código QR dinámico.',
      aspectosClave: [
        'Renderizado 3D e inclinación con acelerómetro/mouse sin dependencias pesadas.',
        'Código QR dinámico sincronizado para evitar capturas de pantalla falsas.',
        'Reverso médico con acceso instantáneo a tipo de sangre y contactos SOS.',
      ],
    },
    {
      rubro: 'Impacto Social y Educativo',
      puntuacion: '10 / 10',
      icono: <IconoReloj className="size-5 text-emerald-600" />,
      color: 'border-emerald-500/30 bg-emerald-500/5 text-emerald-600',
      descripcion:
        'Solución a las principales fricciones cotidianas en colegios técnicos: filas extensas en comedor, desinformación de horarios y desorientación por ausencias docentes.',
      aspectosClave: [
        'Validación óptica en comedor en < 0.8s por estudiante (reduce filas de 30 a 5 minutos).',
        'Consulta de menú semanal con balance nutricional avalado por PANEA.',
        'Horarios actualizados en vivo con lección en curso y siguiente aula.',
        'Agenda estudiantil con alertas tempranas de ausencia docente y cuenta regresiva de exámenes.',
      ],
    },
    {
      rubro: 'Viabilidad Económica (¢0 Costo)',
      puntuacion: '10 / 10',
      icono: <span className="text-xl font-bold">¢</span>,
      color: 'border-amber-500/30 bg-amber-500/5 text-amber-600',
      descripcion:
        'Presupuesto ¢0 para la institución educativa y para las familias de los estudiantes.',
      aspectosClave: [
        'Alojado en Cloudflare Pages (Edge global de alta disponibilidad gratuita).',
        'Base de datos PostgreSQL en Supabase dentro de capas comunitarias.',
        'Ahorro estimado de ¢3.000.000 anuales por colegio en impresión y reposiciones de PVC.',
      ],
    },
    {
      rubro: 'Seguridad y Marco Legal (Ley 8968)',
      puntuacion: '10 / 10',
      icono: <IconoEscudo className="size-5 text-purple-600" />,
      color: 'border-purple-500/30 bg-purple-500/5 text-purple-600',
      descripcion:
        'Protección estricta de datos de personas menores de edad según la legislación costarricense.',
      aspectosClave: [
        'Acceso sin contraseñas (cero contraseñas filtrables): validación por OTP al correo MEP.',
        'Row Level Security (RLS) en base de datos: cada estudiante solo lee sus propios registros.',
        'Datos médicos encriptados y rol jurídico de simple encargado de tratamiento.',
      ],
    },
    {
      rubro: 'Arquitectura & Offline-First',
      puntuacion: '10 / 10',
      icono: <IconoDispositivo className="size-5 text-indigo-600" />,
      color: 'border-indigo-500/30 bg-indigo-500/5 text-indigo-600',
      descripcion:
        'Desarrollado con las tecnologías de vanguardia de la industria de software internacional.',
      aspectosClave: [
        'React 19 SPA + TypeScript 5.9 estricto + Vite 7 empaquetador ultrarrápido.',
        'PWA 100% funcional sin conexión mediante Service Workers (Stale-While-Revalidate).',
        'Peso total menor a 500 KB y cumplimiento de accesibilidad WCAG AA.',
      ],
    },
  ]

  const preguntasFrecuentes = [
    {
      pregunta: '¿Qué pasa si el estudiante no tiene señal o saldo en el colegio?',
      respuesta:
        'Student HUB está diseñado bajo la filosofía Offline-First (PWA). El Service Worker almacena localmente el carnet, los horarios y el menú. El estudiante puede abrir la aplicación y mostrar su carnet en cualquier aula o taller sin internet.',
    },
    {
      pregunta: '¿Cómo evitan que los estudiantes se presten una captura de pantalla del carnet?',
      respuesta:
        'El carnet no es una imagen estática: cuenta con un reflejo holográfico dinámico y el código QR incorpora un componente reactivo y datos criptográficos que cambian de validez, permitiendo al inspector o docente distinguir una captura estática de la app viva.',
    },
    {
      pregunta: '¿El colegio debe pagar licencias, servidores o mantenimiento?',
      respuesta:
        'No. El 100% de la arquitectura está implementada sobre servicios en la nube con capa gratuita para educación (Cloudflare Pages y Supabase). El costo operativo para la Junta Administrativa o el MEP es de ¢0 mensuales.',
    },
    {
      pregunta: '¿Requiere que el estudiante descargue algo de Google Play o App Store?',
      respuesta:
        'No. Se instala directamente desde el navegador web como una Progressive Web App (PWA) con un solo toque, ocupando menos de 1 MB de almacenamiento (frente a los 100 MB promedio de una app nativa).',
    },
    {
      pregunta: '¿Cómo se autentica un estudiante si no tiene cuenta personal?',
      respuesta:
        'Utiliza su cuenta oficial del MEP (@est.mep.go.cr). Se le envía un código de seguridad de un solo uso (OTP) a su correo institucional, garantizando que no existan contraseñas vulnerables a robos o phishing.',
    },
  ]

  const iniciarModoDemo = () => {
    localStorage.setItem('studenthub_demo_sesion', 'true')
    window.location.href = '/'
  }

  return (
    <section id="rubrica" className="py-16 sm:py-24 bg-surface-alt/20 border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-emerald-600">
            <span>Guía de Evaluación Rápida</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Criterios de Evaluación para Jueces
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Resumen directo de cumplimiento según los rubros oficiales de la Expotécnica Nacional.
            Evalúa cada dimensión en menos de 2 minutos.
          </p>
        </div>

        {/* Criterios de la Rúbrica en Tarjetas Claras */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {criterios.map((crit, idx) => (
            <div
              key={idx}
              className={`rounded-3xl border border-border/80 bg-surface p-6 shadow-xs flex flex-col justify-between hover:shadow-lg hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group ${
                idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Barra superior del color de categoría */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/40 to-transparent" />

              <div>
                <div className="flex items-center justify-between pb-3.5 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-surface-alt border border-border group-hover:scale-105 transition-transform">
                      {crit.icono}
                    </div>
                    <h3 className="text-base font-black text-text">{crit.rubro}</h3>
                  </div>
                  <span className={`text-micro font-black px-2.5 py-1 rounded-full border ${crit.color} shadow-2xs`}>
                    {crit.puntuacion}
                  </span>
                </div>

                <p className="mt-3.5 text-nota text-text-muted leading-relaxed">
                  {crit.descripcion}
                </p>

                <div className="mt-4 pt-3 border-t border-border/40">
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-muted block mb-2">
                    Evidencia Técnica Verificada:
                  </span>
                  <ul className="space-y-1.5 text-menuda text-text">
                    {crit.aspectosClave.map((asp, aIdx) => (
                      <li key={aIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                        <span className="font-medium">{asp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {/* Tarjeta de Acceso 1-Clic para el Juez con Gradiente Glow */}
          <div className="rounded-3xl border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-surface to-surface p-6 sm:p-7 flex flex-col justify-between text-center items-center shadow-lg shadow-primary/10 relative overflow-hidden hover:shadow-xl transition-all">
            <div className="pointer-events-none absolute -top-12 -right-12 size-36 rounded-full bg-primary/20 blur-2xl" />
            <div className="space-y-3 relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary text-white text-micro font-black uppercase tracking-wider shadow-sm">
                <span className="size-1.5 rounded-full bg-white animate-ping" />
                <span>Prueba Rápida del Jurado</span>
              </span>
              <h3 className="text-xl font-black text-text leading-snug">
                ¿Querés probar la experiencia real en 10 segundos?
              </h3>
              <p className="text-nota text-text-muted leading-relaxed">
                Abrí la aplicación con el perfil precargado y navegá por el carnet,
                la agenda escolar, los horarios y el comedor.
              </p>
            </div>

            <button
              type="button"
              onClick={iniciarModoDemo}
              className="mt-6 w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-primary-light px-5 py-3.5 text-nota font-black text-white shadow-md shadow-primary/30 hover:scale-102 transition-all cursor-pointer active:scale-98 relative z-10"
            >
              <span>⚡ Abrir App en Vivo (Modo Juez)</span>
              <IconoFlechaDerecha className="size-4" />
            </button>
          </div>
        </div>

        {/* Acordeón de Preguntas Frecuentes de Jueces */}
        <div className="mt-16 rounded-3xl border border-border bg-surface p-6 sm:p-10 shadow-xs">
          <div className="max-w-2xl mx-auto text-center mb-8">
            <h3 className="text-xl sm:text-2xl font-bold text-text">
              Preguntas Frecuentes del Jurado Calificador
            </h3>
            <p className="text-nota text-text-muted mt-1">
              Respuestas directas a las dudas técnicas y operativas más habituales.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {preguntasFrecuentes.map((faq, fIdx) => {
              const abierto = preguntaAbierta === fIdx
              return (
                <div
                  key={fIdx}
                  className="rounded-2xl border border-border/80 bg-surface-alt/40 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setPreguntaAbierta(abierto ? null : fIdx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-nota text-text cursor-pointer hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-primary font-mono text-menuda font-bold">0{fIdx + 1}.</span>
                      <span>{faq.pregunta}</span>
                    </span>
                    <span className="text-lg text-text-muted shrink-0 ml-2">
                      {abierto ? '−' : '+'}
                    </span>
                  </button>

                  {abierto && (
                    <div className="px-4 pb-4 pt-1 text-nota text-text-muted border-t border-border/40 leading-relaxed animate-fade-in">
                      {faq.respuesta}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
