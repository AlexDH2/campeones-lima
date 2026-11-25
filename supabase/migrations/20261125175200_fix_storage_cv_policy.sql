-- ==============================================================================
-- MIGRACIÓN 2: PERMISOS Y POLÍTICAS DE STORAGE PARA POSTULACIONES CV
-- ==============================================================================

-- 1. Permisos sobre el esquema storage
GRANT USAGE ON SCHEMA storage TO anon, authenticated;
GRANT ALL ON TABLE storage.objects TO anon, authenticated;
GRANT SELECT ON TABLE storage.buckets TO anon, authenticated;

-- 2. Asegurar que el bucket postulaciones_cv exista y sea público para lectura o privado según diseño
-- En Supabase Storage, para permitir inserciones anónimas:
DROP POLICY IF EXISTS "Permitir subida publica de CVs" ON storage.objects;
CREATE POLICY "Permitir subida publica de CVs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'postulaciones_cv');

-- Permitir lectura y gestión a administradores autenticados
DROP POLICY IF EXISTS "Permitir lectura de CVs solo a administradores" ON storage.objects;
CREATE POLICY "Permitir lectura de CVs solo a administradores"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'postulaciones_cv');

DROP POLICY IF EXISTS "Permitir eliminacion de CVs a administradores" ON storage.objects;
CREATE POLICY "Permitir eliminacion de CVs a administradores"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'postulaciones_cv');
