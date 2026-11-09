import { lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppLayout } from './layout/AppLayout'
import { PaginaDeError } from './PaginaDeError'
import { PaginaNoEncontrada } from './PaginaNoEncontrada'
import { RutaProtegida } from '@/features/auth/RutaProtegida'
import { AdminLayout, AdminRutaProtegida } from '@/features/admin'

function CargandoRuta() {
  return (
    <div
      className="flex min-h-[50vh] w-full flex-col items-center justify-center p-8 animate-fade-in"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      <div className="flex flex-col items-center gap-3">
        <div className="size-10 rounded-full border-3 border-primary/20 border-t-primary animate-spin" />
        <span className="text-menor font-medium text-text-muted">Cargando...</span>
      </div>
    </div>
  )
}

function conSuspense(Componente: ComponentType) {
  return (
    <Suspense fallback={<CargandoRuta />}>
      <Componente />
    </Suspense>
  )
}

// Carga perezosa (Code-Splitting) para aligerar el bundle inicial de Student HUB
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const CarnetPage = lazy(() => import('@/features/carnet/CarnetPage').then((m) => ({ default: m.CarnetPage })))
const AgendaPage = lazy(() => import('@/features/agenda/AgendaPage').then((m) => ({ default: m.AgendaPage })))
const HorariosPage = lazy(() => import('@/features/horarios/HorariosPage').then((m) => ({ default: m.HorariosPage })))
const HorarioGrupoPage = lazy(() => import('@/features/horarios/HorarioGrupoPage').then((m) => ({ default: m.HorarioGrupoPage })))
const ComedorPage = lazy(() => import('@/features/comedor/ComedorPage').then((m) => ({ default: m.ComedorPage })))
const AvisosPage = lazy(() => import('@/features/avisos/AvisosPage').then((m) => ({ default: m.AvisosPage })))
const LoginPage = lazy(() => import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const ExpoLandingPage = lazy(() => import('@/features/expo/ExpoLandingPage').then((m) => ({ default: m.ExpoLandingPage })))

const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })))
const AdminAvisosPage = lazy(() => import('@/features/admin/pages/AdminAvisosPage').then((m) => ({ default: m.AdminAvisosPage })))
const AdminNoticiasPage = lazy(() => import('@/features/admin/pages/AdminNoticiasPage').then((m) => ({ default: m.AdminNoticiasPage })))
const AdminEstudiantesPage = lazy(() => import('@/features/admin/pages/AdminEstudiantesPage').then((m) => ({ default: m.AdminEstudiantesPage })))
const AdminAuditoriaPage = lazy(() => import('@/features/admin/pages/AdminAuditoriaPage').then((m) => ({ default: m.AdminAuditoriaPage })))
const AdminForbiddenPage = lazy(() => import('@/features/admin/pages/AdminForbiddenPage').then((m) => ({ default: m.AdminForbiddenPage })))

/**
 * `handle.titulo` alimenta el título del documento (ver `useTituloDeRuta`), y
 * `errorElement` se hace cargo tanto de las rutas que no existen como de
 * cualquier error de render.
 */
export const router = createBrowserRouter([
  // Panel de Control Administrativo (RBAC: Solo Administradores)
  {
    path: '/admin',
    element: (
      <AdminRutaProtegida>
        <AdminLayout />
      </AdminRutaProtegida>
    ),
    errorElement: <PaginaDeError />,
    children: [
      { index: true, element: conSuspense(AdminDashboardPage), handle: { titulo: 'Panel de Control · Student HUB' } },
      { path: 'avisos', element: conSuspense(AdminAvisosPage), handle: { titulo: 'Gestor de Avisos · Admin' } },
      { path: 'noticias', element: conSuspense(AdminNoticiasPage), handle: { titulo: 'Gestor de Noticias · Admin' } },
      { path: 'estudiantes', element: conSuspense(AdminEstudiantesPage), handle: { titulo: 'Directorio Estudiantil · Admin' } },
      { path: 'auditoria', element: conSuspense(AdminAuditoriaPage), handle: { titulo: 'Registro de Auditoría · Admin' } },
    ],
  },
  {
    path: '/admin/403',
    element: conSuspense(AdminForbiddenPage),
    handle: { titulo: '403 Acceso Denegado · Student HUB' },
    errorElement: <PaginaDeError />,
  },
  // Portal público de la Expotécnica
  {
    path: '/expo',
    element: conSuspense(ExpoLandingPage),
    handle: { titulo: 'Expotécnica 2026 · Student HUB' },
    errorElement: <PaginaDeError />,
  },
  {
    path: '/landing',
    element: <Navigate to="/expo" replace />,
  },
  // El login va fuera del layout a propósito: sin barra de navegación ni
  // cabecera, para que no invite a irse a otro lado a mitad del ingreso.
  { path: '/entrar', element: conSuspense(LoginPage), errorElement: <PaginaDeError /> },
  {
    path: '/',
    element: (
      <RutaProtegida>
        <AppLayout />
      </RutaProtegida>
    ),
    errorElement: <PaginaDeError />,
    children: [
      { index: true, element: conSuspense(DashboardPage), handle: { titulo: 'Inicio' } },
      { path: 'agenda', element: conSuspense(AgendaPage), handle: { titulo: 'Agenda' } },
      { path: 'carnet', element: conSuspense(CarnetPage), handle: { titulo: 'Carnet' } },
      { path: 'horarios', element: conSuspense(HorariosPage), handle: { titulo: 'Horarios' } },
      {
        path: 'horarios/:grado',
        element: conSuspense(HorarioGrupoPage),
        handle: { titulo: 'Horario del Grado' },
      },
      { path: 'comedor', element: conSuspense(ComedorPage), handle: { titulo: 'Comedor' } },
      { path: 'avisos', element: conSuspense(AvisosPage), handle: { titulo: 'Avisos Oficiales' } },
      { path: '*', element: <PaginaNoEncontrada />, handle: { titulo: 'Página no encontrada' } },
    ],
  },
])
