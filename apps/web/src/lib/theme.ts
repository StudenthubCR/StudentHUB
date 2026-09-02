/**
 * Tema claro/oscuro. Mismo contrato que la app actual: atributo `data-theme`
 * en <html> y la clave 'theme' de localStorage, para que una instalación
 * existente conserve su preferencia al pasar a la app nueva.
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

export function leerTemaGuardado(): Theme {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

export function aplicarTema(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* modo privado: el tema vive sólo mientras dure la sesión */
  }
}
