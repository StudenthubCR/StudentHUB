-- ==============================================================================
-- STUDENT HUB — CTP SAN RAFAEL DE ALAJUELA
-- MIGRACIÓN MAESTRA UNIFICADA DEL BACKEND EN SUPABASE (POSTGRESQL)
-- ==============================================================================
-- Archivo: setup_completo_studenthub.sql
-- Propósito: Despliegue integral, consolidado e idempotente de todo el modelo
--            relacional, seguridad RLS, funciones, triggers, publicaciones
--            Realtime y datos semilla para Student HUB.
--
-- Normativa Legal y Privacidad:
--   - Ley N° 8968 (Protección de la Persona frente al Tratamiento de sus Datos
--     Personales / PRODHAB Costa Rica).
--   - Directrices oficiales de evaluación y asistencia del MEP.
--   - Autenticación Passwordless (OTP vía Supabase Auth + Resend).
--   - Row Level Security (RLS) mandatorio en el 100% de las tablas públicas.
-- ==============================================================================
-- Instrucciones de Ejecución:
--   1. Iniciar sesión en https://supabase.com/dashboard/project/<tu-proyecto>
--   2. Ir a "SQL Editor" en el menú lateral izquierdo.
--   3. Crear una nueva consulta ("New Query").
--   4. Pegar el contenido COMPLETO de este archivo y presionar "Run" (Ctrl + Enter).
-- ==============================================================================

-- ==============================================================================
-- SECCIÓN 1: EXTENSIONES POSTGRESQL
-- ==============================================================================
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;


-- ==============================================================================
-- SECCIÓN 2: TABLAS FUNDACIONALES DEL PADRÓN INSTITUCIONAL
-- ==============================================================================

-- 2.1 Instituciones Educativas (Colegios Técnicos)
create table if not exists public.instituciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  dominio_correo text not null default 'gmail.com',
  activa boolean not null default true,
  creado_el timestamptz not null default now()
);

-- 2.2 Secciones / Grupos Académicos
create table if not exists public.grupos (
  id uuid primary key default gen_random_uuid(),
  institucion_id uuid not null references public.instituciones(id) on delete cascade,
  codigo text not null, -- Ej: '10-1', '11-1', '12-3'
  nivel text not null,  -- Ej: '10mo', '11mo', '12vo'
  jornada text not null default 'Diurna', -- 'Diurna' o 'Nocturna'
  creado_el timestamptz not null default now(),
  constraint grupos_institucion_codigo_unique unique (institucion_id, codigo)
);

-- 2.3 Padrón Oficial de Estudiantes
create table if not exists public.estudiantes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  institucion_id uuid not null references public.instituciones(id) on delete cascade,
  grupo_id uuid not null references public.grupos(id) on delete restrict,
  codigo text not null, -- Cédula / Carnet oficial
  correo text not null unique, -- Correo institucional o personal autorizado
  nombre text not null,
  especialidad text not null,
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'egresado')),
  foto_url text,
  creado_el timestamptz not null default now(),
  constraint estudiantes_institucion_codigo_unique unique (institucion_id, codigo)
);

-- Asegurar columnas si la tabla ya existía previamente con esquema antiguo
alter table public.estudiantes add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table public.estudiantes add column if not exists estado text not null default 'activo';
alter table public.estudiantes add column if not exists foto_url text;


-- ==============================================================================
-- SECCIÓN 3: GESTIÓN ADMINISTRATIVA Y CONTROL DE ROLES
-- ==============================================================================

-- 3.1 Directorio de Administradores Autorizados
create table if not exists public.administradores (
  id uuid primary key default gen_random_uuid(),
  correo text not null unique,
  nombre text not null,
  cargo text not null default 'Administrador Institucional',
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

-- 3.2 Asignación de Roles de Seguridad
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'docente', 'estudiante')),
  created_at timestamptz not null default now(),
  constraint user_roles_user_role_unique unique (user_id, role)
);


-- ==============================================================================
-- SECCIÓN 4: COMUNICADOS INSTITUCIONALES Y COMEDOR ESCOLAR
-- ==============================================================================

-- 4.1 Avisos y Comunicados Oficiales (Institution Alerts)
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

