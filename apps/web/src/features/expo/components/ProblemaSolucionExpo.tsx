export function ProblemaSolucionExpo() {
  const comparativas = [
    {
      titulo: 'Carnet Estudiantil',
      icono: '🪪',
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Carnets de cartulina o PVC que se rompen o se pierden',
          'Costo de reposición de ¢2.500 a ¢5.000 para las familias',
          'Fácil de alterar o prestar entre estudiantes',
          'Semanas de espera para la entrega al inicio del año',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'Credencial digital interactiva siempre en el celular',
          'Costo ¢0 de reposición para el colegio y las familias',
          'Código QR dinámico anti-capturas y datos médicos en reverso',
          'Activación inmediata desde el primer día lectivo',
        ],
      },
    },
    {
      titulo: 'Comedor Estudiantil',
      icono: '🍽️',
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas de papel y listas impresas con lápiz',
          'Filas de más de 30 minutos esperando verificación manual',
          'Desconocimiento del menú nutricional del día',
          'Dificultad para auditar raciones y becas de comedor',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'Validación digital por código QR en menos de 1 segundo',
          'Reducción drástica del tiempo de espera en la fila',
          'Consulta del menú semanal con balance nutricional',
          'Reporte y conteo automático de platos servidos',
        ],
      },
    },
    {
      titulo: 'Horarios y Comunicación',
      icono: '📅',
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Hojas pegadas en murales de pasillo que se dañan',
          'Confusión cuando hay rotación de talleres o docentes',
          'Estudiantes desorientados con horas libres',
          'Imposible consultar fuera del colegio',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'Horario dinámico por sección disponible 24/7',
          'Indicador en vivo de "Lección en Curso" y "Siguiente Aula"',
          'Sincronizado directamente con las fuentes oficiales',
          'Consulta instantánea en móvil, tablet o PC',
        ],
      },
    },
    {
      titulo: 'Conectividad y Redes',
      icono: '📡',
      problema: {
        etiqueta: 'Modelo Tradicional',
        puntos: [
          'Sistemas web pesados que no abren sin Wi-Fi veloz',
          'Requiere descarga de tiendas (Google Play / App Store)',
          'Gran consumo de datos celulares de los estudiantes',
          'Inaccesible en zonas del colegio sin cobertura',
        ],
      },
      solucion: {
        etiqueta: 'Con Student HUB',
        puntos: [
          'PWA instalable en 1 toque sin pasar por tiendas comerciales',
          'Arquitectura Offline-First: funciona incluso sin saldo ni internet',
          'Pesa menos de 500 KB (ultra liviano y ecológico)',
          'Compatible con cualquier celular iOS o Android',
        ],
      },
    },
  ]

  return (
    <section id="problema" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-tint border border-primary/20 px-3 py-0.5 text-micro font-bold uppercase tracking-wider text-primary">
            <span>Impacto Real</span>
          </div>
          <h2 className="mt-3 text-2xl sm:text-4xl font-black text-text">
            Problema vs. Solución
          </h2>
          <p className="mt-3 text-base text-text-muted">
            Diseñado analizando las fricciones reales del día a día en un Colegio Técnico Profesional costarricense.
          </p>
        </div>

        {/* Grid de Comparativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {comparativas.map((item, idx) => (
            <div
              key={idx}
              className="rounded-3xl border border-border bg-surface p-6 shadow-sm overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <span className="text-2xl">{item.icono}</span>
                <h3 className="text-lg font-bold text-text">{item.titulo}</h3>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tradicional (Rojo / Warning) */}
                <div className="rounded-2xl bg-rose-500/5 border border-rose-500/20 p-4">
                  <div className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-rose-600 mb-2">
                    <span>✕</span>
                    <span>{item.problema.etiqueta}</span>
                  </div>
                  <ul className="space-y-2 text-menuda text-text-muted">
                    {item.problema.puntos.map((punto, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 text-xs shrink-0 mt-0.5">•</span>
                        <span>{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Con Student HUB (Verde / Éxito) */}
                <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4">
                  <div className="flex items-center gap-1.5 text-micro font-bold uppercase tracking-wider text-emerald-600 mb-2">
                    <span>✓</span>
                    <span>{item.solucion.etiqueta}</span>
                  </div>
                  <ul className="space-y-2 text-menuda text-text">
                    {item.solucion.puntos.map((punto, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5 font-medium">
                        <span className="text-emerald-500 text-xs shrink-0 mt-0.5">✓</span>
                        <span>{punto}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
