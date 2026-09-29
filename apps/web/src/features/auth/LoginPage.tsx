import { useCallback, useEffect, useState } from 'react'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import {
  IconoCalendario,
  IconoCarnet,
  IconoComedor,
  IconoCorreo,
  IconoCandado,
  IconoEscudo,
  IconoFlechaDerecha,
  IconoDescargar,
  IconoRayo,
  IconoVolver,
} from '@/components/icons'
import { ThemeToggle } from '@/app/layout/ThemeToggle'
import { usePwaInstall } from '@/features/pwa/usePwaInstall'
import { ModalInstalarApp } from '@/features/pwa/ModalInstalarApp'
import { OtpInput } from '@/components/ui/otp-input'
import { cn } from '@/lib/cn'
import {
  LARGO_CODIGO,
  codigoCompleto,
  correoValido,
  normalizarCorreo,
  soloDigitos,
  traducirErrorAuth,
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
  const { sesion, cargando, establecerSesion } = useSesion()
  const { esModoInstalado } = usePwaInstall()
  const [modalInstalarAbierto, setModalInstalarAbierto] = useState(false)
  const location = useLocation()

  const [paso, setPaso] = useState<Paso>({ nombre: 'correo' })
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [segundos, setSegundos] = useState(0)

  // Configuración de largo de código OTP (soporta 6 u 8 dígitos según el servidor)
  const [largoOtp, setLargoOtp] = useState<number>(LARGO_CODIGO)

  // Autenticación administrativa con contraseña (evita bloqueos si Resend/OTP falla)
  const [modoAdminPassword, setModoAdminPassword] = useState(false)
  const [contrasenaAdmin, setContrasenaAdmin] = useState('')
  const [mostrarContrasena, setMostrarContrasena] = useState(false)

  const correoLimpio = normalizarCorreo(correo)
  const esCorreoAdmin = correoLimpio === 'studenthub.cr@gmail.com'

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

      const esAdmin = limpio === 'studenthub.cr@gmail.com'

      // Si no es el administrador institucional, validar obligatoriamente contra el padrón estudiantil
      if (!esAdmin) {
        try {
          const { data: estaEnPadron, error: errorRpc } = await supabase.rpc(
            'verificar_correo_padron',
            { correo_a_verificar: limpio },
          )

          if (errorRpc) {
            console.warn('RPC verificar_correo_padron no disponible:', errorRpc.message)
          }

          // Bloquear únicamente si la función RPC en Supabase confirmó explícitamente que no está en el padrón
          if (!errorRpc && estaEnPadron === false) {
            setEnviando(false)
            setError(
              'Este correo electrónico no está registrado en el padrón estudiantil. El acceso está restringido únicamente a estudiantes matriculados.',
            )
            return
          }
        } catch (err) {
          console.warn('Fallo al consultar padrón:', err)
        }
      }

      const { error: fallo } = await supabase.auth.signInWithOtp({ email: limpio })
      setEnviando(false)

      if (fallo) {
        setError(traducirErrorAuth(fallo.message))
        return
      }
      setPaso({ nombre: 'codigo', correo: limpio })
      setSegundos(60)
    },
    [correo],
  )

  const ingresarConPassword = useCallback(
    async (evento?: React.FormEvent) => {
      evento?.preventDefault()
      const destinoCorreo = paso.nombre === 'codigo' ? paso.correo : normalizarCorreo(correo || 'studenthub.cr@gmail.com')

      if (!contrasenaAdmin.trim()) {
        setError('Por favor ingresá la contraseña de administrador.')
        return
      }

      setEnviando(true)
      setError(null)

      try {
        const { data, error: fallo } = await supabase.auth.signInWithPassword({
          email: destinoCorreo,
          password: contrasenaAdmin,
        })

        if (fallo) {
          setEnviando(false)
          setError(traducirErrorAuth(fallo.message))
          return
        }

        if (data?.session) {
          establecerSesion?.(data.session)
        }

        // Navegación limpia de recarga para garantizar sincronización completa de la sesión
        const rutaDestino = (location.state as { desde?: { pathname?: string } })?.desde?.pathname || '/'
        const destinoSeguro = rutaDestino.startsWith('/') && !rutaDestino.startsWith('//') ? rutaDestino : '/'
        window.location.href = destinoSeguro
      } catch (err) {
        setEnviando(false)
        setError('Error al conectar con el servidor de autenticación.')
      }
    },
    [contrasenaAdmin, correo, establecerSesion, location.state, paso],
  )

  const verificar = useCallback(
    async (evento?: React.FormEvent, codigoDirecto?: string) => {
      evento?.preventDefault()
      if (paso.nombre !== 'codigo') return

      const tokenAUsar = soloDigitos(codigoDirecto || codigo)
      if (!codigoCompleto(tokenAUsar)) return

      setEnviando(true)
      setError(null)

      try {
        // 1. Intentar verificar con type 'email' (estándar para OTP por email en Supabase)
        let resultado = await supabase.auth.verifyOtp({
          email: paso.correo,
          token: tokenAUsar,
          type: 'email',
        })

        // 2. Si falla con error de token/inválido/expirado, intentar con 'magiclink' o 'signup'
        if (resultado.error) {
          const m = resultado.error.message.toLowerCase()
          if (m.includes('invalid') || m.includes('expired') || m.includes('token') || m.includes('otp')) {
            const intento2 = await supabase.auth.verifyOtp({
              email: paso.correo,
              token: tokenAUsar,
              type: 'magiclink',
            })
            if (!intento2.error) {
              resultado = intento2
            } else {
              const intento3 = await supabase.auth.verifyOtp({
                email: paso.correo,
                token: tokenAUsar,
                type: 'signup',
              })
              if (!intento3.error) {
                resultado = intento3
              }
            }
          }
        }

        if (resultado.error) {
          setEnviando(false)
          setError(traducirErrorAuth(resultado.error.message))
          return
        }

        // 3. Sincronizar de inmediato la sesión en el contexto de la aplicación
        if (resultado.data?.session) {
          establecerSesion?.(resultado.data.session)
        }

        // 4. Redirigir de manera atómica con recarga completa para evitar rebotes de RutaProtegida
        const rutaDestino = (location.state as { desde?: { pathname?: string } })?.desde?.pathname || '/'
        const destinoSeguro = rutaDestino.startsWith('/') && !rutaDestino.startsWith('//') ? rutaDestino : '/'
        window.location.href = destinoSeguro
      } catch (err) {
        setEnviando(false)
        setError('Error inesperado al verificar el código.')
      }
    },
    [codigo, establecerSesion, location.state, paso],
  )

  if (cargando) return null
  if (sesion) return <Navigate to="/" replace />

  return (
    <div className="relative min-h-screen bg-bg text-text antialiased">
      {/* Barra superior flotante con Logo, Botón de Instalación y selector de tema */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-3">
          <img
            src="/SHlarge.webp"
            alt="Student HUB"
            className="h-10 w-auto object-contain transition-all duration-250 dark:brightness-0 dark:invert"
          />
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Link
            to="/expo"
            className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3 py-1.5 text-etiqueta font-bold text-primary shadow-xs transition-all duration-200 hover:bg-primary-tint-strong active:scale-95"
            title="Ver portal interactivo para la Expotécnica 2026"
          >
            <IconoRayo className="size-3.5" />
            <span>Expotécnica</span>
          </Link>
          {!esModoInstalado && (
            <button
              type="button"
              onClick={() => setModalInstalarAbierto(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border border-primary/30 bg-primary-tint px-3.5 py-1.5 text-etiqueta font-bold text-primary shadow-xs transition-all duration-200 hover:bg-primary-tint-strong active:scale-95"
              title="Instalar Student HUB en tu pantalla de inicio"
            >
              <IconoDescargar className="size-3.5" />
              <span>Instalar App</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* Contenedor principal responsive */}
      <main className="mx-auto flex max-w-6xl flex-col justify-center px-5 py-6 sm:px-8 lg:py-12">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
          {/* Columna Izquierda: Bienvenida institucional y beneficios */}
          <div className={cn('flex flex-col gap-6', paso.nombre === 'codigo' ? 'hidden lg:flex' : 'flex')}>
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
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-xl elev-md sm:p-8">
            {!esModoInstalado && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary-tint/60 p-3.5 text-menuda">
                <div className="flex items-center gap-2.5 text-text">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-xs">
                    <IconoDescargar className="size-4" />
                  </span>
                  <div>
                    <p className="font-bold text-text">¿Entraste por el enlace?</p>
                    <p className="text-micro text-text-muted">Instalá la app para acceder sin internet.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalInstalarAbierto(true)}
                  className="shrink-0 cursor-pointer rounded-xl bg-primary px-3.5 py-2 text-micro font-bold text-white transition-all hover:bg-primary-dark active:scale-95 shadow-xs"
                >
                  Instalar
                </button>
              </div>
            )}

            {paso.nombre === 'correo' ? (
              <form
                onSubmit={modoAdminPassword || esCorreoAdmin ? ingresarConPassword : pedirCodigo}
                noValidate
                className="flex flex-col gap-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary-solid text-micro font-bold text-white">
                      1
                    </span>
                    <h2 className="text-titulo font-bold text-text">
                      {modoAdminPassword || esCorreoAdmin ? 'Acceso de Administrador' : 'Ingresá tu correo'}
                    </h2>
                  </div>
                  <p className="mt-1.5 text-menor text-text-muted">
                    {modoAdminPassword || esCorreoAdmin
                      ? 'Autenticación directa para la cuenta oficial de administración institucional.'
                      : 'Escribí el correo registrado en el padrón estudiantil. Te enviaremos un código de seguridad sin contraseña.'}
                  </p>
                </div>

                {(modoAdminPassword || esCorreoAdmin) && (
                  <div className="rounded-xl border border-primary/30 bg-primary-tint/60 p-3.5 text-menor text-text">
                    <div className="flex items-center gap-2 font-bold text-primary">
                      <IconoEscudo className="size-4" />
                      <span>Panel Central de Administración</span>
                    </div>
                    <p className="mt-1 text-menuda text-text-muted">
                      Ingresá con tu contraseña maestra para gestionar avisos y la plataforma sin depender del envío de correo.
                    </p>
                  </div>
                )}

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

                {(modoAdminPassword || esCorreoAdmin) && (
                  <div>
                    <div className="mb-2 flex items-center justify-between text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
                      <label htmlFor="contrasena-admin" className="flex items-center gap-1.5">
                        <IconoCandado className="size-3.5 text-primary" />
                        <span>Contraseña de Administrador</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setMostrarContrasena((v) => !v)}
                        className="text-micro font-semibold text-primary hover:underline cursor-pointer"
                      >
                        {mostrarContrasena ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                    <input
                      id="contrasena-admin"
                      type={mostrarContrasena ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={contrasenaAdmin}
                      onChange={(e) => {
                        setContrasenaAdmin(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="••••••••••••"
                      className={CAMPO}
                    />
                  </div>
                )}

                {error && (
                  <div className="animate-shake rounded-lg border border-[#c0392b]/25 bg-[#c0392b]/10 p-3 text-menor text-[#c0392b] dark:text-[#ff8a80]">
                    {error}
                  </div>
                )}

                {modoAdminPassword || esCorreoAdmin ? (
                  <div className="flex flex-col gap-3">
                    <button type="submit" disabled={enviando} className={BOTON_PRIMARIO}>
                      {enviando ? (
                        <span>Validando credenciales…</span>
                      ) : (
                        <>
                          <IconoCandado className="size-4" />
                          <span>Ingresar como Administrador</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      disabled={enviando}
                      onClick={pedirCodigo}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-menor font-semibold text-text transition-all hover:bg-surface-alt active:scale-98"
                    >
                      <IconoCorreo className="size-3.5 text-text-muted" />
                      <span>O solicitar código OTP por correo</span>
                    </button>
                  </div>
                ) : (
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
                )}

                <div className="relative my-1 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <span className="relative bg-surface px-2 text-micro font-semibold text-text-muted uppercase">
                    Opciones de acceso
                  </span>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('studenthub_demo_sesion', 'true')
                      window.location.href = '/'
                    }}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary-tint px-4 py-2.5 text-menor font-bold text-primary transition-all hover:bg-primary-tint-strong active:scale-98 shadow-xs"
                  >
                    <span>Entrar en modo demo (Sin esperar correo)</span>
                    <IconoFlechaDerecha className="size-3.5" />
                  </button>

                  {!modoAdminPassword && !esCorreoAdmin ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCorreo('studenthub.cr@gmail.com')
                        setModoAdminPassword(true)
                        setError(null)
                      }}
                      className="inline-flex items-center justify-center gap-1.5 text-center text-micro font-semibold text-primary hover:underline cursor-pointer py-1"
                    >
                      <IconoEscudo className="size-3.5" />
                      <span>Acceso Oficial Administrador (studenthub.cr@gmail.com)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setModoAdminPassword(false)
                        setCorreo('')
                        setContrasenaAdmin('')
                        setError(null)
                      }}
                      className="inline-flex items-center justify-center gap-1.5 text-center text-micro font-semibold text-text-muted hover:underline cursor-pointer py-1"
                    >
                      <IconoVolver className="size-3.5" />
                      <span>Volver al acceso para estudiantes</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-1 text-micro text-text-muted">
                  <IconoEscudo className="size-3.5 text-primary" />
                  <span>Acceso institucional protegido • Student HUB 2026</span>
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
                    Ingresá el código de verificación que enviamos a{' '}
                    <strong className="font-semibold text-text">{paso.correo}</strong>.
                  </p>
                  <p className="mt-1 text-micro text-amber-700 dark:text-amber-300">
                    💡 Si no aparece en tu bandeja principal, revisá también la carpeta de Spam o Correo no deseado.
                  </p>
                </div>

                {paso.correo === 'studenthub.cr@gmail.com' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-menor text-amber-900 dark:text-amber-200">
                    <p className="font-bold flex items-center gap-1.5">
                      <span>👑</span> ¿No te llega el código OTP a studenthub.cr@gmail.com?
                    </p>
                    <p className="mt-1 text-menuda opacity-90">
                      Podés ingresar inmediatamente utilizando la contraseña institucional de administrador.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPaso({ nombre: 'correo' })
                        setModoAdminPassword(true)
                        setCorreo('studenthub.cr@gmail.com')
                      }}
                      className="mt-2.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-micro font-bold text-white transition-all hover:bg-primary-dark shadow-xs"
                    >
                      <IconoCandado className="size-3" />
                      <span>Entrar con contraseña de Administrador</span>
                    </button>
                  </div>
                )}

                <div>
                  <div className="mb-2 flex items-center justify-between text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
                    <span className="flex items-center gap-1.5">
                      <IconoCandado className="size-3.5 text-primary" />
                      <span>Código de verificación</span>
                    </span>
                    <span className="text-micro font-semibold lowercase text-text-muted">
                      {codigo.length}/{largoOtp} dígitos
                    </span>
                  </div>
                  <div className="flex justify-center py-2">
                    <OtpInput
                      length={largoOtp}
                      value={codigo}
                      onChange={(val) => {
                        setCodigo(val)
                        if (error) setError(null)
                      }}
                      onComplete={(val) => void verificar(undefined, val)}
                      status={error ? 'error' : codigo.length === largoOtp ? 'success' : 'idle'}
                      disabled={enviando}
                      autoFocus
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-center gap-2 text-micro text-text-muted">
                    <span>¿Recibiste un código de {largoOtp === 8 ? '6' : '8'} dígitos?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLargoOtp((prev) => (prev === 8 ? 6 : 8))
                        setCodigo('')
                        setError(null)
                      }}
                      className="font-bold text-primary hover:underline cursor-pointer"
                    >
                      Cambiar a {largoOtp === 8 ? '6 casillas' : '8 casillas'}
                    </button>
                  </div>
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

      <ModalInstalarApp
        abierto={modalInstalarAbierto}
        alCerrar={() => setModalInstalarAbierto(false)}
      />
    </div>
  )
}
