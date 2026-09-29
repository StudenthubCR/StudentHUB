-- ==============================================================================
-- StudentHUB - Sistema de Confirmación de Asistencia al Comedor Institucional
-- Migración DDL y Políticas de Seguridad RLS para public.confirmaciones_comedor
-- ==============================================================================

-- 1. Crear tabla oficial de confirmaciones de asistencia al comedor
create table if not exists public.confirmaciones_comedor (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null,
  fecha date not null default current_date,
  asistencia boolean not null default true,
  actualizado_el timestamptz not null default now(),
  constraint confirmaciones_comedor_estudiante_fecha_unique unique (estudiante_id, fecha)
);

-- 2. Vincular clave foránea a public.estudiantes(id) si la tabla existe
do $$
begin
  if exists (
    select 1 from information_schema.tables 
    where table_schema = 'public' and table_name = 'estudiantes'
  ) then
    if not exists (
      select 1 from information_schema.table_constraints 
      where constraint_schema = 'public' 
        and table_name = 'confirmaciones_comedor' 
        and constraint_name = 'fk_confirmaciones_comedor_estudiante'
    ) then
      alter table public.confirmaciones_comedor
        add constraint fk_confirmaciones_comedor_estudiante
        foreign key (estudiante_id)
        references public.estudiantes(id)
        on delete cascade;
    end if;
  end if;
end;
$$;

-- 3. Índices optimizados para consultas por fecha, asistencia y estudiante (evita sequential scans en métricas)
create index if not exists idx_confirmaciones_comedor_fecha 
  on public.confirmaciones_comedor (fecha);

create index if not exists idx_confirmaciones_comedor_estudiante 
  on public.confirmaciones_comedor (estudiante_id);

create index if not exists idx_confirmaciones_comedor_fecha_asistencia 
  on public.confirmaciones_comedor (fecha, asistencia);

-- 4. Trigger automático para mantener 'actualizado_el' en cada modificación
create or replace function public.actualizar_timestamp_confirmacion_comedor()
returns trigger
language plpgsql
security definer
as $$
begin
  new.actualizado_el = now();
  return new;
end;
$$;

drop trigger if exists trg_actualizar_timestamp_confirmacion on public.confirmaciones_comedor;
create trigger trg_actualizar_timestamp_confirmacion
  before update on public.confirmaciones_comedor
  for each row
  execute function public.actualizar_timestamp_confirmacion_comedor();

-- 5. Habilitar Row Level Security (RLS)
alter table public.confirmaciones_comedor enable row level security;

-- 6. Políticas de Seguridad RLS
-- Política 1: Los estudiantes autenticados pueden consultar, registrar y modificar su propia confirmación para el día
drop policy if exists "Estudiantes gestionan su propia confirmacion" on public.confirmaciones_comedor;
create policy "Estudiantes gestionan su propia confirmacion"
  on public.confirmaciones_comedor
  for all
  to authenticated
  using (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim(auth.jwt() ->> 'email'))
    )
    or estudiante_id = (select auth.uid())
  )
  with check (
    estudiante_id in (
      select e.id from public.estudiantes e
      where e.user_id = (select auth.uid())
         or lower(trim(e.correo)) = lower(trim(auth.jwt() ->> 'email'))
    )
    or estudiante_id = (select auth.uid())
  );

-- Política 2: Los administradores institucionales verificados pueden leer todas las confirmaciones para métricas
drop policy if exists "Administradores leen todas las confirmaciones" on public.confirmaciones_comedor;
create policy "Administradores leen todas las confirmaciones"
  on public.confirmaciones_comedor
  for select
  to authenticated
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    or (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
    or exists (
      select 1 from public.administradores a
      where lower(trim(a.correo)) = lower(trim(auth.jwt() ->> 'email'))
        and a.activo = true
    )
  );

-- 7. Publicación en Supabase Realtime para sincronización instantánea de métricas en el Panel Admin
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables 
      where pubname = 'supabase_realtime' 
        and schemaname = 'public' 
        and tablename = 'confirmaciones_comedor'
    ) then
      alter publication supabase_realtime add table public.confirmaciones_comedor;
    end if;
  end if;
end;
$$;
