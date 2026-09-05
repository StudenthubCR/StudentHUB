import zipfile
import xml.etree.ElementTree as ET
import re

# =============================================================================
# GENERADOR DE IMPORTACIÓN SQL PARA SUPABASE
# A partir de: Lista estudiantes beta testers.xlsx
# =============================================================================

EXCEL_FILE = 'Lista estudiantes beta testers.xlsx'

# Normalización de especialidades técnicas
ESPECIALIDADES_MAP = {
    'gestion de la produccion': 'Gestión de la Producción',
    'gestión de la produccion': 'Gestión de la Producción',
    'ejecutivo comercial': 'Ejecutivo Comercial',
    'administracion logistica': 'Administración Logística',
    'admnistracion logistica': 'Administración Logística',
    'ciberseguridad': 'Ciberseguridad',
    'cibereguridad': 'Ciberseguridad',
    'contabilidad y control': 'Contabilidad y Control',
    'gestuin de calidad': 'Gestión de la Calidad',
    'gestion de calidad': 'Gestión de la Calidad',
    'gestión de la calidad': 'Gestión de la Calidad',
    'soporte y configuracion de redes': 'Soporte y Configuración de Redes',
    'desarrollo web': 'Desarrollo Web',
}

# Correcciones ortográficas puntuales de nombres
NOMBRES_CORRECCIONES = {
    '208970239': 'Brandon Dávila Bustos',
    '114290560': 'Laura Paola Barboza Castillo',
    '208510079': 'Estiven Eduardo Calvo Otárola',
    '208520530': 'Erick García Burgos',
    '112090367': 'Zobeida Madrigal Ramírez',
    '208150605': 'Froylan Steven Segura Durán',
    '207960621': 'Meylan Andrea Reyes Marín',
    '208380866': 'Fátima Rojas Mendoza',
}

# Definición de grupos y niveles
GRUPOS_DEF = {
    '10-1': ('10mo', 'Diurna'),
    '10-2': ('10mo', 'Diurna'),
    '10-3': ('10mo', 'Diurna'),
    '11-1': ('11vo', 'Diurna'),
    '11-2': ('11vo', 'Nocturna'), # Para compatibilidad con horario prototipo
    '11-3': ('11vo', 'Diurna'),
    '12-1': ('12vo', 'Diurna'),
    '12-3': ('12vo', 'Diurna'),
}

with zipfile.ZipFile(EXCEL_FILE) as z:
    content = z.read('xl/sharedStrings.xml').decode('utf-8')
    tree = ET.fromstring(content)
    strings = [
        ''.join(node.text for node in si.iter() if node.text)
        for si in tree.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}si')
    ]
    sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml').decode('utf-8'))
    rows = []
    for row in sheet.findall('.//{http://schemas.openxmlformats.org/spreadsheetml/2006/main}row'):
        vals = []
        for c in row.findall('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}c'):
            v = c.find('{http://schemas.openxmlformats.org/spreadsheetml/2006/main}v')
            t = c.get('t')
            if v is not None:
                val = v.text
                if t == 's':
                    val = strings[int(val)]
                vals.append(val.strip())
            else:
                vals.append('')
        if vals and any(vals):
            rows.append(vals)

# Omitir fila de encabezados
header = rows[0]
data_rows = rows[1:]

estudiantes = []
for r in data_rows:
    cedula = r[0].strip() if len(r) > 0 else ''
    nombre_raw = r[1].strip() if len(r) > 1 else ''
    correo = r[2].strip().lower() if len(r) > 2 else ''
    grupo = r[3].strip() if len(r) > 3 else ''
    especialidad_raw = r[4].strip() if len(r) > 4 else ''

    if not cedula or not correo:
        continue

    # Corregir nombre si está en el mapa de correcciones o limpiar espacios
    nombre = NOMBRES_CORRECCIONES.get(cedula, nombre_raw)
    nombre = re.sub(r'\s+', ' ', nombre).strip()

    # Normalizar especialidad
    esp_key = especialidad_raw.lower().strip()
    especialidad = ESPECIALIDADES_MAP.get(esp_key, especialidad_raw)

    estudiantes.append({
        'cedula': cedula,
        'nombre': nombre,
        'correo': correo,
        'grupo': grupo,
        'especialidad': especialidad,
    })

sql = []
sql.append('-- =========================================================================')
sql.append('-- IMPORTACIÓN DEL PADRÓN DE ESTUDIANTES BETA TESTERS CTP 2026')
sql.append(f'-- Generado a partir de {EXCEL_FILE}')
sql.append(f'-- Total de estudiantes: {len(estudiantes)}')
sql.append('-- =========================================================================\n')

sql.append('-- 1. Asegurar la institución CTP')
sql.append("""insert into instituciones (nombre, slug, dominio_correo, activa)
values ('Colegio Técnico Profesional', 'ctp', 'gmail.com', true)
on conflict (slug) do nothing;
""")

sql.append('-- 2. Trigger para vincular automáticamente cuando el usuario inicie sesión')
sql.append("""create or replace function public.vincular_estudiante_con_usuario()
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
""")

sql.append('-- 3. Registrar los grupos en la tabla grupos')
for cod_grupo, (nivel, jornada) in GRUPOS_DEF.items():
    sql.append(f"insert into grupos (institucion_id, codigo, nivel, jornada)")
    sql.append(f"select id, '{cod_grupo}', '{nivel}', '{jornada}' from instituciones where slug = 'ctp'")
    sql.append(f"on conflict (institucion_id, codigo) do nothing;\n")

sql.append(f'-- 4. Insertar los {len(estudiantes)} estudiantes beta testers del CTP')
for est in estudiantes:
    ced = est['cedula']
    nombre = est['nombre'].replace("'", "''")
    correo = est['correo'].replace("'", "''")
    esp = est['especialidad'].replace("'", "''")
    cod_grupo = est['grupo']

    sql.append(f"insert into estudiantes (institucion_id, codigo, correo, nombre, especialidad, grupo_id, estado)")
    sql.append(f"select i.id, '{ced}', '{correo}', '{nombre}', '{esp}', g.id, 'activo'")
    sql.append(f"from instituciones i join grupos g on g.institucion_id = i.id and g.codigo = '{cod_grupo}'")
    sql.append(f"where i.slug = 'ctp'")
    sql.append(f"on conflict (institucion_id, codigo) do update set")
    sql.append(f"  correo = excluded.correo,")
    sql.append(f"  nombre = excluded.nombre,")
    sql.append(f"  especialidad = excluded.especialidad,")
    sql.append(f"  grupo_id = excluded.grupo_id;\n")

sql.append("""-- 5. Vincular de inmediato los usuarios que ya hayan iniciado sesión previamente
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
""")

with open('supabase/importar_estudiantes.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql))

print(f'Generado exitosamente: supabase/importar_estudiantes.sql ({len(estudiantes)} estudiantes beta testers)')
