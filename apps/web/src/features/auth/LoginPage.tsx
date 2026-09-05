import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import {
  IconoCalendario,
  IconoCarnet,
  IconoComedor,
  IconoCorreo,
  IconoCandado,
  IconoEscudo,
  IconoFlechaDerecha,
} from '@/components/icons'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import {
  LARGO_MAXIMO,
  codigoCompleto,
  correoValido,
  normalizarCorreo,
  soloDigitos,
} from './auth.service'
import { useSesion } from './useSesion'

const CAMPO =
  'w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-cuerpo text-text ' +
  'transition-all duration-200 placeholder:text-text-muted/60 ' +
  'focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10'

const BOTON_PRIMARIO =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary-solid ' +
  'px-5 py-3.5 text-menor font-bold text-white transition-all duration-200 ease-ui ' +
  'hover:bg-primary-dark hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] ' +
  'disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none'

type Paso = { nombre: 'correo' } | { nombre: 'codigo'; correo: string }

export function LoginPage() {
  const { sesion, cargando } = useSesion()
  const navegar = useNavigate()
  const location = useLocation()

  const [paso, setPaso] = useState<Paso>({ nombre: 'correo' })
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [segundos, setSegundos] = useState(0)

  // Cuenta atrás para reenvío de código
  useEffect(() => {
    if (segundos <= 0) return
    const t = window.setTimeout(() => setSegundos((s) => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [segundos])

  const pedirCodigo = useCallback(
    async (evento?: React.FormEvent) => {
      evento?.preventDefault()
      const limpio = normalizarCorreo(correo)
      if (!correoValido(limpio)) {
        setError('Por favor, ingresá un correo electrónico válido.')
        return
      }

      setEnviando(true)
      setError(null)
      const { error: fallo } = await supabase.auth.signInWithOtp({ email: limpio })
      setEnviando(false)

      if (fallo) {
        setError(fallo.message)
        return
      }
      setPaso({ nombre: 'codigo', correo: limpio })
      setSegundos(60)
    },
    [correo],
  )

  const verificar = useCallback(
    async (evento: React.FormEvent) => {
      evento.preventDefault()
      if (paso.nombre !== 'codigo') return

      setEnviando(true)
      setError(null)
      const { error: fallo } = await supabase.auth.verifyOtp({
        email: paso.correo,
        token: soloDigitos(codigo),
        type: 'email',
      })
      setEnviando(false)

      if (fallo) {
        setError('El código ingresado no es correcto o ya venció. Solicitá uno nuevo.')
        return
      }

      // Redirigir al destino solicitado previamente o al inicio
      const destino = (location.state as { desde?: { pathname?: string } })?.desde?.pathname || '/'
      navegar(destino, { replace: true })
    },
    [codigo, navegar, paso, location.state],
  )

  if (cargando) return null
  if (sesion) return <Navigate to="/" replace />

  return (
    <div className="relative min-h-screen bg-bg text-text antialiased">
      {/* Barra superior flotante con Logo y selector de tema */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/SHlarge.webp"
            alt="Student HUB"
            className="h-10 w-auto object-contain transition-all duration-250 dark:brightness-0 dark:invert"
          />
        </div>
        <ThemeToggle />
      </header>

      {/* Contenedor principal responsive */}
      <main className="mx-auto flex max-w-6xl flex-col justify-center px-5 py-6 sm:px-8 lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Columna Izquierda: Bienvenida institucional y beneficios */}
          <div className="flex flex-col gap-6">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-tint px-3.5 py-1 text-micro font-bold tracking-[0.09em] text-primary uppercase shadow-sm">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                Portal Estudiantil Oficial
              </span>
              <h1 className="mt-3.5 text-hero font-bold tracking-tight text-text sm:text-[2.5rem] sm:leading-[1.15]">
                Bienvenido a <span className="text-primary">Student HUB</span>
              </h1>
              <p className="mt-3 max-w-xl text-cuerpo text-text-muted sm:text-base">
                Tu plataforma centralizada para consultar tu horario escolar asignado, el menú del
                comedor y tu carnet digital institucional.
              </p>
            </div>

            {/* Tarjetas de características */}
            <div className="grid gap-3.5 sm:grid-cols-3 lg:grid-cols-1">
              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                  <IconoCalendario className="size-5" />
                </div>
                <div>
                  <h2 className="text-dato font-bold text-text">Mi Horario de Clases</h2>
                  <p className="text-menuda text-text-muted">
                    Consulta las materias, horas y docentes específicos de tu grupo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                  <IconoComedor className="size-5" />
                </div>
                <div>
                  <h2 className="text-dato font-bold text-text">Comedor Estudiantil</h2>
                  <p className="text-menuda text-text-muted">
                    Menú diario, información nutricional y estado del servicio.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-xl border border-border bg-surface/70 p-4 backdrop-blur-sm transition-all hover:border-primary/40 hover:bg-surface">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary-tint text-primary">
                  <IconoCarnet className="size-5" />
                </div>
                <div>
                  <h2 className="text-dato font-bold text-text">Carnet Digital</h2>
                  <p className="text-menuda text-text-muted">
                    Tu credencial de estudiante siempre actualizada con código QR oficial.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Tarjeta interactiva de Autenticación */}
          <div className="rounded-2xl border border-border bg-surface p-6.5 shadow-xl elev-md sm:p-8.5">
            {paso.nombre === 'correo' ? (
              <form onSubmit={pedirCodigo} noValidate className="flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-solid text-micro font-bold text-white">
                      1
                    </span>
                    <h2 className="text-titulo font-bold text-text">Ingresá tu correo</h2>
                  </div>
                  <p className="mt-1.5 text-menor text-text-muted">
                    Escribí el correo registrado en el padrón estudiantil. Te enviaremos un código de
                    seguridad sin contraseña.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="correo"
                    className="mb-2 flex items-center gap-1.5 text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase"
                  >
                    <IconoCorreo className="size-3.5 text-primary" />
                    <span>Correo electrónico</span>
                  </label>
                  <input
                    id="correo"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoFocus
                    value={correo}
                    onChange={(e) => {
                      setCorreo(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="estudiante@ejemplo.com"
                    className={CAMPO}
                  />
                </div>

                {error && (
                  <div className="animate-shake rounded-lg border border-[#c0392b]/25 bg-[#c0392b]/10 p-3 text-menor text-[#c0392b] dark:text-[#ff8a80]">
                    {error}
                  </div>
                )}

                <button type="submit" disabled={enviando} className={BOTON_PRIMARIO}>
                  {enviando ? (
                    <span>Enviando código seguro…</span>
                  ) : (
                    <>
                      <span>Continuar con mi correo</span>
                      <IconoFlechaDerecha className="size-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-1.5 pt-2 text-micro text-text-muted">
                  <IconoEscudo className="size-3.5 text-primary" />
                  <span>Acceso seguro protegido por OTP • Sin necesidad de contraseña</span>
                </div>
              </form>
            ) : (
              <form onSubmit={verificar} noValidate className="flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-solid text-micro font-bold text-white">
                      2
                    </span>
                    <h2 className="text-titulo font-bold text-text">Código de verificación</h2>
                  </div>
                  <p className="mt-1.5 text-menor text-text-muted">
                    Ingresá el código de 6 dígitos que enviamos a{' '}
                    <strong className="font-semibold text-text">{paso.correo}</strong>.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="codigo"
                    className="mb-2 flex items-center gap-1.5 text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase"
                  >
                    <IconoCandado className="size-3.5 text-primary" />
                    <span>Código de 6 dígitos</span>
                  </label>
                  <input
                    id="codigo"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    autoFocus
                    value={codigo}
                    onChange={(e) => {
                      setCodigo(soloDigitos(e.target.value))
                      if (error) setError(null)
                    }}
                    placeholder="000000"
                    maxLength={LARGO_MAXIMO}
                    className={cn(CAMPO, 'text-center text-titulo font-bold tracking-[0.35em]')}
                  />
                </div>

                {error && (
                  <div className="animate-shake rounded-lg border border-[#c0392b]/25 bg-[#c0392b]/10 p-3 text-menor text-[#c0392b] dark:text-[#ff8a80]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando || !codigoCompleto(codigo)}
                  className={BOTON_PRIMARIO}
                >
                  {enviando ? 'Validando código…' : 'Ingresar a Student HUB'}
                </button>

                <div className="flex items-center justify-between border-t border-border pt-4 text-nota">
                  <button
                    type="button"
                    onClick={() => {
                      setPaso({ nombre: 'correo' })
                      setCodigo('')
                      setError(null)
                    }}
                    className="cursor-pointer font-semibold text-primary transition-colors hover:text-primary-dark"
                  >
                    ← Cambiar correo
                  </button>

                  <button
                    type="button"
                    disabled={segundos > 0 || enviando}
                    onClick={() => void pedirCodigo()}
                    className="cursor-pointer font-semibold text-primary transition-colors hover:text-primary-dark disabled:cursor-not-allowed disabled:text-text-muted/60"
                  >
                    {segundos > 0 ? `Reenviar en ${segundos}s` : 'Reenviar código'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
