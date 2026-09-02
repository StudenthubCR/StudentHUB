/**
 * El saludo del inicio. La app actual dice "¡Hola!" a toda hora; en un colegio
 * nocturno, donde el estudiante entra a las 5:50pm, "Buenas noches" es lo que
 * corresponde. Es una función pura para poder probar los cuatro tramos.
 */
export function saludoSegunHora(fecha: Date): string {
  const hora = fecha.getHours()
  if (hora < 5) return 'Buenas noches'
  if (hora < 12) return 'Buenos días'
  if (hora < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/** 'Erick Martínez' → 'Erick' */
export function primerNombre(nombre: string): string {
  return nombre.trim().split(/\s+/)[0] ?? nombre
}
