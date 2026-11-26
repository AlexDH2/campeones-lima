-- ==============================================================================
-- Migración: Corrección de Datos de Auditoría
-- 1. Unificar distrito de Sede Fátima a 'cercado de lima' (elimina filtro redundante 'lima').
-- 2. Eliminar pack de promoción duplicado en Sede Buenas Nuevas (id '60fa144e-a50e-4e6d-9129-7f08eb65ae17').
-- 3. Actualizar lugares de retiro en productos de tienda para incluir las 8 sedes oficiales.
-- ==============================================================================

-- 1. Unificar distrito de Fátima a cercado de lima
UPDATE public.sedes
SET distrito = 'cercado de lima'
WHERE id = '6a9c37a1-cf40-4bee-a2a4-24df6c3b5b5f';

-- 2. Eliminar pack duplicado con id 60fa144e-a50e-4e6d-9129-7f08eb65ae17 de promociones_vigentes
UPDATE public.configuracion_web
SET valor = (
  SELECT jsonb_agg(elem)
  FROM jsonb_array_elements(valor) elem
  WHERE elem->>'id' <> '60fa144e-a50e-4e6d-9129-7f08eb65ae17'
)
WHERE clave = 'promociones_vigentes';

-- 3. Sincronizar infoRetiro en tienda_productos con las 8 sedes
UPDATE public.configuracion_web
SET valor = (
  SELECT jsonb_agg(
    jsonb_set(
      elem,
      '{infoRetiro}',
      '[
        "Colegio Buenas Nuevas (san miguel)",
        "Colegio Libertador Simón Bolívar (cercado de lima)",
        "Colegio Nuestra Señora de Fátima (cercado de lima)",
        "Complejo Deportivo Elio (cercado de lima)",
        "CRISTO REY (pueblo libre)",
        "ELVIRA GARCÍA Y GARCÍA (pueblo libre)",
        "LICEO NAVAL (san miguel)",
        "SANTÍSIMA TRINIDAD (cercado de lima)"
      ]'::jsonb
    )
  )
  FROM jsonb_array_elements(valor) elem
)
WHERE clave = 'tienda_productos';
