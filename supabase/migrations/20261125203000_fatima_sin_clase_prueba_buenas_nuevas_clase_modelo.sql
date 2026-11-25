-- Migración: Ajustes de apertura de sedes de verano
-- 1. Colegio Nuestra Señora de Fátima: sede de próxima apertura, sin clase de prueba actualmente.
-- 2. Colegio Buenas Nuevas: nueva sede con Gran Clase Modelo el 28 de Noviembre de 2026.

-- Actualizar avisos especiales en sedes
UPDATE public.sedes
SET aviso_especial = 'Próxima apertura para la temporada de verano 2027. Actualmente esta sede no cuenta con clases de prueba.'
WHERE nombre = 'Colegio Nuestra Señora de Fátima';

UPDATE public.sedes
SET aviso_especial = '🎉 ¡NUEVA SEDE! Gran Clase Modelo de Apertura este 28 de Noviembre. ¡Inscríbete y asegura tu cupo!'
WHERE nombre = 'Colegio Buenas Nuevas';

-- Remover o anular precio de clase modelo para Fátima en configuracion_web
UPDATE public.configuracion_web
SET valor = valor - 'Colegio Nuestra Señora de Fátima'
WHERE clave = 'precios_clase_modelo';