-- 4.2 Registro Diario de Asistencia al Comedor Institucional
create table if not exists public.confirmaciones_comedor (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  fecha date not null default current_date,
  asistencia boolean not null default true,
  actualizado_el timestamptz not null default now(),
  constraint confirmaciones_comedor_estudiante_fecha_unique unique (estudiante_id, fecha)
);


-- ==============================================================================
-- SECCIÓN 5: EXPEDIENTE ACADÉMICO OFICIAL MEP (CALIFICACIONES & ASISTENCIAS)
-- ==============================================================================

-- 5.1 Calificaciones Oficiales bajo Rúbrica de Evaluación MEP
create table if not exists public.notas (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  periodo text not null check (periodo in ('I Periodo', 'II Periodo', 'III Periodo', 'Anual')),
  materia text not null,
  docente text,
  nota_final numeric(5,2) not null check (nota_final >= 0 and nota_final <= 100),
  trabajo_cotidiano numeric(5,2) not null default 0 check (trabajo_cotidiano >= 0 and trabajo_cotidiano <= 100),
  tareas numeric(5,2) not null default 0 check (tareas >= 0 and tareas <= 100),
  pruebas numeric(5,2) not null default 0 check (pruebas >= 0 and pruebas <= 100),
  proyecto numeric(5,2) not null default 0 check (proyecto >= 0 and proyecto <= 100),
  asistencia numeric(5,2) not null default 0 check (asistencia >= 0 and asistencia <= 100),
  observaciones text,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);

-- 5.2 Control Cronológico de Asistencia a Lecciones
create table if not exists public.asistencias (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  fecha date not null,
  periodo text not null check (periodo in ('I Periodo', 'II Periodo', 'III Periodo')),
  materia text not null,
  bloque text not null,
  estado text not null check (estado in ('presente', 'ausencia_injustificada', 'ausencia_justificada', 'tardia')),
  justificacion text,
  creado_el timestamptz not null default now()
);


-- ==============================================================================
-- SECCIÓN 6: VÍNCULOS FAMILIARES Y ENCARGADOS LEGALES
-- ==============================================================================

-- 6.1 Registro de Encargados Legales (Madres, Padres y Tutores)
create table if not exists public.encargados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  correo text not null unique,
  nombre_completo text not null,
  cedula text,
  telefono text,
  parentesco_por_defecto text default 'Encargado Legal',
  activo boolean not null default true,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);

-- 6.2 Tabla Intermedia M:N Encargado - Estudiante
create table if not exists public.encargado_estudiante (
  id uuid primary key default gen_random_uuid(),
  encargado_id uuid not null references public.encargados(id) on delete cascade,
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  parentesco text,
  es_principal boolean not null default true,
  activo boolean not null default true,
  creado_el timestamptz not null default now(),
  constraint encargado_estudiante_unique unique (encargado_id, estudiante_id)
);


-- ==============================================================================
-- SECCIÓN 7: ÍNDICES DE ALTO RENDIMIENTO (PERFORMANCE INDEXING)
-- ==============================================================================

-- Llaves foráneas y búsquedas frecuentes (previene Table Locks y Sequential Scans)
create index if not exists idx_grupos_institucion on public.grupos(institucion_id);

create index if not exists idx_estudiantes_user_id on public.estudiantes(user_id);
create index if not exists idx_estudiantes_institucion on public.estudiantes(institucion_id);
create index if not exists idx_estudiantes_grupo on public.estudiantes(grupo_id);
create index if not exists idx_estudiantes_correo_lower on public.estudiantes(lower(trim(correo)));

create index if not exists idx_administradores_correo_lower on public.administradores(lower(trim(correo)));
create index if not exists idx_user_roles_user_id on public.user_roles(user_id);

create index if not exists idx_institution_alerts_active_created on public.institution_alerts(active, created_at desc);
create index if not exists idx_institution_alerts_target on public.institution_alerts(target_type, active);

create index if not exists idx_confirmaciones_comedor_estudiante on public.confirmaciones_comedor(estudiante_id);
create index if not exists idx_confirmaciones_comedor_fecha on public.confirmaciones_comedor(fecha);
create index if not exists idx_confirmaciones_comedor_fecha_asistencia on public.confirmaciones_comedor(fecha, asistencia);

