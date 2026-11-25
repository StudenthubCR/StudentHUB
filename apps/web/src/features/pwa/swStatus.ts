/**
 * Utilidades seguras para consultar el estado del Service Worker PWA en tiempo real
 * sin acoplarse a módulos virtuales de Vite en entornos de prueba Node.
 */
export async function verificarServiceWorkerActivo(): Promise<boolean> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return false
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    return Boolean(reg?.active || navigator.serviceWorker.controller)
  } catch {
    return false
  }
}
