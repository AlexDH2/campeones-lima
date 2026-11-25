-- ==============================================================================
-- MIGRACIÓN: Especificar Uniforme Oficial Obligatorio en Promociones de Verano 2027
-- Proyecto: Campeones Lima
-- Fecha: 25 de Noviembre 2026
-- Descripción: Actualiza el detalle de las promociones de verano en configuracion_web
-- para indicar expresamente que el uniforme oficial es obligatorio.
-- Mantiene intactas las promociones de Cristo Rey (CR).
-- ==============================================================================

UPDATE public.configuracion_web
SET valor = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem->>'sede' IS NOT NULL AND elem->>'descripcion' LIKE '%Incluye 2 meses, matrícula, uniforme%' THEN
        jsonb_set(
          elem,
          '{descripcion}',
          to_jsonb(
            replace(
              replace(elem->>'descripcion', 'uniforme y chaleco', 'uniforme oficial (obligatorio) y chaleco'),
              'uniforme y polo', 'uniforme oficial (obligatorio) y polo'
            )
          )
        )
      ELSE elem
    END
  )
  FROM jsonb_array_elements(valor) AS elem
)
WHERE clave = 'promociones_vigentes';
