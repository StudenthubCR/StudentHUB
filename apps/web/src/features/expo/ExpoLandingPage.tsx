import { useState } from 'react'
import { ExpoNavbar } from './components/ExpoNavbar'
import { HeroExpo } from './components/HeroExpo'
import { TechStackExpo } from './components/TechStackExpo'
import { SimuladorCarnetExpo } from './components/SimuladorCarnetExpo'
import { ProblemaSolucionExpo } from './components/ProblemaSolucionExpo'
import { ModulosExpo } from './components/ModulosExpo'
import { FichaTecnicaExpo } from './components/FichaTecnicaExpo'
import { StandQrExpo } from './components/StandQrExpo'
import { CreditosExpo } from './components/CreditosExpo'
import { ModalInstalarApp } from '@/features/pwa/ModalInstalarApp'

export function ExpoLandingPage() {
  const [modalInstalarAbierto, setModalInstalarAbierto] = useState(false)

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20 selection:text-primary">
      {/* Barra de Navegación Fija */}
      <ExpoNavbar onAbrirInstalar={() => setModalInstalarAbierto(true)} />

      {/* Contenido de la Landing */}
      <main>
        {/* 1. Hero Principal */}
        <HeroExpo onAbrirInstalar={() => setModalInstalarAbierto(true)} />

        {/* 2. Stack Tecnológico (Logos oficiales) */}
        <TechStackExpo />

        {/* 3. Simulador Interactivo del Carnet */}
        <SimuladorCarnetExpo />

        {/* 3. Comparativa Problema vs Solución */}
        <ProblemaSolucionExpo />

        {/* 4. Showcase de Módulos */}
        <ModulosExpo />

        {/* 5. Ficha Técnica para Jueces y Docentes */}
        <FichaTecnicaExpo />

        {/* 6. Sección de Escaneo en el Stand */}
        <StandQrExpo onAbrirInstalar={() => setModalInstalarAbierto(true)} />
      </main>

      {/* Pie de Página y Créditos */}
      <CreditosExpo />

      {/* Modal Reutilizado de Instalación PWA */}
      <ModalInstalarApp
        abierto={modalInstalarAbierto}
        alCerrar={() => setModalInstalarAbierto(false)}
      />
    </div>
  )
}
