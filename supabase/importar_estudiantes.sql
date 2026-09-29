-- =========================================================================
-- IMPORTACIÓN DEL PADRÓN DE ESTUDIANTES (DATOS SINTÉTICOS DE MUESTRA)
-- Plantilla de aprovisionamiento de padrón escolar
-- Total de registros de muestra: 18
-- =========================================================================

-- 1. Asegurar la institución CTP
insert into instituciones (nombre, slug, dominio_correo, activa)
values ('Colegio Técnico Profesional', 'ctp', 'gmail.com', true)
on conflict (slug) do nothing;

-- 2. Trigger para vincular automáticamente cuando el usuario inicie sesión
create or replace function public.vincular_estudiante_con_usuario()
returns trigger language plpgsql security definer as $$
begin
  update public.estudiantes
  set user_id = new.id
  where lower(correo) = lower(new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute function public.vincular_estudiante_con_usuario();

-- 3. Registrar los grupos en la tabla grupos
insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '10-1', '10mo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '10-2', '10mo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '10-3', '10mo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '11-1', '11vo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '11-2', '11vo', 'Nocturna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '11-3', '11vo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '12-1', '12vo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

insert into grupos (institucion_id, codigo, nivel, jornada)
select id, '12-3', '12vo', 'Diurna' from instituciones where slug = 'ctp'
on conflict (institucion_id, codigo) do nothing;

-- 4. Insertar estudiantes de muestra (datos anonimizados sin PII real)
insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000001', 'estudiante1@colegio.ed.cr', 'Estudiante Muestra 1', 'Gestión de la Producción', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000002', 'estudiante2@colegio.ed.cr', 'Estudiante Muestra 2', 'Gestión de la Producción', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000003', 'estudiante3@colegio.ed.cr', 'Estudiante Muestra 3', 'Ejecutivo Comercial', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000004', 'estudiante4@colegio.ed.cr', 'Estudiante Muestra 4', 'Ejecutivo Comercial', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000005', 'estudiante5@colegio.ed.cr', 'Estudiante Muestra 5', 'Administración Logística', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000006', 'estudiante6@colegio.ed.cr', 'Estudiante Muestra 6', 'Administración Logística', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000007', 'estudiante7@colegio.ed.cr', 'Estudiante Muestra 7', 'Ciberseguridad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000008', 'estudiante8@colegio.ed.cr', 'Estudiante Muestra 8', 'Ciberseguridad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000009', 'estudiante9@colegio.ed.cr', 'Estudiante Muestra 9', 'Contabilidad y Control', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000010', 'estudiante10@colegio.ed.cr', 'Estudiante Muestra 10', 'Contabilidad y Control', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000011', 'estudiante11@colegio.ed.cr', 'Estudiante Muestra 11', 'Gestión de la Calidad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000012', 'estudiante12@colegio.ed.cr', 'Estudiante Muestra 12', 'Gestión de la Calidad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000013', 'estudiante13@colegio.ed.cr', 'Estudiante Muestra 13', 'Gestión de la Calidad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000014', 'estudiante14@colegio.ed.cr', 'Estudiante Muestra 14', 'Soporte y Configuración de Redes', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-2'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000015', 'estudiante15@colegio.ed.cr', 'Estudiante Muestra 15', 'Soporte y Configuración de Redes', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-2'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000016', 'estudiante16@colegio.ed.cr', 'Estudiante Muestra 16', 'Desarrollo Web', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000017', 'estudiante17@colegio.ed.cr', 'Estudiante Muestra 17', 'Desarrollo Web', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '100000018', 'estudiante18@colegio.ed.cr', 'Estudiante Muestra 18', 'Desarrollo Web', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

-- 5. Vincular de inmediato los usuarios que ya hayan iniciado sesión previamente
update public.estudiantes e
set user_id = u.id
from auth.users u
where lower(e.correo) = lower(u.email);
