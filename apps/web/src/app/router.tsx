import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { PaginaDeError } from './PaginaDeError'
import { PaginaNoEncontrada } from './PaginaNoEncontrada'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { CarnetPage } from '@/features/carnet/CarnetPage'
import { HorariosPage } from '@/features/horarios/HorariosPage'
import { ComedorPage } from '@/features/comedor/ComedorPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RutaProtegida } from '@/features/auth/RutaProtegida'

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
    element: (
      <RutaProtegida>
        <AppLayout />
      </RutaProtegida>
    ),
    errorElement: <PaginaDeError />,
    children: [
      { index: true, element: <DashboardPage />, handle: { titulo: 'Inicio' } },
      { path: 'carnet', element: <CarnetPage />, handle: { titulo: 'Carnet' } },
      { path: 'horarios', element: <HorariosPage />, handle: { titulo: 'Horarios' } },
      {
        path: 'horarios/:grado',
        element: <Navigate to="/horarios" replace />,
      },
      { path: 'comedor', element: <ComedorPage />, handle: { titulo: 'Comedor' } },
      { path: '*', element: <PaginaNoEncontrada />, handle: { titulo: 'Página no encontrada' } },
    ],
  },
])
