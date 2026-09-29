-- ==============================================================================
-- StudentHUB: Reparación Integral de Esquema, RLS y Claves Foráneas de Estudiantes
-- ==============================================================================
-- Resuelve errores de permisos RLS (403/400) y joins sobre grupos e instituciones.
-- Ejecutar este script en el Editor SQL del proyecto Supabase.
-- ==============================================================================

-- 1. Asegurar columna user_id e índices de búsqueda rápida
ALTER TABLE public.estudiantes 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_estudiantes_user_id ON public.estudiantes(user_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_correo_lower ON public.estudiantes(lower(trim(correo)));

-- 2. Sincronizar user_id de auth.users hacia public.estudiantes si el correo coincide
UPDATE public.estudiantes e
SET user_id = u.id
FROM auth.users u
WHERE lower(trim(e.correo)) = lower(trim(u.email))
  AND (e.user_id IS NULL OR e.user_id != u.id);

-- 3. Trigger automático para nuevos registros en auth.users
CREATE OR REPLACE FUNCTION public.sincronizar_usuario_con_estudiante()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.estudiantes
  SET user_id = NEW.id
  WHERE lower(trim(correo)) = lower(trim(NEW.email));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sincronizar_usuario_estudiante ON auth.users;
CREATE TRIGGER trg_sincronizar_usuario_estudiante
AFTER INSERT OR UPDATE OF email ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.sincronizar_usuario_con_estudiante();

-- 4. RLS y Permisos en Tablas Foráneas (grupos e instituciones)
-- Evita errores 400/403 de PostgREST cuando useEstudiante ejecuta joins
ALTER TABLE IF EXISTS public.grupos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura publica de grupos para usuarios" ON public.grupos;
CREATE POLICY "Lectura publica de grupos para usuarios"
  ON public.grupos FOR SELECT
  TO authenticated, anon
  USING (true);

ALTER TABLE IF EXISTS public.instituciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lectura publica de instituciones para usuarios" ON public.instituciones;
CREATE POLICY "Lectura publica de instituciones para usuarios"
  ON public.instituciones FOR SELECT
  TO authenticated, anon
  USING (true);

-- 5. RLS en public.estudiantes
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Estudiantes leen su propio perfil" ON public.estudiantes;
CREATE POLICY "Estudiantes leen su propio perfil"
  ON public.estudiantes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(trim(correo)) = lower(trim(coalesce(auth.jwt() ->> 'email', '')))
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

DROP POLICY IF EXISTS "Solo administradores gestionan estudiantes" ON public.estudiantes;
CREATE POLICY "Solo administradores gestionan estudiantes"
  ON public.estudiantes FOR ALL
  TO authenticated
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  )
  WITH CHECK (
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );

-- 6. Garantizar lectura en tabla confirmaciones_comedor para estudiantes autenticados
ALTER TABLE IF EXISTS public.confirmaciones_comedor ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Estudiantes leen sus propias confirmaciones" ON public.confirmaciones_comedor;
CREATE POLICY "Estudiantes leen sus propias confirmaciones"
  ON public.confirmaciones_comedor FOR SELECT
  TO authenticated
  USING (
    estudiante_id = auth.uid()
    OR estudiante_id IN (
      SELECT id FROM public.estudiantes WHERE user_id = auth.uid()
    )
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
    OR (auth.jwt() ->> 'email') = 'studenthub.cr@gmail.com'
  );