create index if not exists idx_notas_estudiante_periodo on public.notas(estudiante_id, periodo);
create index if not exists idx_notas_estudiante on public.notas(estudiante_id);

create index if not exists idx_asistencias_estudiante_fecha on public.asistencias(estudiante_id, fecha desc);
create index if not exists idx_asistencias_estudiante_periodo on public.asistencias(estudiante_id, periodo);

create index if not exists idx_encargados_user_id on public.encargados(user_id);
create index if not exists idx_encargados_correo_lower on public.encargados(lower(trim(correo)));
create index if not exists idx_encargado_estudiante_encargado on public.encargado_estudiante(encargado_id);
create index if not exists idx_encargado_estudiante_estudiante on public.encargado_estudiante(estudiante_id);
create index if not exists idx_encargado_estudiante_activos on public.encargado_estudiante(encargado_id, estudiante_id) where activo = true;


-- ==============================================================================
-- SECCIÓN 8: FUNCIONES DE SEGURIDAD DEFINER Y TRIGGERS AUTOMÁTICOS
-- ==============================================================================

-- 8.1 Función Inmutable: Verificación de Rol Administrador
create or replace function public.es_admin(usuario_id uuid default auth.uid())
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
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

  select lower(trim(email)) into correo_usuario
  from auth.users
  where id = usuario_id;

  -- Regla primaria: Correo oficial del CTP
  if correo_usuario = 'studenthub.cr@gmail.com' then
    return true;
  end if;

  -- Comprobar si está activo en la tabla administradores
  select exists (
    select 1 from public.administradores a
    where lower(trim(a.correo)) = correo_usuario
      and a.activo = true
  ) into tiene_rol;

  if tiene_rol then
    return true;
  end if;

  -- Comprobar rol en metadata JWT o user_roles
  if coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' then
    return true;
  end if;

  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = usuario_id
      and ur.role = 'admin'
  ) into tiene_rol;

  return coalesce(tiene_rol, false);
end;
$$;

grant execute on function public.es_admin(uuid) to anon, authenticated, service_role;

-- 8.2 Función RPC: Validación de Padrón antes de emisión OTP
create or replace function public.verificar_correo_padron(correo_a_verificar text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  correo_limpio text;
  existe boolean;
begin
  if correo_a_verificar is null or trim(correo_a_verificar) = '' then
    return false;
  end if;

  correo_limpio := lower(trim(correo_a_verificar));

  -- Cuentas autorizadas de desarrollo / superadministración
  if correo_limpio in ('studenthub.cr@gmail.com', 'erickgarciab2134@gmail.com') then
    return true;
  end if;

  -- A. Verificar si es Administrador activo
  select exists (
    select 1 from public.administradores a
    where lower(trim(a.correo)) = correo_limpio and a.activo = true
  ) into existe;

  if existe then
    return true;
  end if;

  -- B. Verificar si es Estudiante activo en el padrón
  select exists (
    select 1 from public.estudiantes e
    where lower(trim(e.correo)) = correo_limpio and e.estado = 'activo'
  ) into existe;

  if existe then
    return true;
  end if;

  -- C. Verificar si es Encargado legal activo
  select exists (
    select 1 from public.encargados enc
    where lower(trim(enc.correo)) = correo_limpio and enc.activo = true
  ) into existe;

  return coalesce(existe, false);
end;
$$;

grant execute on function public.verificar_correo_padron(text) to anon, authenticated, service_role;

-- 8.3 Trigger: Sincronización automática de user_id en public.estudiantes
create or replace function public.sincronizar_usuario_con_estudiante()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.estudiantes
  set user_id = new.id
  where lower(trim(correo)) = lower(trim(new.email))
    and (user_id is null or user_id != new.id);
  return new;
end;
$$;

drop trigger if exists trg_sincronizar_usuario_estudiante on auth.users;
create trigger trg_sincronizar_usuario_estudiante
after insert or update of email on auth.users
for each row execute function public.sincronizar_usuario_con_estudiante();

-- 8.4 Trigger: Sincronización automática de user_id en public.encargados
create or replace function public.vincular_encargado_con_usuario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.encargados
  set user_id = new.id
  where lower(trim(correo)) = lower(trim(new.email))
    and (user_id is null or user_id != new.id);
  return new;
end;
$$;

drop trigger if exists trg_vincular_encargado_usuario on auth.users;
create trigger trg_vincular_encargado_usuario
after insert or update of email on auth.users
for each row execute function public.vincular_encargado_con_usuario();

-- 8.5 Trigger: Blindaje de rol admin exclusivo en auth.users
create or replace function public.manejar_auto_asignacion_admin()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if lower(trim(new.email)) = 'studenthub.cr@gmail.com' then
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) || '{"role": "admin", "nombre": "Administración StudentHUB"}'::jsonb;
  else
    new.raw_app_meta_data := coalesce(new.raw_app_meta_data, '{}'::jsonb) - 'role';
    new.raw_user_meta_data := coalesce(new.raw_user_meta_data, '{}'::jsonb) - 'role';
  end if;
  return new;
