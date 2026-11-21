-- ==============================================================================
-- StudentHUB - Sistema de Encargados Legales y Vínculo Familiar
-- Migración DDL y Políticas de Seguridad RLS para public.encargados y
-- public.encargado_estudiante (Cumplimiento estricto Ley N° 8968 - PRODHAB / MEP)
-- ==============================================================================
-- Idempotente: puede ejecutarse múltiples veces sin destruir datos existentes.
-- ==============================================================================

-- 1. Tabla de Encargados Legales
CREATE TABLE IF NOT EXISTS public.encargados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  correo text NOT NULL,
  nombre_completo text NOT NULL,
  cedula text,
  telefono text,
  parentesco_por_defecto text DEFAULT 'Encargado Legal',
  activo boolean NOT NULL DEFAULT true,
  creado_el timestamptz NOT NULL DEFAULT now(),
  actualizado_el timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT encargados_correo_unique UNIQUE (correo)
);

-- 2. Tabla Intermedia Encargado - Estudiante (Relación Muchos a Muchos: M:N)
-- Permite que un encargado tenga 1 o más estudiantes a cargo (hermanos/tutelados)
-- y que un estudiante pueda tener más de un encargado registrado (madre, padre, tutor).
CREATE TABLE IF NOT EXISTS public.encargado_estudiante (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  encargado_id uuid NOT NULL REFERENCES public.encargados(id) ON DELETE CASCADE,
  estudiante_id uuid NOT NULL REFERENCES public.estudiantes(id) ON DELETE CASCADE,
  parentesco text, -- Ej: 'Madre', 'Padre', 'Tutor Legal'
  es_principal boolean NOT NULL DEFAULT true,
  activo boolean NOT NULL DEFAULT true,
  creado_el timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT encargado_estudiante_unique UNIQUE (encargado_id, estudiante_id)
);

-- 3. Índices de Rendimiento para Búsquedas y RLS
CREATE INDEX IF NOT EXISTS idx_encargados_user_id 
  ON public.encargados(user_id);

CREATE INDEX IF NOT EXISTS idx_encargados_correo_lower 
  ON public.encargados(lower(trim(correo)));

CREATE INDEX IF NOT EXISTS idx_encargado_estudiante_encargado 
  ON public.encargado_estudiante(encargado_id);

CREATE INDEX IF NOT EXISTS idx_encargado_estudiante_estudiante 
  ON public.encargado_estudiante(estudiante_id);

CREATE INDEX IF NOT EXISTS idx_encargado_estudiante_activos 
  ON public.encargado_estudiante(encargado_id, estudiante_id) 
  WHERE activo = true;

-- 4. Trigger Automático para mantener 'actualizado_el' en encargados
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_encargados()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  new.actualizado_el = now();
  return new;
END;
$$;

DROP TRIGGER IF EXISTS trg_actualizar_timestamp_encargados ON public.encargados;
CREATE TRIGGER trg_actualizar_timestamp_encargados
  BEFORE UPDATE ON public.encargados
  FOR EACH ROW
  EXECUTE FUNCTION public.actualizar_timestamp_encargados();

