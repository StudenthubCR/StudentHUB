-- ==============================================================================
-- BLINDAJE TOTAL DE SEGURIDAD: Solo studenthub.cr@gmail.com puede publicar avisos
-- Ningún estudiante (incluyendo erickgarciab2134@gmail.com y cuentas @mep.go.cr)
-- tendrá jamás privilegios para insertar, modificar ni eliminar comunicados.
-- ==============================================================================

-- 1. Quitar cualquier rol 'admin' de todas las cuentas que NO sean studenthub.cr@gmail.com
delete from public.user_roles
where user_id in (
  select id from auth.users where lower(trim(email)) != 'studenthub.cr@gmail.com'
);

-- 2. Limpiar metadata administrativa residual en auth.users para cualquier cuenta de estudiante
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'role',
    raw_user_meta_data = raw_user_meta_data - 'role'
where lower(trim(email)) != 'studenthub.cr@gmail.com';

-- 3. Limpiar avisos de prueba creados durante desarrollo que no pertenezcan al admin oficial
delete from public.institution_alerts
where created_by != 'studenthub.cr@gmail.com';

-- 4. Asegurar rol exclusivo de Administrador ÚNICAMENTE a studenthub.cr@gmail.com
do $$
declare
  admin_uid uuid;
begin
  select id into admin_uid
  from auth.users
  where lower(trim(email)) = 'studenthub.cr@gmail.com';

  if admin_uid is not null then
    insert into public.user_roles (user_id, role)
    values (admin_uid, 'admin')
    on conflict (user_id, role) do nothing;

    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin", "nombre": "Administración StudentHUB"}'::jsonb
    where id = admin_uid;
  end if;
end;
$$;

-- 5. Función de Seguridad Inmutable en PostgreSQL (Security Definer)
-- Retorna TRUE exclusivamente si el ID autenticado pertenece a studenthub.cr@gmail.com
create or replace function public.es_admin(usuario_id uuid default auth.uid())
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  correo_usuario text;
begin
  if usuario_id is null then
    usuario_id := auth.uid();
  end if;

  if usuario_id is null then
    return false;
  end if;

  select lower(trim(email)) into correo_usuario
  from auth.users
  where id = usuario_id;

  -- REGLA ABSOLUTA: Solo studenthub.cr@gmail.com es Administrador
  return correo_usuario = 'studenthub.cr@gmail.com';
end;
$$;

grant execute on function public.es_admin(uuid) to anon, authenticated, service_role;

-- 6. Trigger de auto-asignación: aplica de forma EXCLUSIVA a studenthub.cr@gmail.com
create or replace function public.manejar_auto_asignacion_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(trim(new.email)) = 'studenthub.cr@gmail.com' then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
  else
    -- Cualquier otra cuenta queda garantizada como estudiante sin rol admin
    new.raw_app_meta_data := new.raw_app_meta_data - 'role';
    new.raw_user_meta_data := new.raw_user_meta_data - 'role';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_auto_asignar_admin on auth.users;
create trigger tr_auto_asignar_admin
  before insert on auth.users
  for each row
  execute function public.manejar_auto_asignacion_admin();

-- 7. Reasegurar políticas de RLS en institution_alerts
alter table public.institution_alerts enable row level security;

drop policy if exists "Estudiantes y público pueden leer avisos activos" on public.institution_alerts;
create policy "Estudiantes y público pueden leer avisos activos"
  on public.institution_alerts
  for select
  using (
    active = true
    and (expires_at is null or expires_at > now())
  );

drop policy if exists "Solo administradores pueden crear avisos" on public.institution_alerts;
create policy "Solo administradores pueden crear avisos"
  on public.institution_alerts
  for insert
  with check (public.es_admin(auth.uid()));

drop policy if exists "Solo administradores pueden actualizar avisos" on public.institution_alerts;
create policy "Solo administradores pueden actualizar avisos"
  on public.institution_alerts
  for update
  using (public.es_admin(auth.uid()));

drop policy if exists "Solo administradores pueden eliminar avisos" on public.institution_alerts;
create policy "Solo administradores pueden eliminar avisos"
  on public.institution_alerts
  for delete
  using (public.es_admin(auth.uid()));