end;
$$;

drop trigger if exists tr_auto_asignar_admin on auth.users;
create trigger tr_auto_asignar_admin
before insert on auth.users
for each row execute function public.manejar_auto_asignacion_admin();

-- 8.6 Trigger: Actualización de marca de tiempo (actualizado_el)
create or replace function public.actualizar_timestamp_registro()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  new.actualizado_el = now();
  return new;
end;
$$;

drop trigger if exists trg_actualizar_timestamp_confirmacion on public.confirmaciones_comedor;
create trigger trg_actualizar_timestamp_confirmacion
before update on public.confirmaciones_comedor
for each row execute function public.actualizar_timestamp_registro();

drop trigger if exists trg_actualizar_timestamp_encargados on public.encargados;
create trigger trg_actualizar_timestamp_encargados
before update on public.encargados
for each row execute function public.actualizar_timestamp_registro();

drop trigger if exists trg_actualizar_timestamp_notas on public.notas;
create trigger trg_actualizar_timestamp_notas
before update on public.notas
for each row execute function public.actualizar_timestamp_registro();


-- ==============================================================================
-- SECCIÓN 9: ROW LEVEL SECURITY (RLS) OPTIMIZADO Y BLINDADO
-- ==============================================================================

-- 9.1 Instituciones
alter table public.instituciones enable row level security;

drop policy if exists "Lectura publica de instituciones" on public.instituciones;
create policy "Lectura publica de instituciones"
  on public.instituciones for select
  to authenticated, anon
  using (true);

drop policy if exists "Solo administradores modifican instituciones" on public.instituciones;
create policy "Solo administradores modifican instituciones"
  on public.instituciones for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.2 Grupos
alter table public.grupos enable row level security;

drop policy if exists "Lectura publica de grupos" on public.grupos;
create policy "Lectura publica de grupos"
  on public.grupos for select
  to authenticated, anon
  using (true);

drop policy if exists "Solo administradores modifican grupos" on public.grupos;
create policy "Solo administradores modifican grupos"
  on public.grupos for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.3 Estudiantes
alter table public.estudiantes enable row level security;

drop policy if exists "Estudiantes y familias leen su perfil" on public.estudiantes;
create policy "Estudiantes y familias leen su perfil"
  on public.estudiantes for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or lower(trim(correo)) = lower(trim((select auth.jwt() ->> 'email')))
    or id in (
      select ee.estudiante_id from public.encargado_estudiante ee
      join public.encargados enc on enc.id = ee.encargado_id
      where (enc.user_id = (select auth.uid()) or lower(trim(enc.correo)) = lower(trim((select auth.jwt() ->> 'email'))))
        and ee.activo = true and enc.activo = true
    )
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Solo administradores gestionan estudiantes" on public.estudiantes;
create policy "Solo administradores gestionan estudiantes"
  on public.estudiantes for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.4 Administradores
alter table public.administradores enable row level security;

drop policy if exists "Lectura de administradores activos" on public.administradores;
create policy "Lectura de administradores activos"
  on public.administradores for select
  to authenticated, anon
  using (activo = true);

drop policy if exists "Solo administradores gestionan directorio administrativo" on public.administradores;
create policy "Solo administradores gestionan directorio administrativo"
  on public.administradores for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.5 User Roles
alter table public.user_roles enable row level security;

