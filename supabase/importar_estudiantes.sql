-- =========================================================================
-- IMPORTACIÓN DEL PADRÓN DE ESTUDIANTES BETA TESTERS CTP 2026
-- Generado a partir de Lista estudiantes beta testers.xlsx
-- Total de estudiantes: 18
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

-- 4. Insertar los 18 estudiantes beta testers del CTP
insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208700466', 'ethanmurillo05@gmail.com', 'Ethan Joshue Murillo Morera', 'Gestión de la Producción', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208920002', 'estebanoses861@gmail.com', 'Daniel Esteban Oses Valenciano', 'Gestión de la Producción', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '119850208', 'dnramocr@gmail.com', 'Danna Vanessa Ramírez Ovares', 'Ejecutivo Comercial', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208380866', 'fatyrojas03@gmail.com', 'Fátima Rojas Mendoza', 'Ejecutivo Comercial', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208670826', 'vale04rojas@gmail.com', 'Valeria Rojas Vargas', 'Administración Logística', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '207860617', 'alfaroprendas03@gmail.com', 'Lisseth Alfaro Prendas', 'Administración Logística', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '703170933', 'carlosorozal01@gmail.com', 'Carlos Enoc Orozco Alvarado', 'Ciberseguridad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208840697', 'varelakatherine3@gmail.com', 'Katherine Paola Varela González', 'Ciberseguridad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '12-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208970239', 'brandondavila156@gmail.com', 'Brandon Dávila Bustos', 'Contabilidad y Control', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '207120314', 'porrasjoseline@gmail.com', 'Yoselyn Porras Hernández', 'Contabilidad y Control', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '1116310482', 'pablorsa.1995@gmail.com', 'Pablo Miranda Arroyo', 'Gestión de la Calidad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208150884', 'jgutierrezprendas@gmail.com', 'Jonathan Gutiérrez Prendas', 'Gestión de la Calidad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '207960621', 'meylanreyes2509@gmail.com', 'Meylan Andrea Reyes Marín', 'Gestión de la Calidad', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-3'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '114290560', 'paola.emily12@yahoo.com', 'Laura Paola Barboza Castillo', 'Soporte y Configuración de Redes', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-2'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208510079', 'estivencalvo85@gmail.com', 'Estiven Eduardo Calvo Otárola', 'Soporte y Configuración de Redes', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '10-2'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208520530', 'erickgarciab2134@gmail.com', 'Erick García Burgos', 'Desarrollo Web', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '112090367', 'zobeidamadrigal@gmail.com', 'Zobeida Madrigal Ramírez', 'Desarrollo Web', g.id, 'activo'
from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '11-1'
where i.slug = 'ctp'
on conflict (institucion_id, codigo) do update set
  correo = excluded.correo,
  nombre = excluded.nombre,
  especialidad = excluded.especialidad,
  grupo_id = excluded.grupo_id;

insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)
select i.id, '208150605', 'froylansegura09@gmail.com', 'Froylan Steven Segura Durán', 'Desarrollo Web', g.id, 'activo'
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

-- 6. Vincular a Erick y administradores si entran con cuentas adicionales de desarrollo
update public.estudiantes
set user_id = u.id
from auth.users u
where codigo = '208520530'
  and lower(u.email) in ('studenthub.cr@gmail.com', 'erickgarciab2134@gmail.com');
