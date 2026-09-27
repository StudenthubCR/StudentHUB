-- ==============================================================================
-- CORRECCIÓN INMEDIATA: Desvincular rol admin de cuenta de estudiante
-- Dejar ÚNICAMENTE studenthub.cr@gmail.com como Administrador
-- ==============================================================================

-- 1. Quitar rol 'admin' de la cuenta del estudiante Erick García (erickgarciab2134@gmail.com)
delete from public.user_roles
where user_id in (
  select id from auth.users where lower(email) = 'erickgarciab2134@gmail.com'
);

-- 2. Limpiar metadata de admin en auth.users para erickgarciab2134@gmail.com
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'role',
    raw_user_meta_data = raw_user_meta_data - 'role'
where lower(email) = 'erickgarciab2134@gmail.com';

-- 3. Asegurar que studenthub.cr@gmail.com SÍ tenga el rol de admin en user_roles y auth.users
do $$
declare
  admin_uid uuid;
begin
  select id into admin_uid
  from auth.users
  where lower(email) = 'studenthub.cr@gmail.com';

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

-- 4. Actualizar función de seguridad: ÚNICAMENTE studenthub.cr@gmail.com es admin
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

  select lower(email) into correo_usuario
  from auth.users
  where id = usuario_id;

  -- La cuenta del estudiante Erick NUNCA es admin
  if correo_usuario = 'erickgarciab2134@gmail.com' then
    return false;
  end if;

  -- ÚNICO correo con permisos de administración
  if correo_usuario = 'studenthub.cr@gmail.com' then
    return true;
  end if;

  -- Comprobar en tabla de roles (solo si no es erickgarciab2134@gmail.com)
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = usuario_id
      and ur.role = 'admin'
  ) into tiene_rol;

  if tiene_rol then
    return true;
  end if;

  -- Comprobar en token JWT app_metadata
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.es_admin(uuid) to anon, authenticated, service_role;

-- 5. Actualizar el trigger automático para que solo aplique a studenthub.cr@gmail.com
create or replace function public.manejar_auto_asignacion_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if lower(new.email) = 'studenthub.cr@gmail.com' then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
  end if;
  return new;
end;
$$;