drop policy if exists "Usuarios consultan su propio rol" on public.user_roles;
create policy "Usuarios consultan su propio rol"
  on public.user_roles for select
  to authenticated
  using (user_id = (select auth.uid()) or public.es_admin((select auth.uid())));

drop policy if exists "Solo administradores gestionan roles" on public.user_roles;
create policy "Solo administradores gestionan roles"
  on public.user_roles for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.6 Avisos Oficiales (institution_alerts)
alter table public.institution_alerts enable row level security;

drop policy if exists "Lectura publica de avisos activos y vigentes" on public.institution_alerts;
create policy "Lectura publica de avisos activos y vigentes"
  on public.institution_alerts for select
  to authenticated, anon
  using (active = true and (expires_at is null or expires_at > now()));

drop policy if exists "Solo administradores gestionan avisos" on public.institution_alerts;
create policy "Solo administradores gestionan avisos"
  on public.institution_alerts for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.7 Confirmaciones de Comedor
alter table public.confirmaciones_comedor enable row level security;

drop policy if exists "Estudiantes y familias leen sus confirmaciones" on public.confirmaciones_comedor;
create policy "Estudiantes y familias leen sus confirmaciones"
  on public.confirmaciones_comedor for select
  to authenticated
  using (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim((select auth.jwt() ->> 'email')))
    )
    or estudiante_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Estudiantes y familias confirman asistencia comedor" on public.confirmaciones_comedor;
create policy "Estudiantes y familias confirman asistencia comedor"
  on public.confirmaciones_comedor for all
  to authenticated
  using (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim((select auth.jwt() ->> 'email')))
    )
    or estudiante_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
  )
  with check (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim((select auth.jwt() ->> 'email')))
    )
    or estudiante_id = (select auth.uid())
    or public.es_admin((select auth.uid()))
  );

-- 9.8 Calificaciones Oficiales (Notas)
alter table public.notas enable row level security;

drop policy if exists "Estudiantes y familias leen sus notas" on public.notas;
create policy "Estudiantes y familias leen sus notas"
  on public.notas for select
  to authenticated
  using (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim((select auth.jwt() ->> 'email')))
         or e.id in (
           select ee.estudiante_id from public.encargado_estudiante ee
           join public.encargados enc on enc.id = ee.encargado_id
           where (enc.user_id = (select auth.uid()) or lower(trim(enc.correo)) = lower(trim((select auth.jwt() ->> 'email'))))
             and ee.activo = true and enc.activo = true
         )
    )
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Solo administradores gestionan notas" on public.notas;
create policy "Solo administradores gestionan notas"
  on public.notas for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.9 Asistencias
alter table public.asistencias enable row level security;

drop policy if exists "Estudiantes y familias leen sus asistencias" on public.asistencias;
create policy "Estudiantes y familias leen sus asistencias"
  on public.asistencias for select
  to authenticated
  using (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim((select auth.jwt() ->> 'email')))
         or e.id in (
           select ee.estudiante_id from public.encargado_estudiante ee
           join public.encargados enc on enc.id = ee.encargado_id
           where (enc.user_id = (select auth.uid()) or lower(trim(enc.correo)) = lower(trim((select auth.jwt() ->> 'email'))))
             and ee.activo = true and enc.activo = true
         )
    )
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Solo administradores gestionan asistencias" on public.asistencias;
create policy "Solo administradores gestionan asistencias"
  on public.asistencias for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 9.10 Encargados y Vínculos Familiares
alter table public.encargados enable row level security;

drop policy if exists "Encargados leen su propio perfil" on public.encargados;
create policy "Encargados leen su propio perfil"
  on public.encargados for select
  to authenticated
  using (
    user_id = (select auth.uid())
    or lower(trim(correo)) = lower(trim((select auth.jwt() ->> 'email')))
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Solo administradores gestionan encargados" on public.encargados;
create policy "Solo administradores gestionan encargados"
  on public.encargados for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

alter table public.encargado_estudiante enable row level security;

drop policy if exists "Lectura de vinculos familiares autorizados" on public.encargado_estudiante;
create policy "Lectura de vinculos familiares autorizados"
  on public.encargado_estudiante for select
  to authenticated
  using (
    encargado_id in (
      select id from public.encargados
      where user_id = (select auth.uid())
         or lower(trim(correo)) = lower(trim((select auth.jwt() ->> 'email')))
    )
    or estudiante_id in (
      select id from public.estudiantes
      where user_id = (select auth.uid())
         or lower(trim(correo)) = lower(trim((select auth.jwt() ->> 'email')))
    )
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Solo administradores gestionan vinculos familiares" on public.encargado_estudiante;
create policy "Solo administradores gestionan vinculos familiares"
  on public.encargado_estudiante for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));


