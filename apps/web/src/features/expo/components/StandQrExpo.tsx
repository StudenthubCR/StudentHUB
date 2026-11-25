import { useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  IconoCheck,
  IconoCodigoQR,
  IconoDispositivo,
  IconoRayo,
} from '@/components/icons'
import { useScrollRevealExpoAnime } from '../useExpoAnime'

export function StandQrExpo() {
  const seccionRef = useRef<HTMLElement>(null)
  useScrollRevealExpoAnime(seccionRef, '[data-qr-reveal]')

  const urlActual =
    typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/expo`
      : 'https://studenthub.pages.dev/expo'

  return (
    <section
      ref={seccionRef}
      id="stand-qr"
      className="border-t border-border bg-surface-alt/40 dark:bg-[#0B1224]/70 py-16 sm:py-20"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          data-qr-reveal
          className="rounded-3xl border border-border bg-surface dark:bg-[#0F172A]/90 p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        >
          <div className="md:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary-tint px-3.5 py-1 text-micro font-extrabold uppercase tracking-wider text-primary dark:border-sky-400/30 dark:bg-sky-400/10 dark:text-sky-300">
              <IconoCodigoQR className="size-3.5" />
              <span>Experiencia en Stand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-text">
              Escaneá y Probá StudentHUB en tu Teléfono
            </h2>
            <p className="text-menor sm:text-base text-text-muted leading-relaxed">
              Los jueces y visitantes de Expotécnica 2026 pueden abrir este portal directamente en
              su celular e instalar la PWA en segundos para probar el Carnet Digital, el Chatbot
              offline y Modo Docente.
            </p>
            <ul className="space-y-2 text-menuda text-text">
              <li className="flex items-start gap-2">
                <IconoCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>Diseño adaptado a móviles desde 375px con barra inferior nativa</span>
              </li>
              <li className="flex items-start gap-2">
                <IconoDispositivo className="size-4 text-primary dark:text-sky-300 shrink-0 mt-0.5" />
                <span>Compatible con Android Chrome, iOS Safari y navegadores de escritorio</span>
              </li>
              <li className="flex items-start gap-2">
                <IconoRayo className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Acceso directo a perfiles demo sin registro</span>
              </li>
            </ul>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="rounded-3xl border border-border bg-white p-5 shadow-md">
              <QRCodeSVG
                value={urlActual}
                size={184}
                level="M"
                bgColor="#FFFFFF"
                fgColor="#060B19"
                title="Código QR hacia el portal Expotécnica de StudentHUB"
              />
            </div>
            <p className="mt-3 text-center text-micro font-bold text-text-muted">
              CTP Rosario de Naranjo · Portal /expo
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
