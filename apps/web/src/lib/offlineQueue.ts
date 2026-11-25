import { supabase } from './supabase'
import {
  escribirJsonSeguro,
  leerJsonSeguro,
  registrarSincronizacion,
  resolverScopeUsuarioActivo,
} from './offlineCache'

const CLAVE_COLA_OFFLINE = 'studenthub_offline_queue_v1'
const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export type OperacionOfflineComedor = {
  id: string
  ownerId: string
  tipo: 'confirmacion_comedor'
  estudianteId: string
  fecha: string
  asistencia: boolean
  creadoEl: string
}

export type OperacionOfflinePendiente = OperacionOfflineComedor

export function leerColaOffline(ownerId?: string | null): OperacionOfflinePendiente[] {
  const todas = leerJsonSeguro<OperacionOfflinePendiente[]>(CLAVE_COLA_OFFLINE)
  if (!Array.isArray(todas)) return []
  if (!ownerId) return todas
  return todas.filter((op) => op.ownerId === ownerId)
}

export function encolarConfirmacionComedorOffline(payload: {
  estudianteId: string
  fecha: string
  asistencia: boolean
  ownerId?: string | null
}): boolean {
  const scope = resolverScopeUsuarioActivo(payload.ownerId)
  if (!scope || !payload.estudianteId || !payload.fecha) return false

  const claveNatural = `${scope}::${payload.estudianteId}::${payload.fecha}`
  const actuales = leerColaOffline().filter(
    (op) => `${op.ownerId}::${op.estudianteId}::${op.fecha}` !== claveNatural,
  )

  const nueva: OperacionOfflineComedor = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ownerId: scope,
    tipo: 'confirmacion_comedor',
    estudianteId: payload.estudianteId,
    fecha: payload.fecha,
    asistencia: payload.asistencia,
    creadoEl: new Date().toISOString(),
  }

  return escribirJsonSeguro(CLAVE_COLA_OFFLINE, [nueva, ...actuales])
}

export async function sincronizarColaOffline(ownerId?: string | null): Promise<number> {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
    return 0
  }

  const scope = resolverScopeUsuarioActivo(ownerId)
  const pendientes = leerColaOffline()
  if (pendientes.length === 0) return 0

  const restantes: OperacionOfflinePendiente[] = []
  let procesadas = 0

  for (const op of pendientes) {
    // Nunca procesar operaciones de otro propietario
    if (scope && op.ownerId !== scope) {
      restantes.push(op)
      continue
    }

    if (op.tipo === 'confirmacion_comedor') {
      if (!ES_UUID.test(op.estudianteId)) {
        procesadas++
        continue
      }
      try {
        const { error } = await supabase
          .from('confirmaciones_comedor')
          .upsert(
            {
              estudiante_id: op.estudianteId,
              fecha: op.fecha,
              asistencia: op.asistencia,
              actualizado_el: op.creadoEl,
            },
            { onConflict: 'estudiante_id,fecha' },
          )

        if (!error) {
          procesadas++
        } else {
          restantes.push(op)
        }
      } catch {
        restantes.push(op)
      }
    }
  }

  escribirJsonSeguro(CLAVE_COLA_OFFLINE, restantes)

  if (procesadas > 0) {
    registrarSincronizacion('cola_offline')
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('studenthub:confirmacion-comedor-actualizada'))
    }
  }

  return procesadas
}
