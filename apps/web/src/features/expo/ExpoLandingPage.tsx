import { useState } from 'react'
import { ExpoNavbar } from './components/ExpoNavbar'
import { HeroExpo } from './components/HeroExpo'
import { PerfilesDemoExpo } from './components/PerfilesDemoExpo'
import { ModulosExpo } from './components/ModulosExpo'
import { SimuladorCarnetExpo } from './components/SimuladorCarnetExpo'
import { ProblemaSolucionExpo } from './components/ProblemaSolucionExpo'
import { TechStackExpo } from './components/TechStackExpo'
import { FichaTecnicaExpo } from './components/FichaTecnicaExpo'
import { RubricaEvaluacionExpo } from './components/RubricaEvaluacionExpo'
import { StandQrExpo } from './components/StandQrExpo'
import { CreditosExpo } from './components/CreditosExpo'
import { ModalInstalarApp } from '@/features/pwa/ModalInstalarApp'

/**
 * Portal Público de Presentación de Expotécnica 2026 — CTP Rosario de Naranjo.
 * Carga de forma diferida (lazy chunk) incluyendo Anime.js únicamente dentro de /expo.
 */
export function ExpoLandingPage() {
  const [modalInstalarAbierto, setModalInstalarAbierto] = useState(false)

  const abrirInstalar = () => setModalInstalarAbierto(true)
  const cerrarInstalar = () => setModalInstalarAbierto(false)

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-bg text-text dark:bg-[#060B19]">
      <ExpoNavbar onAbrirInstalar={abrirInstalar} />

      <main>
        <HeroExpo onAbrirInstalar={abrirInstalar} />
        <PerfilesDemoExpo />
        <ModulosExpo />
        <SimuladorCarnetExpo />
        <ProblemaSolucionExpo />
        <TechStackExpo />
        <FichaTecnicaExpo />
        <RubricaEvaluacionExpo />
        <StandQrExpo />
      </main>

      <CreditosExpo />

      <ModalInstalarApp
        abierto={modalInstalarAbierto}
        alCerrar={cerrarInstalar}
      />
    </div>
  )
}

export default ExpoLandingPage
