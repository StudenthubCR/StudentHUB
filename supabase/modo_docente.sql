-- ==============================================================================
-- STUDENT HUB — CTP ROSARIO DE NARANJO
-- MODULO DOCENTE: ESQUEMA, RLS POR ESPECIALIDAD Y SEMILLA PROF. DANGELO
-- ==============================================================================
-- Archivo: supabase/modo_docente.sql
-- Proposito:
--   1. Crear la tabla public.docentes y tablas de soporte docente
--      (public.observaciones_docentes y public.agenda_docente).
--   2. Implementar Row Level Security (RLS) estricto por especialidad
--      (Ley N° 8968 / PRODHAB): un docente activo solo accede a estudiantes,
--      notas, asistencias, observaciones y agenda de su especialidad_asignada.
--   3. Preservar intactas las politicas de solo lectura de estudiantes y
--      encargados legales sobre sus propios registros (compatible con o sin
--      public.encargados / public.encargado_estudiante instalados).
--   4. Aprovisionar la cuenta del Prof. Dangelo (especialidad: Desarrollo Web).
--
-- Script 100% idempotente: puede ejecutarse multiples veces de forma segura
-- sin destruir datos existentes ni sobrescribir migraciones previas.
-- ==============================================================================

-- ==============================================================================
-- SECCION 1: TABLA DE DOCENTES Y COLUMNAS ADITIVAS DE TRAZABILIDAD
-- ==============================================================================

create table if not exists public.docentes (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  correo_institucional text not null unique,
  nombre_completo text not null,
  especialidad_asignada text not null,
  secciones_asignadas text[] not null default '{}',
  activo boolean not null default true,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);

-- Trazabilidad docente opcional en notas y asistencias (cambios aditivos seguros)
alter table public.notas
  add column if not exists docente_id uuid references public.docentes(id) on delete set null;

alter table public.asistencias
  add column if not exists docente_id uuid references public.docentes(id) on delete set null;

alter table public.asistencias
  add column if not exists actualizado_el timestamptz not null default now();

-- Observaciones pedagogicas registradas por el docente sobre el estudiante
create table if not exists public.observaciones_docentes (
  id uuid primary key default gen_random_uuid(),
  estudiante_id uuid not null references public.estudiantes(id) on delete cascade,
  docente_id uuid not null references public.docentes(id) on delete cascade,
  periodo text not null default 'I Periodo'
    check (periodo in ('I Periodo', 'II Periodo', 'III Periodo', 'Anual')),
  materia text,
  categoria text not null default 'academica'
    check (categoria in ('academica', 'asistencia', 'convivencia', 'felicitacion')),
  observacion text not null,
  visible_familia boolean not null default true,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);

-- Agenda y avisos academicos publicados por docentes para su especialidad
create table if not exists public.agenda_docente (
  id uuid primary key default gen_random_uuid(),
  docente_id uuid not null references public.docentes(id) on delete cascade,
  especialidad text not null,
  seccion_objetivo text,
  tipo text not null check (tipo in ('examen', 'tarea', 'ausencia_profesor', 'recordatorio')),
  titulo text not null,
  materia text not null,
  fecha date not null,
  hora text,
  descripcion text,
  porcentaje numeric(5,2) check (porcentaje is null or (porcentaje >= 0 and porcentaje <= 100)),
  temario text[],
  aula text,
  prioridad text check (prioridad is null or prioridad in ('alta', 'media', 'baja')),
  profesor text,
  bloque_afectado text,
  indicacion text,
  activo boolean not null default true,
  creado_el timestamptz not null default now(),
  actualizado_el timestamptz not null default now()
);

comment on table public.docentes is
  'Directorio de docentes autorizados del CTP Rosario de Naranjo con alcance estricto por especialidad.';
comment on table public.observaciones_docentes is
  'Observaciones academicas y formativas emitidas por docentes, aisladas por especialidad mediante RLS.';
