/**
 * Noticias del carrusel — por ahora fijas, como en la app actual.
 *
 * Las imágenes se sirven desde el `assets/` de la raíz del repositorio. Según
 * el plan (Fase 2) estas noticias pasan a una tabla con las imágenes en un
 * bucket público de Storage; entonces este archivo se cambia por una consulta
 * y `CarruselNoticias` no se entera.
 */
export type Noticia = {
  id: string
  titulo: string
  /** Texto alternativo real, no una repetición del título con emojis. */
  descripcion: string
  imagen: string
}

export const NOTICIAS: Noticia[] = [
  {
    id: 'dia-estudiante',
    titulo: 'Día del Estudiante 2026',
    descripcion: 'Afiche del Día del Estudiante 2026',
    imagen: '/news_dia_estudiante.webp',
  },
  {
    id: 'expotecnica',
    titulo: 'ExpoTécnica CTP 2026',
    descripcion: 'Afiche de la ExpoTécnica del CTP 2026',
    imagen: '/news_expotecnica.webp',
  },
  {
    id: 'feria-cientifica',
    titulo: 'Feria Científica CTP 2026',
    descripcion: 'Afiche de la Feria Científica del CTP 2026',
    imagen: '/news_feria_cientifica.webp',
  },
  {
    id: 'feria-vocacional',
    titulo: 'Feria Vocacional CTP 2026',
    descripcion: 'Afiche de la Feria Vocacional del CTP 2026',
    imagen: '/news_feria_vocacional.webp',
  },
  {
    id: 'torneo-futsal',
    titulo: 'Torneo de Futsal CTP 2026',
    descripcion: 'Afiche del Torneo de Futsal del CTP 2026',
    imagen: '/news_torneo_futsal.webp',
  },
]
