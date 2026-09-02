/**
 * DATOS DE DEMOSTRACIÓN — no son de una persona real y no salen de ninguna
 * base de datos.
 *
 * El carnet es la única sección que muestra datos personales, y esos no viven
 * en Google Sheets ni pueden vivir ahí (plan §2 y §10). Hasta que exista
 * Supabase con RLS y el login por correo MEP, esta pantalla se arma con una
 * ficha inventada: son los mismos valores que la app actual trae escritos a
 * mano en `index.html`.
 *
 * Cuando llegue la autenticación, este archivo se borra y la ficha sale de la
 * tabla `estudiantes` filtrada por la sesión.
 */
export type Estudiante = {
  nombre: string
  /** Código interno del colegio, nunca la cédula (plan §10). */
  codigo: string
  especialidad: string
  institucion: string
  siglaInstitucion: string
  grupo: string
  nivel: string
  jornada: string
  vigencia: string
  fotoUrl: string
  activo: boolean
}

export const ESTUDIANTE_DEMO: Estudiante = {
  nombre: 'Erick Martínez',
  codigo: '2024-00123',
  especialidad: 'Informática en Desarrollo de Software',
  institucion: 'Colegio Técnico Profesional',
  siglaInstitucion: 'CTP',
  grupo: '11-2',
  nivel: 'Undécimo Año',
  jornada: 'Nocturna',
  vigencia: 'Ciclo Lectivo 2026',
  fotoUrl: '/student.webp',
  activo: true,
}
