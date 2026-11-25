-- ==============================================================================
-- MIGRACIÓN: Limpieza de registros y postulaciones de prueba
-- Proyecto: Campeones Lima
-- Fecha: 25 de Noviembre 2026
-- Descripción: Elimina las postulaciones de prueba generadas durante las
-- verificaciones del formulario "Trabaja con Nosotros".
-- ==============================================================================

DELETE FROM public.postulaciones 
WHERE email IN ('postulante.final@campeoneslima.pe', 'test.profesor@campeoneslima.pe')
   OR telefono IN ('999888111', '988777666')
   OR nombre ILIKE '%Profesor Verificado Final%'
   OR nombre ILIKE '%Profesor Test Directo%';