comment on table public.agenda_docente is
  'Tareas, examenes, entregas y avisos publicados por docentes unicamente para su especialidad asignada.';


-- ==============================================================================
-- SECCION 2: INDICES DE RENDIMIENTO PARA POLITICAS RLS
-- ==============================================================================

create index if not exists idx_docentes_auth_user_id
  on public.docentes(auth_user_id);

create index if not exists idx_docentes_correo_lower
  on public.docentes(lower(trim(correo_institucional)));

create index if not exists idx_docentes_especialidad_activos
  on public.docentes(lower(trim(especialidad_asignada)))
  where activo = true;

create index if not exists idx_estudiantes_especialidad_lower
  on public.estudiantes(lower(trim(especialidad)));

create index if not exists idx_notas_docente_id
  on public.notas(docente_id);

create index if not exists idx_asistencias_docente_id
  on public.asistencias(docente_id);

create index if not exists idx_observaciones_docentes_estudiante
  on public.observaciones_docentes(estudiante_id, creado_el desc);

create index if not exists idx_observaciones_docentes_docente
  on public.observaciones_docentes(docente_id);

create index if not exists idx_agenda_docente_especialidad_fecha
  on public.agenda_docente(lower(trim(especialidad)), fecha desc)
  where activo = true;

create index if not exists idx_agenda_docente_docente
  on public.agenda_docente(docente_id);


-- ==============================================================================
-- SECCION 3: TRIGGERS DE ACTUALIZACION Y VINCULACION AUTH -> DOCENTES
-- ==============================================================================

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

drop trigger if exists trg_actualizar_timestamp_docentes on public.docentes;
create trigger trg_actualizar_timestamp_docentes
  before update on public.docentes
  for each row execute function public.actualizar_timestamp_registro();

drop trigger if exists trg_actualizar_timestamp_asistencias on public.asistencias;
create trigger trg_actualizar_timestamp_asistencias
  before update on public.asistencias
  for each row execute function public.actualizar_timestamp_registro();

drop trigger if exists trg_actualizar_timestamp_observaciones_docentes on public.observaciones_docentes;
create trigger trg_actualizar_timestamp_observaciones_docentes
  before update on public.observaciones_docentes
  for each row execute function public.actualizar_timestamp_registro();

drop trigger if exists trg_actualizar_timestamp_agenda_docente on public.agenda_docente;
create trigger trg_actualizar_timestamp_agenda_docente
  before update on public.agenda_docente
  for each row execute function public.actualizar_timestamp_registro();

-- Vincular automaticamente auth_user_id y rol 'docente' cuando un docente inicia sesion
create or replace function public.vincular_docente_con_usuario()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.docentes
  set auth_user_id = new.id
  where lower(trim(correo_institucional)) = lower(trim(new.email))
    and (auth_user_id is null or auth_user_id != new.id);

  if to_regclass('public.user_roles') is not null and exists (
    select 1
    from public.docentes d
    where d.auth_user_id = new.id
      and d.activo = true
  ) then
    insert into public.user_roles (user_id, role)
    values (new.id, 'docente')
    on conflict (user_id, role) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_vincular_docente_usuario on auth.users;
create trigger trg_vincular_docente_usuario
  after insert or update of email on auth.users
  for each row execute function public.vincular_docente_con_usuario();

-- Helper defensivo de administracion (solo si no existe ya public.es_admin)
do $$
begin
  if to_regprocedure('public.es_admin(uuid)') is null then
    execute $fn$
      create function public.es_admin(usuario_id uuid default auth.uid())
      returns boolean
      language plpgsql
      security definer
      set search_path = public, pg_temp
      as $body$
      declare
        correo_usuario text;
        tiene_rol boolean := false;
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

        if correo_usuario = 'studenthub.cr@gmail.com' then
          return true;
        end if;

        if to_regclass('public.administradores') is not null then
          execute 'select exists (select 1 from public.administradores a where lower(trim(a.correo)) = $1 and a.activo = true)'
          into tiene_rol using correo_usuario;
          if tiene_rol then
            return true;
          end if;
        end if;

        return coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
      end;
      $body$;
    $fn$;
    grant execute on function public.es_admin(uuid) to anon, authenticated, service_role;
  end if;
