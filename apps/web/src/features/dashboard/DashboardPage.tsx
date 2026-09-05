import { estadoDelDia, nombreLargoDeFecha } from '@/features/comedor/menu.service'
import { useMenuSemanal } from '@/features/comedor/useMenuSemanal'
import { useEstudiante } from '@/features/estudiante/useEstudiante'
import { buscarGradoPorGrupo } from '@/features/horarios/grados'
import { useHorario } from '@/features/horarios/useHorario'
import { useReloj } from '@/lib/useReloj'
import { AlmuerzoDeHoy } from './components/AlmuerzoDeHoy'
import { CarruselNoticias } from './components/CarruselNoticias'
import { ClaseAhora } from './components/ClaseAhora'
import { RestoDelDia } from './components/RestoDelDia'
import { NOTICIAS } from './noticias.fixture'
import { primerNombre, saludoSegunHora } from './saludo'

/**
 * El inicio responde, en este orden, lo que un estudiante viene a mirar:
 * qué clase tiene ahora, qué viene después, qué hay de almuerzo y, ya de
 * último, las noticias.
 *
 * No lleva accesos directos a las secciones: los cuatro destinos ya están en
 * la barra de navegación, que en móvil está fija abajo y en escritorio es la
 * barra lateral. Repetirlos aquí ocupaba media pantalla sin agregar nada.
 */
export function DashboardPage() {
  const { estudiante } = useEstudiante()
  const ahora = useReloj()

  const grupoActivo = estudiante?.grupo ?? '11-1'
  const grado = buscarGradoPorGrupo(grupoActivo)
  const horario = useHorario(grupoActivo, ahora)
  const comedor = useMenuSemanal(ahora)

  const diaDeHoy = horario.dias.find((dia) => dia.esHoy) ?? null

  return (
    <section className="animate-fade-in">
      <header className="mb-5.5 md:mb-6.5">
        <h1 className="text-hero leading-tight font-bold tracking-[-0.03em] md:text-[2rem]">
          {saludoSegunHora(ahora)}
          {estudiante ? `, ${primerNombre(estudiante.nombre)}` : ''}
        </h1>
        <p className="mt-1 text-dato text-text-muted first-letter:uppercase md:text-base">
          {nombreLargoDeFecha(ahora)}
        </p>
      </header>

      {/* Las noticias van primero. En pantalla ancha se quedan en su propia
          columna, más angosta, para no empujar el día hacia abajo. */}
      <div className="xl:grid xl:grid-cols-[1fr_1.35fr] xl:items-start xl:gap-7.5">
        <section className="mb-7 xl:mb-0">
          <h2 className="mb-3 text-etiqueta font-bold tracking-[0.09em] text-text-muted uppercase">
            Noticias
          </h2>
          <CarruselNoticias noticias={NOTICIAS} />
        </section>

        <div>
          <ClaseAhora
            dia={diaDeHoy}
            ahora={ahora}
            cargando={horario.cargando}
            hayError={Boolean(horario.error)}
            aHorario={grado ? `/horarios/${grado.id}` : '/horarios'}
          />
          <RestoDelDia dia={diaDeHoy} ahora={ahora} />
          <AlmuerzoDeHoy
            estado={estadoDelDia(comedor.menus, ahora)}
            cargando={comedor.cargando}
            hayError={Boolean(comedor.error)}
          />
        </div>
      </div>
    </section>
  )
}
