# Guía de Despliegue de Base de Datos — Supabase (PostgreSQL)

Esta carpeta contiene el backend relacional y las políticas de seguridad de **Student HUB** para el Colegio Técnico Profesional Rosario de Naranjo (CTP).

---

## Script Maestro Unificado

Para inicializar la base de datos desde cero o actualizar una instancia existente sin lidiar con múltiples scripts dispersos, utilizá el archivo maestro unificado:

```
supabase/setup_completo_studenthub.sql
```

Este script es **100% idempotente** (`IF NOT EXISTS`, `CREATE OR REPLACE`, `DROP POLICY IF EXISTS`), lo que significa que podés ejecutarlo múltiples veces sin riesgo de duplicar datos ni romper estructuras existentes.

---

## Cómo Ejecutarlo en Supabase (1 Clic)

1. Ingresá a tu proyecto en el panel de Supabase:
   [https://supabase.com/dashboard/project/_](https://supabase.com/dashboard)
2. En la barra lateral izquierda, hacé clic en **SQL Editor** (ícono de terminal `>_`).
3. Creá una nueva consulta haciendo clic en **New Query**.
4. Abrí el archivo [`setup_completo_studenthub.sql`](./setup_completo_studenthub.sql), copiá todo su contenido y pegalo en el editor.
5. Presioná el botón **Run** (o el atajo `Ctrl + Enter` / `Cmd + Enter`).
6. Supabase responderá: `Success. No rows returned`. Toda la arquitectura estará lista y blindada.

---

## Qué Crea y Configura el Script Unificado

El archivo está estructurado en 12 secciones secuenciales:

| Sección | Componentes | Propósito |
| :--- | :--- | :--- |
| **1. Extensiones** | `pgcrypto`, `uuid-ossp` | Generación de UUIDs y hashing de contraseñas de administración. |
| **2. Padrón Institucional** | `instituciones`, `grupos`, `estudiantes` | Estructura escolar, secciones (10-1 a 12-3) y ficha del estudiante. |
| **3. Administración y Roles** | `administradores`, `user_roles` | Directorio administrativo y asignación de roles seguros. |
| **4. Comunicados y Comedor** | `institution_alerts`, `confirmaciones_comedor` | Avisos oficiales y confirmación diaria de almuerzo/cena. |
| **5. Expediente Académico** | `notas`, `asistencias` | Calificaciones oficiales según rúbrica MEP y control cronológico de lecciones. |
| **6. Vínculos Familiares** | `encargados`, `encargado_estudiante` | Soporte relacional para madres, padres o tutores legales. |
| **7. Índices de Rendimiento** | Índices B-tree en todas las FK y correos | Búsquedas instantáneas y prevención de Table Scans / Bloqueos. |
| **8. Funciones y Triggers** | `es_admin`, `verificar_correo_padron`, auto-sync triggers | Seguridad `SECURITY DEFINER` y sincronización automática con `auth.users`. |
| **9. Row Level Security** | Políticas RLS optimizadas en las 10 tablas | Protección de privacidad estricta (Ley N° 8968 / PRODHAB). |
| **10. Supabase Realtime** | Publicación `supabase_realtime` | Sincronización en vivo para avisos y asistencia de comedor. |
| **11. Aprovisionamiento Admin** | `studenthub.cr@gmail.com` | Creación de cuenta administrativa con credenciales institucionales. |
| **12. Datos Semilla** | CTP, secciones y estudiantes de muestra | Carga inicial del CTP, grupos y expediente del estudiante principal. |

---

## Correspondencia con Scripts Previos

Los siguientes scripts individuales han quedado consolidados en `setup_completo_studenthub.sql`:

- `crear_tablas_notas_asistencias.sql` -> Secciones 5, 7 y 9.
- `crear_tabla_administradores.sql` -> Secciones 3, 8 y 11.
- `crear_tabla_confirmaciones_comedor.sql` -> Secciones 4, 7, 9 y 10.
- `crear_tabla_encargados.sql` -> Secciones 6, 7 y 9.
- `importar_estudiantes.sql` -> Secciones 2 y 12.
- `proteger_padron.sql` y `reparar_acceso_estudiantes.sql` -> Sección 8 (`verificar_correo_padron`).
- `corregir_rol_estudiante.sql` y `asignar_primer_admin.sql` -> Sección 8 (`es_admin` y triggers de auto-asignación).
- `reparar_estudiantes_rls_y_esquema.sql` -> Secciones 2, 7 y 9.
