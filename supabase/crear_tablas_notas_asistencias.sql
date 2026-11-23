-- ==============================================================================
-- StudentHUB - Esquema de Calificaciones (Notas) y Registro de Asistencias
-- ==============================================================================
-- Normativa: Ley N° 8968 (Protección de la Persona frente al Tratamiento de sus
-- Datos Personales / PRODHAB y directrices oficiales del MEP).
--
-- Principio de Seguridad: Acceso de Estudiante Único mediante Row Level Security.
-- Tanto el estudiante como su familia/encargado legal utilizan la misma cuenta
-- institucional (@mep.go.cr) y leen exclusivamente sus propios registros.
-- ==============================================================================

-- 1. Tabla de Calificaciones Oficiales (Notas)
CREATE TABLE IF NOT EXISTS public.notas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  periodo text NOT NULL CHECK (periodo IN ('I Periodo', 'II Periodo', 'III Periodo', 'Anual')),
  materia text NOT NULL,
  docente text,
  nota_final numeric(5,2) NOT NULL CHECK (nota_final >= 0 AND nota_final <= 100),
  trabajo_cotidiano numeric(5,2) DEFAULT 0 CHECK (trabajo_cotidiano >= 0 AND trabajo_cotidiano <= 100),
  tareas numeric(5,2) DEFAULT 0 CHECK (tareas >= 0 AND tareas <= 100),
  pruebas numeric(5,2) DEFAULT 0 CHECK (pruebas >= 0 AND pruebas <= 100),
  proyecto numeric(5,2) DEFAULT 0 CHECK (proyecto >= 0 AND proyecto <= 100),
  asistencia numeric(5,2) DEFAULT 0 CHECK (asistencia >= 0 AND asistencia <= 100),
  observaciones text,
  creado_el timestamptz NOT NULL DEFAULT now(),
  actualizado_el timestamptz NOT NULL DEFAULT now()
);

-- 2. Tabla de Asistencias (Registro Cronológico)
CREATE TABLE IF NOT EXISTS public.asistencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  fecha date NOT NULL,
  periodo text NOT NULL CHECK (periodo IN ('I Periodo', 'II Periodo', 'III Periodo')),
  materia text NOT NULL,
  bloque text NOT NULL,
  estado text NOT NULL CHECK (estado IN ('presente', 'ausencia_injustificada', 'ausencia_justificada', 'tardia')),
  justificacion text,
  creado_el timestamptz NOT NULL DEFAULT now()
);

-- 3. Índices de Rendimiento para Consultas
CREATE INDEX IF NOT EXISTS idx_notas_estudiante_periodo ON public.notas (estudiante_id, periodo);
CREATE INDEX IF NOT EXISTS idx_notas_estudiante ON public.notas (estudiante_id);
CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante_fecha ON public.asistencias (estudiante_id, fecha DESC);
CREATE INDEX IF NOT EXISTS idx_asistencias_estudiante_periodo ON public.asistencias (estudiante_id, periodo);

-- 4. Habilitación Obligatoria de Row Level Security (RLS)
ALTER TABLE public.notas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;

-- Limpieza de políticas existentes
DROP POLICY IF EXISTS "Estudiantes leen sus propias notas" ON public.notas;
DROP POLICY IF EXISTS "Solo administradores gestionan notas" ON public.notas;
DROP POLICY IF EXISTS "Estudiantes leen sus propias asistencias" ON public.asistencias;
DROP POLICY IF EXISTS "Solo administradores gestionan asistencias" ON public.asistencias;

-- 5. Políticas RLS: El estudiante autenticado (usado también por su encargado)
-- solo puede leer sus propias notas y asistencias.
CREATE POLICY "Estudiantes leen sus propias notas"
  ON public.notas FOR SELECT
  TO authenticated
  USING (
    estudiante_id IN (
      SELECT id FROM public.estudiantes
      WHERE user_id = auth.uid()
         OR lower(trim(correo)) = lower(trim(auth.jwt() ->> 'email'))
    )
  );

CREATE POLICY "Estudiantes leen sus propias asistencias"
  ON public.asistencias FOR SELECT
  TO authenticated
  USING (
    estudiante_id IN (
      SELECT id FROM public.estudiantes
      WHERE user_id = auth.uid()
         OR lower(trim(correo)) = lower(trim(auth.jwt() ->> 'email'))
    )
  );

-- 6. Políticas RLS: Administradores del CTP para registrar o modificar datos
CREATE POLICY "Solo administradores gestionan notas"
  ON public.notas FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

CREATE POLICY "Solo administradores gestionan asistencias"
  ON public.asistencias FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

-- 7. Comentarios Informativos en el Catálogo
COMMENT ON TABLE public.notas IS 'Calificaciones oficiales del estudiante bajo rúbrica MEP protegidas por RLS.';
COMMENT ON TABLE public.asistencias IS 'Registro diario y cronológico de asistencia a lecciones protegido por RLS.';
   