-- ==============================================================================
-- SECCIÓN 10: PUBLICACIONES EN TIEMPO REAL (SUPABASE REALTIME)
-- ==============================================================================
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Avisos institucionales
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'institution_alerts'
    ) then
      alter publication supabase_realtime add table public.institution_alerts;
    end if;

    -- Confirmaciones de comedor
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'confirmaciones_comedor'
    ) then
      alter publication supabase_realtime add table public.confirmaciones_comedor;
    end if;
  end if;
end;
$$;


-- ==============================================================================
-- SECCIÓN 11: APROVISIONAMIENTO DEL ADMINISTRADOR OFICIAL
-- ==============================================================================

-- 11.1 Registro en public.administradores
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

-- 11.2 Aprovisionamiento en auth.users con contraseña protegida (StudentHub2026*)
do $$
declare
  admin_uid uuid;
  contrasena_hash text;
begin
  contrasena_hash := extensions.crypt('StudentHub2026*', extensions.gen_salt('bf'));

  select id into admin_uid
  from auth.users
  where lower(trim(email)) = 'studenthub.cr@gmail.com';

  if admin_uid is not null then
    update auth.users
    set encrypted_password = contrasena_hash,
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || '{"nombre": "Administración StudentHUB", "role": "admin"}'::jsonb,
        updated_at = now()
    where id = admin_uid;
  else
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
  end if;

  -- 11.3 Asignar rol admin en user_roles
  insert into public.user_roles (user_id, role)
  values (admin_uid, 'admin')
  on conflict (user_id, role) do nothing;
end;
$$;


-- ==============================================================================
-- SECCIÓN 12: DATOS SEMILLA (INSTITUCIÓN, SECCIONES Y PADRÓN ESCOLAR)
-- ==============================================================================

-- 12.1 Sede CTP San Rafael de Alajuela
insert into public.instituciones (nombre, slug, dominio_correo, activa)
values ('Colegio Técnico Profesional', 'ctp', 'gmail.com', true)
on conflict (slug) do update set
  activa = true,
  nombre = excluded.nombre;

-- 12.2 Secciones Académicas y Técnicas Oficiales
insert into public.grupos (institucion_id, codigo, nivel, jornada)
select i.id, g.codigo, g.nivel, g.jornada
from public.instituciones i
cross join (
  values 
    ('10-1', '10mo', 'Diurna'),
    ('10-2', '10mo', 'Diurna'),
    ('10-3', '10mo', 'Diurna'),
    ('11-1', '11vo', 'Diurna'),
    ('11-2', '11vo', 'Nocturna'),
    ('11-3', '11vo', 'Diurna'),
    ('12-1', '12vo', 'Diurna'),
    ('12-3', '12vo', 'Diurna')
) as g(codigo, nivel, jornada)
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  nivel = excluded.nivel,
  jornada = excluded.jornada;

-- 12.3 Padrón de Estudiantes Oficial (Beta Testers y Estudiantes Primarios)
insert into public.estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select 
  i.id,
  e.codigo,
  e.correo,
  e.nombre,
  e.especialidad,
  g.id,
  'activo'
