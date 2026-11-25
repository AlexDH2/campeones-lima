-- ==============================================================================
-- MIGRACIÓN: CORRECCIÓN DE PERMISOS Y POLÍTICAS RLS (PROSPECTOS, POSTULACIONES Y CV)
-- Proyecto: Campeones Lima (dntpwoieombsgsfhvkxy)
-- ==============================================================================

-- 1. Asegurar permisos base sobre el esquema público
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- ==============================================================================
-- 2. TABLA: public.prospectos (Formulario web "Reclama tu Clase de Prueba")
-- ==============================================================================
-- Permisos de tabla a nivel de rol
GRANT INSERT ON TABLE public.prospectos TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.prospectos TO authenticated;

-- Activar RLS
ALTER TABLE public.prospectos ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir que cualquier visitante (anon) registre su solicitud de clase
DROP POLICY IF EXISTS "Permitir insercion publica de prospectos" ON public.prospectos;
CREATE POLICY "Permitir insercion publica de prospectos"
ON public.prospectos FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política 2: Solo administradores autenticados pueden ver, editar o eliminar leads
DROP POLICY IF EXISTS "Permitir lectura y gestion a admins" ON public.prospectos;
CREATE POLICY "Permitir lectura y gestion a admins"
ON public.prospectos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- 3. TABLA: public.postulaciones (Formulario web "Trabaja con Nosotros")
-- ==============================================================================
-- Permisos de tabla a nivel de rol
GRANT INSERT ON TABLE public.postulaciones TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE public.postulaciones TO authenticated;

-- Activar RLS
ALTER TABLE public.postulaciones ENABLE ROW LEVEL SECURITY;

-- Política 1: Permitir que los postulantes envíen sus datos sin requerir cuenta
DROP POLICY IF EXISTS "Permitir insercion publica de postulaciones" ON public.postulaciones;
CREATE POLICY "Permitir insercion publica de postulaciones"
ON public.postulaciones FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Política 2: Solo administradores autenticados pueden ver y gestionar postulantes
DROP POLICY IF EXISTS "Permitir gestion de postulaciones a admins" ON public.postulaciones;
CREATE POLICY "Permitir gestion de postulaciones a admins"
ON public.postulaciones FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);


-- ==============================================================================
-- 4. STORAGE BUCKET: postulaciones_cv (Subida de Currículums Vitae)
-- ==============================================================================
-- Política 1: Permitir que los postulantes suban su CV al bucket 'postulaciones_cv'
DROP POLICY IF EXISTS "Permitir subida publica de CVs" ON storage.objects;
CREATE POLICY "Permitir subida publica de CVs"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'postulaciones_cv');

-- Política 2: Los CVs solo pueden ser leídos y descargados por administradores autenticados
DROP POLICY IF EXISTS "Permitir lectura de CVs solo a administradores" ON storage.objects;
CREATE POLICY "Permitir lectura de CVs solo a administradores"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'postulaciones_cv');
