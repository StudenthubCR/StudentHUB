import { useState } from 'react'
import { ExpoNavbar } from './components/ExpoNavbar'
import { HeroExpo } from './components/HeroExpo'
import { TechStackExpo } from './components/TechStackExpo'
import { SimuladorCarnetExpo } from './components/SimuladorCarnetExpo'
import { ProblemaSolucionExpo } from './components/ProblemaSolucionExpo'
import { ModulosExpo } from './components/ModulosExpo'
import { FichaTecnicaExpo } from './components/FichaTecnicaExpo'
import { RubricaEvaluacionExpo } from './components/RubricaEvaluacionExpo'
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
        {/* 1. Hero Principal con Guía en 3 Pasos para Jueces */}
        <HeroExpo onAbrirInstalar={() => setModalInstalarAbierto(true)} />

        {/* 2. Stack Tecnológico (Logos oficiales) */}
        <TechStackExpo />

        {/* 3. Simulador Interactivo del Carnet con Presets para Jueces */}
        <SimuladorCarnetExpo />

        {/* 4. Comparativa Problema vs Solución */}
        <ProblemaSolucionExpo />

        {/* 5. Showcase Interactivo de Módulos */}
        <ModulosExpo />

        {/* 6. Ficha Técnica de Arquitectura y Seguridad */}
        <FichaTecnicaExpo />

        {/* 7. Rúbrica Oficial de Evaluación y FAQ para Jueces */}
        <RubricaEvaluacionExpo />

        {/* 8. Sección de Escaneo en el Stand */}
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