end;
$$;

-- Actualizar validacion previa al OTP para incluir docentes activos
-- (tolera instancias donde public.administradores o public.encargados aun no existan)
create or replace function public.verificar_correo_padron(correo_a_verificar text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  correo_limpio text;
  existe boolean := false;
begin
  if correo_a_verificar is null or trim(correo_a_verificar) = '' then
    return false;
  end if;

  correo_limpio := lower(trim(correo_a_verificar));

  if correo_limpio = 'studenthub.cr@gmail.com' then
    return true;
  end if;

  -- A. Verificar si es Administrador activo
  if to_regclass('public.administradores') is not null then
    select exists (
      select 1 from public.administradores a
      where lower(trim(a.correo)) = correo_limpio and a.activo = true
    ) into existe;
    if existe then
      return true;
    end if;
  end if;

  -- B. Verificar si es Docente activo autorizado
  select exists (
    select 1 from public.docentes d
    where lower(trim(d.correo_institucional)) = correo_limpio and d.activo = true
  ) into existe;

  if existe then
    return true;
  end if;

  -- C. Verificar si es Estudiante activo en el padron
  select exists (
    select 1 from public.estudiantes e
    where lower(trim(e.correo)) = correo_limpio and e.estado = 'activo'
  ) into existe;

  if existe then
    return true;
  end if;

  -- D. Verificar si es Encargado legal activo (si la tabla existe)
  if to_regclass('public.encargados') is not null then
    execute 'select exists (select 1 from public.encargados enc where lower(trim(enc.correo)) = $1 and enc.activo = true)'
    into existe using correo_limpio;
    if existe then
      return true;
    end if;
  end if;

  return coalesce(existe, false);
end;
$$;

grant execute on function public.verificar_correo_padron(text) to anon, authenticated, service_role;


-- ==============================================================================
-- SECCION 4: PERMISOS DE API Y ROW LEVEL SECURITY (RLS) ESTRICTO
-- ==============================================================================

grant select on public.docentes to authenticated;
grant select, insert, update on public.notas to authenticated;
grant select, insert, update on public.asistencias to authenticated;
grant select, insert, update on public.observaciones_docentes to authenticated;
grant select, insert, update on public.agenda_docente to authenticated;

-- 4.1 Tabla public.docentes
alter table public.docentes enable row level security;

drop policy if exists "Docentes leen su propio perfil" on public.docentes;
create policy "Docentes leen su propio perfil"
  on public.docentes for select
  to authenticated
  using (
    auth_user_id = (select auth.uid())
    or lower(trim(correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
    or public.es_admin((select auth.uid()))
  );

drop policy if exists "Solo administradores gestionan docentes" on public.docentes;
create policy "Solo administradores gestionan docentes"
  on public.docentes for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 4.2 Tabla public.estudiantes (Solo SELECT restringido a la especialidad del docente)
-- Las politicas existentes de estudiantes y encargados permanecen intactas.
alter table public.estudiantes enable row level security;

drop policy if exists "Docentes leen estudiantes de su especialidad" on public.estudiantes;
create policy "Docentes leen estudiantes de su especialidad"
  on public.estudiantes for select
  to authenticated
  using (
    exists (
      select 1
      from public.docentes d
      where d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
        and lower(trim(d.especialidad_asignada)) = lower(trim(estudiantes.especialidad))
    )
  );

-- 4.3 Tabla public.notas (SELECT / INSERT / UPDATE por especialidad; cero DELETE docente)
-- Las politicas existentes de lectura para estudiantes/familias y control admin permanecen intactas.
alter table public.notas enable row level security;

drop policy if exists "Docentes leen notas de su especialidad" on public.notas;
create policy "Docentes leen notas de su especialidad"
  on public.notas for select
  to authenticated
  using (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = notas.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Docentes insertan notas de su especialidad" on public.notas;
create policy "Docentes insertan notas de su especialidad"
  on public.notas for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = notas.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Docentes actualizan notas de su especialidad" on public.notas;
create policy "Docentes actualizan notas de su especialidad"
  on public.notas for update
  to authenticated
  using (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = notas.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = notas.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

-- 4.4 Tabla public.asistencias (SELECT / INSERT / UPDATE por especialidad; cero DELETE docente)
-- Las politicas existentes de lectura para estudiantes/familias y control admin permanecen intactas.
alter table public.asistencias enable row level security;

drop policy if exists "Docentes leen asistencias de su especialidad" on public.asistencias;
create policy "Docentes leen asistencias de su especialidad"
  on public.asistencias for select
  to authenticated
  using (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = asistencias.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Docentes insertan asistencias de su especialidad" on public.asistencias;
create policy "Docentes insertan asistencias de su especialidad"
  on public.asistencias for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = asistencias.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Docentes actualizan asistencias de su especialidad" on public.asistencias;
create policy "Docentes actualizan asistencias de su especialidad"
  on public.asistencias for update
  to authenticated
  using (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = asistencias.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = asistencias.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

-- 4.5 Tabla public.observaciones_docentes
alter table public.observaciones_docentes enable row level security;

drop policy if exists "Estudiantes y familias leen sus observaciones" on public.observaciones_docentes;
do $$
begin
  if to_regclass('public.encargado_estudiante') is not null
     and to_regclass('public.encargados') is not null then
    execute $pol$
      create policy "Estudiantes y familias leen sus observaciones"
        on public.observaciones_docentes for select
        to authenticated
        using (
          visible_familia = true
          and estudiante_id in (
            select e.id from public.estudiantes e
            where e.user_id = (select auth.uid())
               or lower(trim(e.correo)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
               or e.id in (
                 select ee.estudiante_id from public.encargado_estudiante ee
                 join public.encargados enc on enc.id = ee.encargado_id
                 where (
                   enc.user_id = (select auth.uid())
                   or lower(trim(enc.correo)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
                 )
                   and ee.activo = true
                   and enc.activo = true
               )
          )
        );
    $pol$;
  else
    execute $pol$
      create policy "Estudiantes y familias leen sus observaciones"
        on public.observaciones_docentes for select
        to authenticated
        using (
          visible_familia = true
          and estudiante_id in (
            select e.id from public.estudiantes e
            where e.user_id = (select auth.uid())
               or lower(trim(e.correo)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
          )
        );
    $pol$;
  end if;
end;
$$;

drop policy if exists "Docentes leen observaciones de su especialidad" on public.observaciones_docentes;
create policy "Docentes leen observaciones de su especialidad"
  on public.observaciones_docentes for select
  to authenticated
  using (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = observaciones_docentes.estudiante_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Docentes insertan observaciones de su especialidad" on public.observaciones_docentes;
create policy "Docentes insertan observaciones de su especialidad"
  on public.observaciones_docentes for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = observaciones_docentes.estudiante_id
        and d.id = observaciones_docentes.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Docentes actualizan observaciones de su especialidad" on public.observaciones_docentes;
create policy "Docentes actualizan observaciones de su especialidad"
  on public.observaciones_docentes for update
  to authenticated
  using (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = observaciones_docentes.estudiante_id
        and d.id = observaciones_docentes.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  )
  with check (
    exists (
      select 1
      from public.estudiantes e
      join public.docentes d
        on lower(trim(d.especialidad_asignada)) = lower(trim(e.especialidad))
      where e.id = observaciones_docentes.estudiante_id
        and d.id = observaciones_docentes.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
    )
  );

drop policy if exists "Solo administradores gestionan observaciones" on public.observaciones_docentes;
create policy "Solo administradores gestionan observaciones"
  on public.observaciones_docentes for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));

-- 4.6 Tabla public.agenda_docente
alter table public.agenda_docente enable row level security;

drop policy if exists "Estudiantes y familias leen agenda de su especialidad" on public.agenda_docente;
do $$
begin
  if to_regclass('public.encargado_estudiante') is not null
     and to_regclass('public.encargados') is not null then
    execute $pol$
      create policy "Estudiantes y familias leen agenda de su especialidad"
        on public.agenda_docente for select
        to authenticated
        using (
          activo = true
          and exists (
            select 1
            from public.estudiantes e
            left join public.grupos g on g.id = e.grupo_id
            where (
              e.user_id = (select auth.uid())
              or lower(trim(e.correo)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
              or e.id in (
                select ee.estudiante_id from public.encargado_estudiante ee
                join public.encargados enc on enc.id = ee.encargado_id
                where (
                  enc.user_id = (select auth.uid())
                  or lower(trim(enc.correo)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
                )
                  and ee.activo = true
                  and enc.activo = true
              )
            )
            and lower(trim(e.especialidad)) = lower(trim(agenda_docente.especialidad))
            and (
              agenda_docente.seccion_objetivo is null
              or trim(agenda_docente.seccion_objetivo) = ''
              or lower(trim(coalesce(g.codigo, ''))) = lower(trim(agenda_docente.seccion_objetivo))
            )
          )
        );
    $pol$;
  else
    execute $pol$
      create policy "Estudiantes y familias leen agenda de su especialidad"
        on public.agenda_docente for select
        to authenticated
        using (
          activo = true
          and exists (
            select 1
            from public.estudiantes e
            left join public.grupos g on g.id = e.grupo_id
            where (
              e.user_id = (select auth.uid())
              or lower(trim(e.correo)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
            )
            and lower(trim(e.especialidad)) = lower(trim(agenda_docente.especialidad))
            and (
              agenda_docente.seccion_objetivo is null
              or trim(agenda_docente.seccion_objetivo) = ''
              or lower(trim(coalesce(g.codigo, ''))) = lower(trim(agenda_docente.seccion_objetivo))
            )
          )
        );
    $pol$;
  end if;
end;
$$;

drop policy if exists "Docentes leen agenda de su especialidad" on public.agenda_docente;
create policy "Docentes leen agenda de su especialidad"
  on public.agenda_docente for select
  to authenticated
  using (
    exists (
      select 1
      from public.docentes d
      where d.id = agenda_docente.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
        and lower(trim(d.especialidad_asignada)) = lower(trim(agenda_docente.especialidad))
    )
  );

drop policy if exists "Docentes insertan agenda de su especialidad" on public.agenda_docente;
create policy "Docentes insertan agenda de su especialidad"
  on public.agenda_docente for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.docentes d
      where d.id = agenda_docente.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
        and lower(trim(d.especialidad_asignada)) = lower(trim(agenda_docente.especialidad))
    )
  );

drop policy if exists "Docentes actualizan agenda de su especialidad" on public.agenda_docente;
create policy "Docentes actualizan agenda de su especialidad"
  on public.agenda_docente for update
  to authenticated
  using (
    exists (
      select 1
      from public.docentes d
      where d.id = agenda_docente.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
        and lower(trim(d.especialidad_asignada)) = lower(trim(agenda_docente.especialidad))
    )
  )
  with check (
    exists (
      select 1
      from public.docentes d
      where d.id = agenda_docente.docente_id
        and d.activo = true
        and (
          d.auth_user_id = (select auth.uid())
          or lower(trim(d.correo_institucional)) = lower(trim(coalesce((select auth.jwt() ->> 'email'), '')))
        )
        and lower(trim(d.especialidad_asignada)) = lower(trim(agenda_docente.especialidad))
    )
  );

drop policy if exists "Solo administradores gestionan agenda docente" on public.agenda_docente;
create policy "Solo administradores gestionan agenda docente"
  on public.agenda_docente for all
  to authenticated
  using (public.es_admin((select auth.uid())))
  with check (public.es_admin((select auth.uid())));


-- ==============================================================================
-- SECCION 5: SEMILLA DEL PROF. DANGELO Y ESTUDIANTES DE DESARROLLO WEB
-- ==============================================================================

-- NOTA DE DESPLIEGUE EN PRODUCCION:
-- Reemplazar el correo placeholder 'dangelo@mep.go.cr' por el correo
-- institucional oficial del Prof. Dangelo antes de habilitar OTP en produccion.
-- No se almacenan contrasenas ni credenciales estaticas en este script.
insert into public.docentes (
  correo_institucional,
  nombre_completo,
  especialidad_asignada,
  secciones_asignadas,
  activo
) values (
  'dangelo@mep.go.cr',
  'Prof. Dangelo',
  'Desarrollo Web',
  array['10-1', '11-1', '12-1']::text[],
  true
)
on conflict (correo_institucional) do update set
  nombre_completo = excluded.nombre_completo,
  especialidad_asignada = excluded.especialidad_asignada,
  secciones_asignadas = excluded.secciones_asignadas,
  activo = true;

-- Vincular auth_user_id y user_roles si la cuenta ya existe en auth.users
update public.docentes d
set auth_user_id = u.id
from auth.users u
where lower(trim(d.correo_institucional)) = lower(trim(u.email))
  and (d.auth_user_id is null or d.auth_user_id != u.id);

do $$
begin
  if to_regclass('public.user_roles') is not null then
    insert into public.user_roles (user_id, role)
    select d.auth_user_id, 'docente'
    from public.docentes d
    where d.auth_user_id is not null
      and d.activo = true
    on conflict (user_id, role) do nothing;
  end if;
end;
$$;

-- Garantizar secciones base de Desarrollo Web en CTP Rosario de Naranjo
insert into public.instituciones (nombre, slug, dominio_correo, activa)
values ('CTP Rosario de Naranjo', 'ctp', 'mep.go.cr', true)
on conflict (slug) do nothing;

insert into public.grupos (institucion_id, codigo, nivel, jornada)
select i.id, g.codigo, g.nivel, g.jornada
from public.instituciones i
cross join (
  values
    ('10-1', '10mo', 'Diurna'),
    ('11-1', '11mo', 'Diurna'),
    ('12-1', '12mo', 'Diurna')
) as g(codigo, nivel, jornada)
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

-- Semilla aditiva no destructiva de estudiantes en Desarrollo Web (solo si no existen)
insert into public.estudiantes (
  institucion_id,
  codigo,
  correo,
  nombre,
  especialidad,
  grupo_id,
  estado
)
select
  i.id,
  s.codigo,
  s.correo,
  s.nombre,
  'Desarrollo Web',
  g.id,
  'activo'
from public.instituciones i
cross join (
  values
    ('DW-2026-101', 'valeria.solano.dw@mep.go.cr', 'Valeria Solano Mendez', '12-1'),
    ('DW-2026-102', 'mateo.alvarado.dw@mep.go.cr', 'Mateo Alvarado Rojas', '10-1'),
    ('DW-2026-103', 'camila.quesada.dw@mep.go.cr', 'Camila Quesada Herrera', '11-1'),
    ('DW-2026-104', 'sebastian.mora.dw@mep.go.cr', 'Sebastian Mora Jimenez', '12-1')
) as s(codigo, correo, nombre, grupo_codigo)
join public.grupos g
  on g.institucion_id = i.id
 and g.codigo = s.grupo_codigo
where i.slug = 'ctp'
on conflict do nothing;

-- ==============================================================================
-- FIN DEL SCRIPT MODULO DOCENTE
-- ==============================================================================
