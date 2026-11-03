-- ==============================================================================
-- StudentHUB - Protección y Políticas de Seguridad RLS para public.estudiantes
-- ==============================================================================
-- Habilita Row Level Security en la tabla de estudiantes para prevenir que usuarios
-- anónimos o clientes no autorizados lean o modifiquen información personal protegida (PII).
-- ==============================================================================

-- 1. Habilitar RLS en la tabla
ALTER TABLE public.estudiantes ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza de políticas previas si existieran
DROP POLICY IF EXISTS "Estudiantes leen su propio perfil" ON public.estudiantes;
DROP POLICY IF EXISTS "Solo administradores gestionan estudiantes" ON public.estudiantes;

-- 3. Política: Un estudiante autenticado únicamente puede consultar su propia ficha
CREATE POLICY "Estudiantes leen su propio perfil"
  ON public.estudiantes FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR lower(trim(correo)) = lower(trim(auth.jwt() ->> 'email'))
  );

-- 4. Política: Solo administradores verificados pueden consultar, insertar, modificar o eliminar registros
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
