# Auditoría actualizada — 16 de septiembre de 2026

Esta revisión sustituye las conclusiones de compilación de AUDITORIA_2026-09-16.md. Se examinó el código local actual, se compiló y se navegó la versión local conectada a sus datos públicos. No se modificó código ni Supabase.

## Resultado de las comprobaciones

- **Compilación: correcta.** Se resolvieron la sintaxis inválida de Sedes y la exportación ausente de useTheme.
- **ESLint: 11 errores, 0 advertencias.** La composición cambió: ya no hay error de sintaxis, pero ThemeContext vuelve a mezclar proveedor y hook exportado.
- **Navegador:** portada, listado de seis sedes, detalle de Liceo Naval y modal de pagos renderizan; el modal se cierra con Escape. También renderizan Nosotros, Tienda, Eventos, Términos, login administrativo y página no encontrada. Esta comprobación no prueba todos sus datos ni acciones.
- **Consola:** no se capturaron errores durante el recorrido comprobado.
- **Rendimiento:** JavaScript principal 578,47 kB (159,25 kB gzip); admin 189,91 kB (37,24 kB gzip); CSS 74,60 kB (11,54 kB gzip). Vite advierte que el paquete principal supera 500 kB. Es una oportunidad de optimización, no un fallo de compilación ni una medición de velocidad real.
- **Vercel:** existe vercel.json con una regla para servir la aplicación en rutas internas. No se comprobó qué versión está desplegada en producción.

## Hallazgos prioritarios

### P1 — Riesgo de reemplazar el catálogo después de una lectura fallida

`src/admin/AdminTienda.jsx:40` ignora el error devuelto por la consulta inicial. Si falla, se muestra una lista vacía y se habilita el editor. Crear un producto después de recuperar la conexión construye una lista desde ese estado y la guarda completa (`:112`), pudiendo reemplazar el catálogo existente.

Recomendación: bloquear escrituras hasta completar la lectura y distinguir error de catálogo vacío. Identificado en código; no se provocó una pérdida real.

### P1 — Se publican datos bancarios incompletos

En el modal de Liceo Naval se observó `191-XXXXXXXX-0-XX` como cuenta BCP y un CCI con X, ambos con botón Copiar. El modal ya no inventa cuentas de respaldo, pero sigue presentando valores incompletos de la configuración como datos utilizables.

Referencias: `src/ModalPago.jsx` y la configuración `metodos_pago_sedes`. Recomendación: completar los datos desde el panel autorizado y validar antes de publicarlos. No se verificó titularidad de ninguna cuenta ni se realizó un pago.

### P2 — Cancelar una suspensión no detiene la actualización

`src/admin/AdminDashboard.jsx:74`: `prompt(...) || 'Por lluvia'` convierte Cancelar en un motivo válido y continúa actualizando la sede. Debe salir si el resultado es `null`.

### P2 — Precios administrativos sustituyen cero por importes predeterminados

`src/admin/AdminSedes.jsx:1223`: las etiquetas de horarios usan `precio_mes || 150` y equivalentes. Cero y ausencia se muestran como otros precios. El detalle público utiliza `mostrarPrecio`, por lo que las dos vistas pueden discrepar. Unificar la representación sin cambiar los precios guardados.

### P2 — Métricas de promociones usan un campo que el editor no guarda

`src/admin/AdminDashboard.jsx:47` filtra por `activa`; `AdminPreciosPromos` guarda `visible_en_web` y fechas. Una promoción vigente puede no contarse. Usar la misma regla de vigencia que la portada.

### P2 — Contraste insuficiente en tema claro

En `/trabaja`, el encabezado «Convocatorias Vigentes» conserva color blanco sobre el fondo claro de la página. Confirmado con estilos calculados en navegador y en `src/TrabajaConNosotros.jsx:118`. El resto de la página requiere una revisión visual equivalente; no se afirma que todos los textos fallen.

### P2 — Los fondos vacíos vuelven a mostrar fotos de sedes

`src/App.jsx:166` y `src/Sedes.jsx:46` activan el respaldo cuando una lista existe pero está vacía. Si la intención del editor es quitar todas las imágenes, la web no respeta esa elección. Distinguir clave ausente de lista vacía o explicar expresamente el respaldo en el editor.

### P2 — El encuadre en coordenada cero se pierde

`src/Sedes.jsx:65`, `:122` y `:246` usan `|| 50` para posiciones. Un encuadre guardado en 0 % termina centrado en 50 %. Usar un valor predeterminado solo para valores ausentes.

### P2 — Un CV puede quedar sin registro asociado

`src/TrabajaConNosotros.jsx:73` sube el CV antes de insertar la postulación. La referencia local permite reutilizarlo al reintentar, pero si el visitante abandona, recarga o cambia de archivo tras un fallo, puede quedar un archivo huérfano. Requiere recuperación o limpieza controlada en el servidor; no conceder borrado general a visitantes.

### P2 — La vista de encuadre cambia antes de confirmar el guardado

`src/admin/AdminNosotros.jsx:260` actualiza posiciones/fotos/logros antes de comprobar la persistencia en `:289`. Si falla, el estado mostrado y el remoto divergen. Confirmar el guardado antes de aplicar el estado o mostrarlo como borrador.

## ESLint

Los 11 errores corresponden a variables sin uso en App, Dashboard, PreciosPromos, Tienda y SelectorHoras; reglas de efectos en Dashboard, Prospectos y SelectorHoras; declaración de carga en Eventos; y exportaciones para recarga en caliente en ThemeContext. No todos implican un fallo de ejecución: deben corregirse sin confundirlos con los problemas funcionales anteriores.

## Límites de esta revisión

- No se enviaron formularios, subieron CV, cambiaron precios ni probaron borrados.
- No se inició sesión ni se verificaron operaciones reales de cada rol administrativo.
- No se inspeccionó la configuración actual de políticas/funciones de Supabase; los cambios posteriores al último CSV siguen sin verificar.
- No se validó el despliegue de Vercel ni se completaron pruebas móviles.
- Los fallos de carga y guardado descritos se deducen de ramas concretas del código; no se simularon fallos contra datos reales.

## Siguiente prioridad

Primero proteger el catálogo y corregir los datos bancarios incompletos. Después corregir Cancelar, precios y vigencia de promociones; terminar con contraste, encuadres, fondos y recuperación de CV. Repetir las pruebas afectadas antes de publicar.

Esta auditoría no requiere cambios de base de datos ni SQL. Una futura solución de backend para CV deberá incluir sus scripts e instrucciones y distinguir entrega de ejecución.
