# Arquitectura de Bases de Datos y Seguridad — Student HUB

Documento oficial de arquitectura de persistencia y seguridad de datos para Student HUB (CTP San Rafael de Alajuela).

> [!TIP] Despliegue Unificado en Supabase
> El script SQL maestro consolidado e idempotente que contiene todo este esquema, RLS, funciones, triggers y semillas se encuentra en:
> [`supabase/setup_completo_studenthub.sql`](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/supabase/setup_completo_studenthub.sql).
> Consultá la guía de despliegue en [`supabase/README.md`](file:///c:/Users/erick/OneDrive/Documentos/GitHub/StudentHUB/supabase/README.md).

---

## 1. Principios Rectores y Marco Legal (Ley N° 8968 / PRODHAB & MEP)

1. **Privacidad de Menores y Protección de Datos Personales:**
   - La información personal, académica y de salud de los estudiantes vive exclusivamente en **Supabase (PostgreSQL)** con **Row Level Security (RLS)** obligatorio.
   - **Bajo ninguna circunstancia se almacenan datos personales, nombres, cédulas, carnets o encargados en Google Sheets.**
2. **Autenticación Passwordless:**
   - Se utiliza exclusivamente autenticación OTP (One-Time Password) por correo electrónico enviado a través de Supabase Auth + Resend.
   - No existen contraseñas estáticas para estudiantes ni encargados legales.
3. **Aislamiento Multi-Rol Estricto:**
   - **Estudiante (`estudiante`):** Visualiza y gestiona únicamente su propia ficha personal y confirmaciones del comedor escolar.
   - **Encargado Legal (`encargado`):** Accede en modo lectura supervisada **únicamente** a los registros de los estudiantes con vínculo familiar activo en `encargado_estudiante`.
   - **Administrador (`admin`):** Gestión institucional centralizada.

---

## 2. Esquema Relacional en PostgreSQL (Supabase)

### 2.1 Tabla `public.instituciones`
Almacena las sedes y colegios técnicos integrados.
- `id` (uuid, PK)
- `nombre` (text)
- `slug` (text, unique)
- `dominio_correo` (text) — Ej: `mep.go.cr`
- `activa` (boolean)

### 2.2 Tabla `public.grupos`
Secciones académicas y técnicas de la institución.
- `id` (uuid, PK)
- `institucion_id` (uuid, FK -> `instituciones.id`)
- `codigo` (text) — Ej: `11-1`, `12-2`
- `nivel` (text) — Ej: `10mo`, `11mo`, `12mo`
- `jornada` (text) — `Diurna` o `Nocturna`

### 2.3 Tabla `public.estudiantes` (Padrón Estudiantil)
Ficha digital del estudiante.
- `id` (uuid, PK)
- `user_id` (uuid, FK -> `auth.users.id`, nullable)
- `institucion_id` (uuid, FK -> `instituciones.id`)
- `grupo_id` (uuid, FK -> `grupos.id`)
- `codigo` (text) — Identificador estudiantil visible en carnet
- `correo` (text, unique) — Correo institucional `@mep.go.cr`
- `nombre` (text)
- `especialidad` (text)
- `estado` (text) — `activo`, `inactivo`, `egresado`
- `foto_url` (text, nullable)

### 2.4 Tabla `public.encargados` (Encargados Legales / Tutores)
Información de madres, padres o tutores legales autorizados.
- `id` (uuid, PK)
- `user_id` (uuid, FK -> `auth.users.id`, nullable)
- `correo` (text, unique) — Correo personal del encargado (Gmail, Outlook, etc.)
- `nombre_completo` (text)
- `cedula` (text, nullable)
- `telefono` (text, nullable)
- `parentesco_por_defecto` (text) — Ej: `Madre`, `Padre`, `Tutor Legal`
- `activo` (boolean, default true)
- `creado_el` (timestamptz)
- `actualizado_el` (timestamptz)

### 2.5 Tabla `public.encargado_estudiante` (Vínculo M:N)
Tabla puente para relaciones familiares muchos a muchos.
- `id` (uuid, PK)
- `encargado_id` (uuid, FK -> `encargados.id` on delete cascade)
- `estudiante_id` (uuid, FK -> `estudiantes.id` on delete cascade)
- `parentesco` (text, nullable)
- `es_principal` (boolean, default true)
- `activo` (boolean, default true)
- `creado_el` (timestamptz)
- *Constraint Unique:* `(encargado_id, estudiante_id)`

### 2.6 Tabla `public.confirmaciones_comedor`
Registro diario de asistencia al servicio de alimentación institucional.
- `id` (uuid, PK)
- `estudiante_id` (uuid, FK -> `estudiantes.id` on delete cascade)
- `fecha` (date, default current_date)
- `asistencia` (boolean)
- `actualizado_el` (timestamptz)
- *Constraint Unique:* `(estudiante_id, fecha)`

### 2.7 Tabla `public.notas` (Calificaciones Oficiales)
Registro de notas y evaluaciones por periodo bajo directrices de evaluación del MEP.
- `id` (uuid, PK)
- `estudiante_id` (uuid, FK -> `estudiantes.id` on delete cascade)
- `periodo` (text) — `I Periodo`, `II Periodo`, `III Periodo`, `Anual`
- `materia` (text) — Nombre oficial de la materia o subárea técnica
- `docente` (text, nullable) — Docente titular
- `nota_final` (numeric(5,2)) — Calificación final en escala MEP (0–100)
- `trabajo_cotidiano` (numeric(5,2)) — Rubro de trabajo en clase
- `tareas` (numeric(5,2)) — Rubro de tareas y asignaciones
- `pruebas` (numeric(5,2)) — Rubro de pruebas sumativas
- `proyecto` (numeric(5,2)) — Rubro de proyecto técnico o académico
- `asistencia` (numeric(5,2)) — Rubro de asistencia y puntualidad
- `observaciones` (text, nullable) — Anotaciones formativas del docente
- `creado_el` (timestamptz)
- `actualizado_el` (timestamptz)

### 2.8 Tabla `public.asistencias` (Registro Diario de Asistencia)
Registro cronológico de lecciones impartidas y presencialidad estudiantil.
- `id` (uuid, PK)
- `estudiante_id` (uuid, FK -> `estudiantes.id` on delete cascade)
- `fecha` (date) — Fecha calendario de la sesión
- `periodo` (text) — `I Periodo`, `II Periodo`, `III Periodo`
- `materia` (text) — Materia o subárea correspondiente al bloque
- `bloque` (text) — Bloque o intervalo de lecciones (ej: `1-2`, `3-4`)
- `estado` (text) — `presente`, `ausencia_injustificada`, `ausencia_justificada`, `tardia`
- `justificacion` (text, nullable) — Detalle de boleta o comprobante aportado
- `creado_el` (timestamptz)

---

## 3. Matriz de Políticas RLS (Row Level Security)

| Tabla | Operación | Cuenta Única (Estudiante / Familia) | Rol Administrador |
| :--- | :--- | :--- | :--- |
| `estudiantes` | `SELECT` | Propio perfil (`user_id = auth.uid()` o correo) | Todos |
| `estudiantes` | `INSERT/UPDATE/DELETE` | Bloqueado | Permitido |
| `notas` | `SELECT` | Propias notas (`estudiante_id = perfil propio`) | Todas |
| `notas` | `INSERT/UPDATE/DELETE` | Bloqueado | Permitido |
| `asistencias` | `SELECT` | Propias asistencias (`estudiante_id = perfil propio`) | Todas |
| `asistencias` | `INSERT/UPDATE/DELETE` | Bloqueado | Permitido |
| `confirmaciones_comedor` | `SELECT` | Propias confirmaciones | Todas |
| `confirmaciones_comedor` | `INSERT/UPDATE` | Propia confirmación (sujeto a horario) | Permitido |
| `grupos` / `instituciones` | `SELECT` | Lectura pública autenticada | Todos |

---

## 4. Servicios Externos y APIs Auxiliares

### Horarios de Lecciones (Solo Lectura)
- **Origen:** Hoja de cálculo de horarios y distribución académica CTP.
- **Despliegue:** Google Apps Script Web App (Solo lectura de materias, bloques y docentes).
- **Endpoint:** Configurado mediante `VITE_HORARIOS_API_URL`.
- **Caché:** Indexada y cacheada localmente vía TanStack React Query + LocalStorage para resiliencia offline.

### Menú Semanal de Comedor (Solo Lectura)
- **Origen:** Publicación semanal del menú de comedor institucional.
- **Endpoint:** Configurado mediante `VITE_COMEDOR_API_URL`.
