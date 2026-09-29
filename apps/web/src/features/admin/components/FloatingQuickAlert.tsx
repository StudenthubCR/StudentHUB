import { useState } from 'react'
import { ModalEditarCrearAviso } from './ModalEditarCrearAviso'
import { crearAviso } from '@/features/avisos/avisos.service'
import { registrarActividad } from '../services/admin.service'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { IconoAlertaTriangulo } from '@/components/icons'
import type { NuevoAvisoPayload } from '@/features/avisos/avisos.types'

export function FloatingQuickAlert({ onAvisoCreado }: { onAvisoCreado?: () => void }) {
  const { email } = useAdminAuth()
  const [modalAbierto, setModalAbierto] = useState(false)

  const manejarGuardarAlerta = async (payload: NuevoAvisoPayload) => {
    const res = await crearAviso(payload, email)
    if (res.ok) {
      registrarActividad(
        'alerta_urgente',
        'avisos',
        `Alerta urgente emitida: "${payload.title}"`,
        email,
        `Prioridad: ${payload.priority} | Alcance: ${payload.target_type}`,
      )
      onAvisoCreado?.()
    }
    return res
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        aria-label="Lanzar alerta urgente inmediata"
        title="Lanzar Alerta Urgente Inmediata"
        className="fixed bottom-5 right-5 z-80 flex items-center gap-2.5 rounded-full border border-rose-500/40 bg-rose-600 px-4 py-3 text-menor font-black text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-rose-700 active:scale-95 sm:bottom-6 sm:right-6 min-h-[48px]"
      >
        <span className="relative flex size-3.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <IconoAlertaTriangulo className="relative size-3.5 text-white" />
        </span>
        <span className="tracking-wide">Alerta Urgente</span>
      </button>

      <ModalEditarCrearAviso
        abierto={modalAbierto}
        esAlertaUrgenteRapida={true}
        alCerrar={() => setModalAbierto(false)}
        alGuardar={manejarGuardarAlerta}
      />
    </>
  )
}