-- 5. Trigger de Vinculación Automática auth.users -> public.encargados
-- Al registrarse o solicitar OTP con correo personal, se vincula automáticamente su user_id.
CREATE OR REPLACE FUNCTION public.vincular_encargado_con_usuario()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.encargados
  SET user_id = NEW.id
  WHERE lower(trim(correo)) = lower(trim(NEW.email))
    AND (user_id IS NULL OR user_id != NEW.id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_vincular_encargado_usuario ON auth.users;
CREATE TRIGGER trg_vincular_encargado_usuario
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.vincular_encargado_con_usuario();

-- Vincular registros previos si ya existen en auth.users
UPDATE public.encargados enc
SET user_id = u.id
FROM auth.users u
WHERE lower(trim(enc.correo)) = lower(trim(u.email))
  AND (enc.user_id IS NULL OR enc.user_id != u.id);

-- 6. Función RPC de Verificación de Correo de Encargado (Seguridad Definer)
-- Valida si el correo personal está registrado y activo sin exponer datos personales (PII)
CREATE OR REPLACE FUNCTION public.verificar_correo_encargado(correo_a_verificar text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  correo_limpio text;
  existe boolean;
BEGIN
  IF correo_a_verificar IS NULL OR trim(correo_a_verificar) = '' THEN
    RETURN false;
  END IF;

  correo_limpio := lower(trim(correo_a_verificar));

  -- Cuentas autorizadas de desarrollo y administración
  IF correo_limpio IN ('erickgarciab2134@gmail.com', 'studenthub.cr@gmail.com') THEN
    RETURN true;
  END IF;

  -- Comprobar si existe como encargado legal activo
  SELECT EXISTS (
    SELECT 1 FROM public.encargados e
    WHERE lower(trim(e.correo)) = correo_limpio
      AND e.activo = true
  ) INTO existe;

  RETURN coalesce(existe, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.verificar_correo_encargado(text) TO anon, authenticated, service_role;

COMMENT ON FUNCTION public.verificar_correo_encargado(text) IS
  'Verifica de forma segura y anónima si un correo pertenece a un encargado legal activo antes de enviar el OTP.';

-- 7. Habilitar Row Level Security (RLS) en las tablas
ALTER TABLE public.encargados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encargado_estudiante ENABLE ROW LEVEL SECURITY;

-- 8. Políticas RLS en public.encargados
DROP POLICY IF EXISTS "Encargados leen su propio perfil" ON public.encargados;
CREATE POLICY "Encargados leen su propio perfil"
  ON public.encargados
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(trim(correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

DROP POLICY IF EXISTS "Solo administradores gestionan encargados" ON public.encargados;
CREATE POLICY "Solo administradores gestionan encargados"
  ON public.encargados
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

-- 9. Políticas RLS en public.encargado_estudiante
DROP POLICY IF EXISTS "Lectura de vinculos para involucrados" ON public.encargado_estudiante;
CREATE POLICY "Lectura de vinculos para involucrados"
  ON public.encargado_estudiante
  FOR SELECT
  TO authenticated
  USING (
    -- El encargado autenticado puede ver sus propios vínculos
    encargado_id IN (
      SELECT id FROM public.encargados
      WHERE user_id = auth.uid()
         OR lower(trim(correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
    -- El estudiante autenticado puede ver quiénes son sus encargados
    OR estudiante_id IN (
      SELECT id FROM public.estudiantes
      WHERE user_id = auth.uid()
         OR lower(trim(correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    )
    -- Administradores institucionales
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

DROP POLICY IF EXISTS "Solo administradores gestionan vinculos" ON public.encargado_estudiante;
CREATE POLICY "Solo administradores gestionan vinculos"
  ON public.encargado_estudiante
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

-- 10. Actualización de RLS en public.estudiantes
-- Garantiza que un estudiante vea su ficha Y que un encargado legal vea EXCLUSIVAMENTE
-- la ficha de sus estudiantes vinculados activos (Aislamiento Ley N° 8968)
DROP POLICY IF EXISTS "Estudiantes leen su propio perfil" ON public.estudiantes;
CREATE POLICY "Estudiantes leen su propio perfil"
  ON public.estudiantes
  FOR SELECT
  TO authenticated
  USING (
    -- 1. Propio estudiante por user_id o correo institucional
    user_id = auth.uid()
    OR lower(trim(correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    -- 2. Encargado Legal activo con vínculo activo hacia el estudiante
    OR id IN (
      SELECT ee.estudiante_id
      FROM public.encargado_estudiante ee
      JOIN public.encargados enc ON enc.id = ee.encargado_id
      WHERE (
        enc.user_id = auth.uid() 
        OR lower(trim(enc.correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
      )
      AND ee.activo = true
      AND enc.activo = true
    )
    -- 3. Administrador institucional
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

-- 11. Actualización de RLS en public.confirmaciones_comedor
-- Encargados pueden consultar el estado de asistencia de sus estudiantes en modo lectura
DROP POLICY IF EXISTS "Estudiantes leen sus propias confirmaciones" ON public.confirmaciones_comedor;
CREATE POLICY "Estudiantes leen sus propias confirmaciones"
  ON public.confirmaciones_comedor
  FOR SELECT
  TO authenticated
  USING (
    estudiante_id = auth.uid()
    OR estudiante_id IN (
      SELECT id FROM public.estudiantes WHERE user_id = auth.uid()
    )
    -- Encargado legal activo
    OR estudiante_id IN (
      SELECT ee.estudiante_id
      FROM public.encargado_estudiante ee
      JOIN public.encargados enc ON enc.id = ee.encargado_id
      WHERE (
        enc.user_id = auth.uid()
        OR lower(trim(enc.correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
      )
      AND ee.activo = true
      AND enc.activo = true
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );
