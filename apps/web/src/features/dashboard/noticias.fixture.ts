/**
 * Noticias y boletines del carrusel informativo escolar.
 *
 * Programación cronológica desde septiembre hasta diciembre:
 * - Septiembre: Fiestas Patrias y Semana Cívica
 * - Octubre: Festival Estudiantil de las Artes
 * - Noviembre: Práctica Profesional Supervisada y Pasantías
 * - Noviembre / Diciembre: Proceso de Matrícula y Admisión 2027
 * - Diciembre: Acto Solemne de Graduación y Clausura
 */
export type Noticia = {
  id: string
  titulo: string
  /** Texto alternativo descriptivo */
  descripcion: string
  imagen: string
  periodo?: string
}

export const NOTICIAS: Noticia[] = [
  {
    id: 'fiestas-patrias',
    titulo: 'Fiestas Patrias 2026',
    descripcion: 'Afiche de la Semana Cívica y Celebración de Fiestas Patrias del CTP 2026 (Septiembre)',
    imagen: '/news_fiestas_patrias.webp',
    periodo: 'Septiembre',
  },
  {
    id: 'festival-artes',
    titulo: 'Festival de las Artes 2026',
    descripcion: 'Afiche del Festival Estudiantil de las Artes FEA del CTP 2026 (Octubre)',
    imagen: '/news_festival_artes.webp',
    periodo: 'Octubre',
  },
  {
    id: 'practica-profesional',
    titulo: 'Práctica Profesional 2026',
    descripcion: 'Afiche de la Práctica Profesional Supervisada y Pasantías en Empresas CTP 2026 (Noviembre)',
    imagen: '/news_practica_profesional.webp',
    periodo: 'Noviembre',
  },
  {
    id: 'matricula-2027',
    titulo: 'Matrícula y Admisión 2027',
    descripcion: 'Afiche de la convocatoria oficial de matrícula y admisión para el curso 2027 (Noviembre - Diciembre)',
    imagen: '/news_matricula_2027.webp',
    periodo: 'Noviembre - Diciembre',
  },
  {
    id: 'graduacion-2026',
    titulo: 'Graduación CTP 2026',
    descripcion: 'Afiche del Acto Solemne de Graduación de Técnicos Medios y Bachilleres CTP 2026 (Diciembre)',
    imagen: '/news_graduacion_2026.webp',
    periodo: 'Diciembre',
  },
]

