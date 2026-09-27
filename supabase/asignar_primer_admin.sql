-- ==============================================================================
-- StudentHUB - Configuración del Primer Usuario Administrador y Avisos Oficiales
-- Correo Administrador: studenthub.cr@gmail.com
-- ==============================================================================

-- 1. Crear tabla de roles de usuario si no existe
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null check (role in ('admin', 'docente', 'estudiante')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Política de lectura de roles
drop policy if exists "Usuarios pueden ver su propio rol" on public.user_roles;
create policy "Usuarios pueden ver su propio rol"
  on public.user_roles
  for select
  using (auth.uid() = user_id);

-- 2. Función de verificación de Administrador (Security Definer)
-- Verifica si el usuario actual tiene permisos de administrador sin depender de inputs de cliente
create or replace function public.es_admin(usuario_id uuid default auth.uid())
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  correo_usuario text;
  tiene_rol boolean;
begin
  if usuario_id is null then
    usuario_id := auth.uid();
  end if;

  if usuario_id is null then
    return false;
  end if;

  -- Obtener correo del usuario
  select lower(email) into correo_usuario
  from auth.users
  where id = usuario_id;

  -- Correos de administración oficial
  if correo_usuario in ('studenthub.cr@gmail.com', 'erickgarciab2134@gmail.com') then
    return true;
  end if;

  -- Comprobar en tabla de roles
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = usuario_id
      and ur.role = 'admin'
  ) into tiene_rol;

  if tiene_rol then
    return true;
  end if;

  -- Comprobar en app_metadata del token JWT
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.es_admin(uuid) to anon, authenticated, service_role;

-- 3. Tabla de Avisos Oficiales (institution_alerts)
create table if not exists public.institution_alerts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  message text not null,
  category text not null check (category in ('absence', 'menu_change', 'event', 'early_departure', 'general')),
  priority text not null check (priority in ('info', 'warning', 'urgent')),
  target_type text not null check (target_type in ('all', 'specialty', 'section')),
  target_values text[] not null default '{}',
  created_by text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  active boolean not null default true
);

create index if not exists idx_institution_alerts_active_created 
  on public.institution_alerts (active, created_at desc);

create index if not exists idx_institution_alerts_target 
  on public.institution_alerts (target_type, active);

alter table public.institution_alerts enable row level security;

-- Políticas de RLS para institution_alerts:
-- Los estudiantes SOLO pueden leer avisos activos
drop policy if exists "Estudiantes y público pueden leer avisos activos" on public.institution_alerts;
create policy "Estudiantes y público pueden leer avisos activos"
  on public.institution_alerts
  for select
  using (
    active = true
    and (expires_at is null or expires_at > now())
  );

-- SOLO administradores pueden crear avisos
drop policy if exists "Solo administradores pueden crear avisos" on public.institution_alerts;
create policy "Solo administradores pueden crear avisos"
  on public.institution_alerts
  for insert
  with check (public.es_admin(auth.uid()));

-- SOLO administradores pueden actualizar avisos
drop policy if exists "Solo administradores pueden actualizar avisos" on public.institution_alerts;
create policy "Solo administradores pueden actualizar avisos"
  on public.institution_alerts
  for update
  using (public.es_admin(auth.uid()));

-- SOLO administradores pueden eliminar avisos
drop policy if exists "Solo administradores pueden eliminar avisos" on public.institution_alerts;
create policy "Solo administradores pueden eliminar avisos"
  on public.institution_alerts
  for delete
  using (public.es_admin(auth.uid()));

-- 4. Asignar rol de Administrador a studenthub.cr@gmail.com si ya existe en auth.users
do $$
declare
  admin_uid uuid;
begin
  select id into admin_uid
  from auth.users
  where lower(email) = 'studenthub.cr@gmail.com';

  if admin_uid is not null then
    -- Asignar rol en user_roles
    insert into public.user_roles (user_id, role)
    values (admin_uid, 'admin')
    on conflict (user_id, role) do nothing;

    -- Asignar app_metadata en auth.users
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin", "nombre": "Administración StudentHUB"}'::jsonb
    where id = admin_uid;

    raise notice 'Usuario studenthub.cr@gmail.com promovido a Administrador exitosamente.';
  else
    raise notice 'El usuario studenthub.cr@gmail.com aun no se ha registrado; se auto-asignara cuando inicie sesion por primera vez.';
  end if;
end;
$$;

-- 5. Trigger automático: cuando studenthub.cr@gmail.com se registre o valide OTP, se le asigna rol 'admin' de inmediato
create or replace function public.manejar_auto_asignacion_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) in ('studenthub.cr@gmail.com', 'erickgarciab2134@gmail.com') then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
  end if;
  return new;
end;
$$;

drop trigger if exists tr_auto_asignar_admin on auth.users;
create trigger tr_auto_asignar_admin
  before insert on auth.users
  for each row
  execute function public.manejar_auto_asignacion_admin();

-- 6. Insertar avisos iniciales oficiales de demostración
insert into public.institution_alerts (
  title, message, category, priority, target_type, target_values, created_by, active
) values
  (
    'Salida anticipada este viernes a las 2:00 PM',
    'Por motivo de Consejo General de Profesores y capacitación técnica, la jornada diurna finalizará a las 2:00 PM.',
    'early_departure',
    'warning',
    'all',
    '{}',
    'studenthub.cr@gmail.com',
    true
  ),
  (
    'Ausencia docente: Programación Web (Sección 11-1)',
    'El docente a cargo se encuentra en comisión oficial. La sección 11-1 tendrá horas de estudio y práctica libre en laboratorio.',
    'absence',
    'urgent',
    'section',
    array['11-1'],
    'studenthub.cr@gmail.com',
    true
  )
on conflict do nothing;
