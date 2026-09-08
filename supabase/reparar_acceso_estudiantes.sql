-- =============================================================================
-- StudentHUB: Reparación y Activación de Acceso para Estudiantes
-- Casos reportados: estebanoses861@gmail.com y ethanmurillo05@gmail.com
-- =============================================================================
-- Ejecutá este script completo en el SQL Editor de tu proyecto en Supabase.
-- =============================================================================

-- 1. Asegurar la Institución CTP
insert into public.instituciones (nombre, slug, dominio_correo, activa)
values ('Colegio Técnico Profesional', 'ctp', 'gmail.com', true)
on conflict (slug) do update set activa = true;

-- 2. Asegurar el grupo 10-1 de Gestión de la Producción
insert into public.grupos (institucion_id, codigo, nivel, jornada)
select id, '10-1', '10mo', 'Diurna'
from public.instituciones
where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

-- 3. Insertar o actualizar a Ethan Murillo y Esteban Oses en la tabla estudiantes
-- Ethan Murillo
insert into public.estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208700466', 'ethanmurillo05@gmail.com', 'Ethan Joshue Murillo Morera', 'Gestión de la Producción', g.id, 'activo'
from public.instituciones i
join public.grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id,
  estado = 'activo';

-- Esteban Oses
insert into public.estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208920002', 'estebanoses861@gmail.com', 'Daniel Esteban Oses Valenciano', 'Gestión de la Producción', g.id, 'activo'
from public.instituciones i
join public.grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id,
  estado = 'activo';

-- 4. Crear el Trigger para vincular automáticamente auth.users con public.estudiantes
create or replace function public.vincular_estudiante_con_usuario()
returns trigger language plpgsql security definer as $$
begin
  update public.estudiantes
  set user_id = new.id
  where lower(trim(correo)) = lower(trim(new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.vincular_estudiante_con_usuario();

-- 5. Vincular de inmediato si ya habían solicitado código o creado cuenta antes
update public.estudiantes e
set user_id = u.id
from auth.users u
where lower(trim(e.correo)) = lower(trim(u.email));

-- 6. Crear/Actualizar la función de verificación de padrón para el login
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

  -- Cuentas autorizadas de desarrollo y administración
  if correo_limpio in ('erickgarciab2134@gmail.com', 'studenthub.cr@gmail.com') then
    return true;
  end if;

  -- Comprobar si existe como estudiante activo en el padrón
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

-- 7. Consulta de Diagnóstico Final: muestra el estado de ambos usuarios
select 
  lista.correo,
  case when u.id is not null then '✅ Registrado (' || u.id::text || ')' else '⏳ Sin cuenta creada aún' end as estado_auth_users,
  case when e.id is not null then '✅ En padrón (' || e.nombre || ')' else '❌ No existe en estudiantes' end as estado_estudiante,
  case when e.user_id is not null then '✅ Vinculado correctamente' else '⚠️ user_id sin vincular' end as vinculo_sesion,
  g.codigo as seccion,
  e.especialidad
from (
  values 
    ('estebanoses861@gmail.com'),
    ('ethanmurillo05@gmail.com')
) as lista(correo)
left join auth.users u on lower(trim(u.email)) = lower(trim(lista.correo))
left join public.estudiantes e on lower(trim(e.correo)) = lower(trim(lista.correo))
left join public.grupos g on g.id = e.grupo_id;
