-- ==============================================================================
-- StudentHUB - Protección de Padrón Estudiantil
-- ==============================================================================
-- Esta función permite verificar de forma segura (sin exponer datos personales)
-- si un correo electrónico pertenece a un estudiante activo en el padrón
-- institucional antes de permitir el login o el envío de códigos OTP.
-- ==============================================================================

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

  -- 1. Excepción para cuentas de administración / desarrollo autorizadas
  if correo_limpio in ('erickgarciab2134@gmail.com', 'studenthub.cr@gmail.com') then
    return true;
  end if;

  -- 2. Verificar existencia y estado activo en la tabla de estudiantes
  select exists (
    select 1
    from public.estudiantes e
    where lower(trim(e.correo)) = correo_limpio
      and e.estado = 'activo'
  ) into existe;

  return coalesce(existe, false);
end;
$$;

-- Otorgar permisos de ejecución tanto a usuarios anónimos (pantalla de login)
-- como autenticados.
grant execute on function public.verificar_correo_padron(text) to anon, authenticated, service_role;

comment on function public.verificar_correo_padron(text) is
  'Verifica de forma anónima y segura si un correo pertenece al padrón estudiantil activo antes de solicitar OTP.';

-- ==============================================================================
-- Limpieza de usuarios no autorizados creados en auth.users durante pruebas
-- ==============================================================================
-- Para ejecutar en el Editor SQL de Supabase si se requiere depurar:
--
-- delete from auth.users
-- where lower(trim(email)) not in ('erickgarciab2134@gmail.com', 'studenthub.cr@gmail.com')
--   and lower(trim(email)) not in (
--     select lower(trim(correo)) from public.estudiantes where estado = 'activo'
--   );
