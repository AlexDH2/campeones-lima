-- ==============================================================================
-- MIGRACIÓN: Retirar mención de uniforme obligatorio de las promociones de verano
-- Proyecto: Campeones Lima
-- Fecha: 25 de Noviembre 2026
-- Descripción: Restablece el texto de las promociones en configuracion_web
-- al formato limpio estándar ("Incluye 2 meses, matrícula, uniforme y chaleco/polo").
-- ==============================================================================

UPDATE public.configuracion_web
SET valor = (
  SELECT jsonb_agg(
    CASE 
      WHEN elem->>'sede' IS NOT NULL AND elem->>'descripcion' LIKE '%uniforme oficial (obligatorio)%' THEN
        jsonb_set(
          elem,
          '{descripcion}',
          to_jsonb(
            replace(
              replace(elem->>'descripcion', 'uniforme oficial (obligatorio) y chaleco', 'uniforme y chaleco'),
              'uniforme oficial (obligatorio) y polo', 'uniforme y polo'
            )
          )
        )
      ELSE elem
    END
  )
  FROM jsonb_array_elements(valor) AS elem
)
WHERE clave = 'promociones_vigentes';