from public.instituciones i
cross join (
  values 
    ('208520530', 'erickgarciab2134@gmail.com', 'Erick García Burgos', 'Informática Empresarial / Desarrollo Web', '11-1'),
    ('208990112', 'sofia.garcia@est.mep.go.cr', 'Sofía García Burgos', 'Ciberseguridad', '10-2'),
    ('100000001', 'estudiante1@colegio.ed.cr', 'Estudiante Muestra 1', 'Gestión de la Producción', '10-1'),
    ('100000002', 'estudiante2@colegio.ed.cr', 'Estudiante Muestra 2', 'Gestión de la Producción', '10-1'),
    ('100000003', 'estudiante3@colegio.ed.cr', 'Estudiante Muestra 3', 'Ejecutivo Comercial', '10-3'),
    ('100000004', 'estudiante4@colegio.ed.cr', 'Estudiante Muestra 4', 'Ejecutivo Comercial', '10-3'),
    ('100000005', 'estudiante5@colegio.ed.cr', 'Estudiante Muestra 5', 'Administración Logística', '12-3'),
    ('100000006', 'estudiante6@colegio.ed.cr', 'Estudiante Muestra 6', 'Administración Logística', '12-3'),
    ('100000007', 'estudiante7@colegio.ed.cr', 'Estudiante Muestra 7', 'Ciberseguridad', '12-1'),
    ('100000008', 'estudiante8@colegio.ed.cr', 'Estudiante Muestra 8', 'Ciberseguridad', '12-1'),
    ('100000009', 'estudiante9@colegio.ed.cr', 'Estudiante Muestra 9', 'Contabilidad y Control', '10-1'),
    ('100000010', 'estudiante10@colegio.ed.cr', 'Estudiante Muestra 10', 'Contabilidad y Control', '10-1'),
    ('100000011', 'estudiante11@colegio.ed.cr', 'Estudiante Muestra 11', 'Gestión de la Calidad', '11-3'),
    ('100000012', 'estudiante12@colegio.ed.cr', 'Estudiante Muestra 12', 'Gestión de la Calidad', '11-3'),
    ('100000013', 'estudiante13@colegio.ed.cr', 'Estudiante Muestra 13', 'Gestión de la Calidad', '11-3'),
    ('100000014', 'estudiante14@colegio.ed.cr', 'Estudiante Muestra 14', 'Soporte y Configuración de Redes', '10-2'),
    ('100000015', 'estudiante15@colegio.ed.cr', 'Estudiante Muestra 15', 'Soporte y Configuración de Redes', '10-2'),
    ('100000016', 'estudiante16@colegio.ed.cr', 'Estudiante Muestra 16', 'Desarrollo Web', '11-1'),
    ('100000017', 'estudiante17@colegio.ed.cr', 'Estudiante Muestra 17', 'Desarrollo Web', '11-1'),
    ('100000018', 'estudiante18@colegio.ed.cr', 'Estudiante Muestra 18', 'Desarrollo Web', '11-1')
) as e(codigo, correo, nombre, especialidad, grupo_codigo)
join public.grupos g on g.institucion_id = i.id and g.codigo = e.grupo_codigo
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id,
  estado = 'activo';

-- 12.4 Sincronizar de inmediato si algún usuario ya tiene cuenta creada en auth.users
update public.estudiantes e
set user_id = u.id
from auth.users u
where lower(trim(e.correo)) = lower(trim(u.email))
  and (e.user_id is null or e.user_id != u.id);

-- 12.5 Calificaciones de Muestra Iniciales (Rúbrica Oficial MEP para Erick García)
do $$
declare
  erick_id uuid;
