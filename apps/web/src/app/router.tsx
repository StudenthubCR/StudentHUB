import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { PaginaDeError } from './PaginaDeError'
import { PaginaNoEncontrada } from './PaginaNoEncontrada'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CarnetPage } from '@/features/carnet/CarnetPage'
import { HorariosPage } from '@/features/horarios/HorariosPage'
import { HorarioGrupoPage } from '@/features/horarios/HorarioGrupoPage'
import { ComedorPage } from '@/features/comedor/ComedorPage'
import { LoginPage } from '@/features/auth/LoginPage'

/**
 * `handle.titulo` alimenta el título del documento (ver `useTituloDeRuta`), y
 * `errorElement` se hace cargo tanto de las rutas que no existen como de
 * cualquier error de render.
 */
export const router = createBrowserRouter([
  // El login va fuera del layout a propósito: sin barra de navegación ni
  // cabecera, para que no invite a irse a otro lado a mitad del ingreso.
  { path: '/entrar', element: <LoginPage />, errorElement: <PaginaDeError /> },
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <PaginaDeError />,
    children: [
      { index: true, element: <DashboardPage />, handle: { titulo: 'Inicio' } },
      { path: 'carnet', element: <CarnetPage />, handle: { titulo: 'Carnet' } },
      // El selector de grado y el horario son dos rutas, no una sub-vista
      // escondida: así el botón de retroceso del celular funciona solo y el
      // horario de un grupo se puede compartir por enlace.
      { path: 'horarios', element: <HorariosPage />, handle: { titulo: 'Horarios' } },
      {
        path: 'horarios/:grado',
        element: <HorarioGrupoPage />,
        handle: { titulo: 'Horarios' },
      },
      { path: 'comedor', element: <ComedorPage />, handle: { titulo: 'Comedor' } },
      { path: '*', element: <PaginaNoEncontrada />, handle: { titulo: 'Página no encontrada' } },
    ],
  },
])
