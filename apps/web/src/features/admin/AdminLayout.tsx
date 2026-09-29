import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './components/AdminSidebar'
import { AdminHeader } from './components/AdminHeader'
import { FloatingQuickAlert } from './components/FloatingQuickAlert'

export function AdminLayout() {
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [colapsadoEscritorio, setColapsadoEscritorio] = useState(false)

  return (
    <div className="flex min-h-screen bg-bg text-text antialiased">
      {/* 1. Sidebar Administrativo */}
      <AdminSidebar
        abiertoEnMovil={menuMovilAbierto}
        alCerrarMovil={() => setMenuMovilAbierto(false)}
        colapsadoEscritorio={colapsadoEscritorio}
        alAlternarColapso={() => setColapsadoEscritorio((prev) => !prev)}
      />

      {/* 2. Área Principal de Contenido */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminHeader alAbrirMenuMovil={() => setMenuMovilAbierto(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* 3. Botón de Acción Rápida Flotante (Alerta Urgente) */}
        <FloatingQuickAlert
          onAvisoCreado={() => {
            window.dispatchEvent(new CustomEvent('studenthub:avisos-actualizados'))
          }}
        />
      </div>
    </div>
  )
}