begin
  select id into erick_id from public.estudiantes where codigo = '208520530';

  if erick_id is not null then
    -- Limpiar registros de muestra previos si existiesen para recarga limpia
    delete from public.notas where estudiante_id = erick_id;

    insert into public.notas (
      estudiante_id, periodo, materia, docente, nota_final,
      trabajo_cotidiano, tareas, pruebas, proyecto, asistencia, observaciones
    ) values
      (erick_id, 'I Periodo', 'Programación y Desarrollo Web', 'Prof. Carlos Murillo Vargas', 94.50, 95.0, 90.0, 95.0, 96.0, 100.0, 'Excelente dominio técnico en frameworks modernos y arquitectura cliente-servidor.'),
      (erick_id, 'I Periodo', 'Bases de Datos y PostgreSQL', 'Prof. Andrea Soto Aguilar', 91.00, 90.0, 92.0, 90.0, 94.0, 98.0, 'Manejo sobresaliente de índices, normalización y políticas RLS.'),
      (erick_id, 'I Periodo', 'Soporte de TI y Redes', 'Prof. Roberto Jiménez Rojas', 88.50, 88.0, 85.0, 90.0, 90.0, 95.0, 'Participación activa en laboratorios prácticos de cableado y switches.'),
      (erick_id, 'I Periodo', 'Inglés Técnico para TI', 'Prof. Vanessa Castro Molina', 86.00, 85.0, 85.0, 88.0, 86.0, 92.0, 'Buena fluidez en documentación técnica y vocabulario de software.'),
      (erick_id, 'I Periodo', 'Matemática Aplicada', 'Prof. Alberto Vargas', 82.00, 80.0, 82.0, 84.0, 82.0, 90.0, 'Buen rendimiento en cálculo aplicado y álgebra booleana.'),
      (erick_id, 'I Periodo', 'Español', 'Prof. Elena Brenes Gómez', 88.00, 88.0, 90.0, 86.0, 88.0, 95.0, 'Excelente expresión escrita en informes de proyectos técnicos.'),
      (erick_id, 'I Periodo', 'Estudios Sociales', 'Prof. Jorge Campos Arias', 89.00, 90.0, 88.0, 88.0, 90.0, 96.0, 'Comprensión integral de la historia institucional y cívica.');

    -- 12.6 Asistencias de Muestra Iniciales
    delete from public.asistencias where estudiante_id = erick_id;

    insert into public.asistencias (
      estudiante_id, fecha, periodo, materia, bloque, estado, justificacion
    ) values
      (erick_id, '2026-03-20', 'I Periodo', 'Programación y Desarrollo Web', 'Lecciones 1-4 (7:00 AM - 10:00 AM)', 'presente', null),
      (erick_id, '2026-03-19', 'I Periodo', 'Bases de Datos y PostgreSQL', 'Lecciones 5-8 (10:15 AM - 1:15 PM)', 'presente', null),
      (erick_id, '2026-03-18', 'I Periodo', 'Soporte de TI y Redes', 'Lecciones 1-3 (7:00 AM - 9:15 AM)', 'tardia', 'Llegada 10 minutos tarde por retraso en transporte público'),
      (erick_id, '2026-03-17', 'I Periodo', 'Inglés Técnico para TI', 'Lecciones 4-6 (9:30 AM - 11:45 AM)', 'presente', null),
      (erick_id, '2026-03-16', 'I Periodo', 'Matemática Aplicada', 'Lecciones 1-2 (7:00 AM - 8:30 AM)', 'ausencia_justificada', 'Cita médica en Ebáis San Rafael debidamente comprobada'),
      (erick_id, '2026-03-13', 'I Periodo', 'Español', 'Lecciones 3-4 (8:45 AM - 10:15 AM)', 'presente', null),
      (erick_id, '2026-03-12', 'I Periodo', 'Estudios Sociales', 'Lecciones 1-2 (7:00 AM - 8:30 AM)', 'presente', null),
      (erick_id, '2026-03-11', 'I Periodo', 'Programación y Desarrollo Web', 'Lecciones 5-8 (10:15 AM - 1:15 PM)', 'presente', null),
      (erick_id, '2026-03-10', 'I Periodo', 'Bases de Datos y PostgreSQL', 'Lecciones 1-4 (7:00 AM - 10:00 AM)', 'presente', null),
      (erick_id, '2026-03-09', 'I Periodo', 'Soporte de TI y Redes', 'Lecciones 5-7 (10:15 AM - 12:30 PM)', 'presente', null);
  end if;
end;
$$;

-- 12.7 Comunicados Oficiales Iniciales
insert into public.institution_alerts (
  title, message, category, priority, target_type, created_by, active
) values (
  'Bienvenida al Ciclo Lectivo Oficial 2026',
  'Le damos la más cordial bienvenida a toda la comunidad educativa del CTP San Rafael de Alajuela al nuevo ecosistema digital Student HUB. Consultá tu horario, carnet digital y menú escolar desde tu dispositivo.',
  'general',
  'info',
  'all',
  'studenthub.cr@gmail.com',
  true
), (
  'Módulo de Comedor y Filas Digitales Activo',
  'Recordá confirmar tu asistencia al servicio de alimentación institucional antes del corte diario para agilizar la entrega en las barras del comedor.',
  'general',
  'info',
  'all',
  'studenthub.cr@gmail.com',
  true
)
on conflict do nothing;

-- ==============================================================================
-- FIN DEL SCRIPT UNIFICADO — DESPLIEGUE EXITOSO
-- ==============================================================================
