-- ==============================================================================
-- StudentHUB - Creación de Tabla de Administradores y Aprovisionamiento
-- Permite acceso directo seguro a: studenthub.cr@gmail.com
-- ==============================================================================

-- 1. Habilitar extensión pgcrypto para encriptación de contraseñas
create extension if not exists pgcrypto with schema extensions;

-- 2. Crear tabla oficial de Administradores del Sistema
create table if not exists public.administradores (
  id uuid primary key default gen_random_uuid(),
  correo text not null unique,
  nombre text not null,
  cargo text not null default 'Administrador Institucional',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.administradores enable row level security;

drop policy if exists "Cualquiera puede verificar administradores activos" on public.administradores;
create policy "Cualquiera puede verificar administradores activos"
  on public.administradores for select
  using (activo = true);

-- 3. Registrar oficialmente a studenthub.cr@gmail.com en la tabla administradores
insert into public.administradores (correo, nombre, cargo, activo)
values (
  'studenthub.cr@gmail.com',
  'Administración Central StudentHUB',
  'Super Administrador Institucional',
  true
)
on conflict (correo) do update set 
  nombre = excluded.nombre,
  cargo = excluded.cargo,
  activo = true;

-- 4. Aprovisionar usuario en auth.users con contraseña fija para evitar bloqueos de correo/OTP
do $$
declare
  admin_uid uuid;
  contrasena_hash text;
begin
  -- Contraseña oficial de administración: StudentHub2026*
  contrasena_hash := extensions.crypt('StudentHub2026*', extensions.gen_salt('bf'));

  select id into admin_uid
  from auth.users
  where lower(trim(email)) = 'studenthub.cr@gmail.com';

  if admin_uid is not null then
    -- Si ya existe, actualizar contraseña, confirmar correo y rol
    update auth.users
    set encrypted_password = contrasena_hash,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"nombre": "Administración StudentHUB", "role": "admin"}'::jsonb,
        updated_at = now()
    where id = admin_uid;

    raise notice 'Usuario studenthub.cr@gmail.com actualizado con contraseña y rol admin.';
  else
    -- Si no existe en auth.users, crearlo directamente
    admin_uid := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at
    ) values (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'studenthub.cr@gmail.com',
      contrasena_hash,
      now(),
      '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
      '{"nombre": "Administración StudentHUB", "role": "admin"}'::jsonb,
      'authenticated',
      'authenticated',
      now(),
      now()
    );

    -- Identidad de email para que Supabase Auth reconozca el login por contraseña
    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      admin_uid,
      admin_uid,
      json_build_object('sub', admin_uid::text, 'email', 'studenthub.cr@gmail.com'),
      'email',
      now(),
      now(),
      now()
    )
    on conflict (provider, id) do nothing;

    raise notice 'Usuario studenthub.cr@gmail.com creado en auth.users con éxito.';
  end if;

  -- 5. Vincular a user_roles
  insert into public.user_roles (user_id, role)
  values (admin_uid, 'admin')
  on conflict (user_id, role) do nothing;
end;
$$;

-- 6. Actualizar verificar_correo_padron para que valide tanto estudiantes como administradores
create or replace function public.verificar_correo_padron(correo_a_verificar text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  correo_limpio text;
  existe boolean;
begin
  if correo_a_verificar is null or trim(correo_a_verificar) = '' then
    return false;
  end if;

  correo_limpio := lower(trim(correo_a_verificar));

  -- A. Verificar si es un Administrador en la tabla public.administradores
  select exists (
    select 1
    from public.administradores a
    where lower(trim(a.correo)) = correo_limpio
      and a.activo = true
  ) into existe;

  if existe then
    return true;
  end if;

  -- B. Verificar si es un Estudiante en la tabla public.estudiantes
  select exists (
    select 1
    from public.estudiantes e
    where lower(trim(e.correo)) = correo_limpio
      and e.estado = 'activo'
  ) into existe;

  return coalesce(existe, false);
end;
$$;

grant execute on function public.verificar_correo_padron(text) to anon, authenticated, service_role;

-- 7. Función de Seguridad Inmutable en PostgreSQL
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
