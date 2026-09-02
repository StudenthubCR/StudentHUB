import { useCallback, useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'
import { IconoFlechaDerecha } from '@/components/icons'
import {
  LARGO_MAXIMO,
  codigoCompleto,
  correoValido,
  normalizarCorreo,
  soloDigitos,
} from './auth.service'
import { useSesion } from './useSesion'

const CAMPO =
  'w-full rounded-md border border-border bg-surface px-4 py-3 text-cuerpo text-text ' +
  'transition-colors duration-250 placeholder:text-text-muted ' +
  'focus:border-primary focus:outline-none'

const BOTON =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-primary-solid ' +
  'px-4 py-3 text-menor font-semibold text-white transition-all duration-250 ease-ui ' +
  'hover:bg-primary-dark active:scale-98 disabled:cursor-not-allowed disabled:opacity-50'

type Paso = { nombre: 'correo' } | { nombre: 'codigo'; correo: string }

export function LoginPage() {
  const { sesion, cargando } = useSesion()
  const navegar = useNavigate()

  const [paso, setPaso] = useState<Paso>({ nombre: 'correo' })
  const [correo, setCorreo] = useState('')
  const [codigo, setCodigo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [segundos, setSegundos] = useState(0)

  // Cuenta atrás para poder reenviar. Supabase limita los envíos, y sin el
  // contador la gente toca el botón otra vez y se choca con el límite.
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
        setError('Escribí un correo válido.')
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
        setError('Ese código no es correcto o ya venció. Pedí uno nuevo.')
        return
      }
      navegar('/', { replace: true })
    },
    [codigo, navegar, paso],
  )

  if (cargando) return null
  if (sesion) return <Navigate to="/" replace />

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col justify-center px-6 py-10">
      <img src="/SHlarge.webp" alt="Student HUB" className="mb-8 h-12 w-auto self-start object-contain dark:brightness-0 dark:invert" />

      {paso.nombre === 'correo' ? (
        <form onSubmit={pedirCodigo} noValidate>
          <h1 className="text-hero leading-tight font-bold tracking-[-0.03em]">Entrar</h1>
          <p className="mt-2 mb-6 text-menor text-text-muted">
            Te enviamos un código de un solo uso a tu correo institucional.
          </p>

          <label htmlFor="correo" className="mb-1.5 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
            Correo
          </label>
          <input
            id="correo"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoFocus
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="nombre.apellido@mep.go.cr"
            className={CAMPO}
          />

          {error && <p className="mt-3 text-menor text-[#c0392b] dark:text-[#ff8a80]">{error}</p>}

          <button type="submit" disabled={enviando} className={cn(BOTON, 'mt-5')}>
            {enviando ? 'Enviando…' : 'Enviarme el código'}
            {!enviando && <IconoFlechaDerecha className="size-4" />}
          </button>
        </form>
      ) : (
        <form onSubmit={verificar} noValidate>
          <h1 className="text-hero leading-tight font-bold tracking-[-0.03em]">Revisá tu correo</h1>
          <p className="mt-2 mb-6 text-menor text-text-muted">
            Mandamos un código a <strong className="text-text">{paso.correo}</strong>.
            Si no aparece, revisá la carpeta de no deseados.
          </p>

          <label htmlFor="codigo" className="mb-1.5 block text-etiqueta font-bold tracking-[0.08em] text-text-muted uppercase">
            Código
          </label>
          <input
            id="codigo"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(soloDigitos(e.target.value))}
            placeholder="000000"
            maxLength={LARGO_MAXIMO}
            className={cn(CAMPO, 'text-center text-titulo font-bold tracking-[0.3em]')}
          />

          {error && <p className="mt-3 text-menor text-[#c0392b] dark:text-[#ff8a80]">{error}</p>}

          <button type="submit" disabled={enviando || !codigoCompleto(codigo)} className={cn(BOTON, 'mt-5')}>
            {enviando ? 'Verificando…' : 'Entrar'}
          </button>

          <div className="mt-4 flex items-center justify-between text-menuda">
            <button
              type="button"
              onClick={() => {
                setPaso({ nombre: 'correo' })
                setCodigo('')
                setError(null)
              }}
              className="cursor-pointer font-semibold text-primary"
            >
              Usar otro correo
            </button>

            <button
              type="button"
              disabled={segundos > 0 || enviando}
              onClick={() => void pedirCodigo()}
              className="cursor-pointer font-semibold text-primary disabled:cursor-default disabled:text-text-muted"
            >
              {segundos > 0 ? `Reenviar en ${segundos}s` : 'Reenviar código'}
            </button>
          </div>
        </form>
      )}
    </main>
  )
}
