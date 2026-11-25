import { useEffect, type RefObject } from 'react'
import { animate, createScope, createTimeline, stagger, svg } from 'animejs'

/**
 * Detecta si el usuario prefiere reducir animaciones del sistema.
 * Seguro frente a entornos SSR / Vitest sin window.
 */
export function prefiereMovimientoReducido(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return true
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Orquesta la entrada principal del Hero de /expo con Anime.js v4.5:
 * - Revela en secuencia badge, titular, tarjetas y botones con timeline escalonado.
 * - Anima trazos SVG decorativos mediante svg.createDrawable.
 * - Ejecuta contadores cinéticos en elementos con data-counter-target.
 * - Limpia 100% de instancias al desmontar usando createScope.revert() (seguro con React 19 StrictMode).
 */
export function useHeroExpoAnime(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof window === 'undefined') return

    const escribirContadoresFinales = () => {
      const nodos = root.querySelectorAll<HTMLElement>('[data-counter-target]')
      nodos.forEach((el) => {
        const target = Number(el.dataset.counterTarget ?? '0')
        const prefix = el.dataset.counterPrefix ?? ''
        const suffix = el.dataset.counterSuffix ?? ''
        el.textContent = `${prefix}${target}${suffix}`
      })
    }

    if (prefiereMovimientoReducido()) {
      escribirContadoresFinales()
      return
    }

    const scope = createScope({ root }).add(() => {
      const tl = createTimeline({
        defaults: {
          ease: 'outExpo',
          duration: 620,
        },
      })

      if (root.querySelector('[data-hero-stagger]')) {
        tl.add('[data-hero-stagger]', {
          opacity: [0.15, 1],
          translateY: [18, 0],
          delay: stagger(70),
        })
      }

      if (root.querySelector('[data-hero-card]')) {
        tl.add(
          '[data-hero-card]',
          {
            opacity: [0.2, 1],
            translateY: [16, 0],
            scale: [0.97, 1],
            delay: stagger(65),
            duration: 540,
          },
          '-=320',
        )
      }

      const drawTargets = root.querySelectorAll('.expo-draw-line')
      if (drawTargets.length > 0) {
        animate(svg.createDrawable('.expo-draw-line'), {
          draw: ['0 0', '0 1'],
          ease: 'inOutQuad',
          duration: 1300,
          delay: stagger(140),
        })
      }

      if (root.querySelector('[data-hero-orb]')) {
        animate('[data-hero-orb]', {
          translateY: [-8, 8],
          duration: 3600,
          ease: 'inOutSine',
          alternate: true,
          loop: true,
        })
      }

      const counters = root.querySelectorAll<HTMLElement>('[data-counter-target]')
      counters.forEach((el, idx) => {
        const target = Number(el.dataset.counterTarget ?? '0')
        const prefix = el.dataset.counterPrefix ?? ''
        const suffix = el.dataset.counterSuffix ?? ''
        if (!Number.isFinite(target)) return

        const state = { val: 0 }
        animate(state, {
          val: target,
          duration: 900,
          delay: 160 + idx * 90,
          ease: 'outCubic',
          modifier: (v: number) => Math.round(v),
          onUpdate: () => {
            el.textContent = `${prefix}${Math.round(state.val)}${suffix}`
          },
          onComplete: () => {
            el.textContent = `${prefix}${target}${suffix}`
          },
        })
      })
    })

    return () => {
      scope.revert()
      escribirContadoresFinales()
    }
  }, [rootRef])
}

/**
 * Dispara una entrada escalonada con Anime.js una sola vez cuando la sección
 * entra al viewport (con limpieza automática vía createScope.revert() al desmontar).
 */
export function useScrollRevealExpoAnime(
  rootRef: RefObject<HTMLElement | null>,
  selector = '[data-expo-reveal]',
  depsKey = '',
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof window === 'undefined' || prefiereMovimientoReducido()) return

    let scope: ReturnType<typeof createScope> | null = null
    let animacionEjecutada = false

    const ejecutar = () => {
      if (animacionEjecutada) return
      animacionEjecutada = true

      const objetivos = root.querySelectorAll(selector)
      if (objetivos.length === 0) return

      scope = createScope({ root }).add(() => {
        animate(selector, {
          opacity: [0.25, 1],
          translateY: [20, 0],
          scale: [0.985, 1],
          duration: 540,
          delay: stagger(55, { start: 30 }),
          ease: 'outExpo',
        })
      })
    }

    if (typeof IntersectionObserver !== 'function') {
      ejecutar()
      return () => {
        scope?.revert()
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          ejecutar()
          observer.disconnect()
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' },
    )

    observer.observe(root)

    return () => {
      observer.disconnect()
      scope?.revert()
    }
  }, [rootRef, selector, depsKey])
}

/**
 * Re-anima tarjetas visibles al cambiar de pestaña o filtro interactivo dentro de /expo.
 */
export function useFilterSwapExpoAnime(
  rootRef: RefObject<HTMLElement | null>,
  selector: string,
  triggerKey: string,
) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || typeof window === 'undefined' || prefiereMovimientoReducido()) return
    if (root.querySelectorAll(selector).length === 0) return

    const scope = createScope({ root }).add(() => {
      animate(selector, {
        opacity: [0.25, 1],
        translateY: [12, 0],
        scale: [0.98, 1],
        duration: 420,
        delay: stagger(40),
        ease: 'outQuad',
      })
    })

    return () => {
      scope.revert()
    }
  }, [rootRef, selector, triggerKey])
}
