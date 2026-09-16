# Auditoría del estado actual — 16 de septiembre de 2026

## Resultado

El proyecto no está listo para publicar: la compilación falla y ESLint devuelve 11 errores, sin advertencias. Se revisaron los archivos actuales, incluidos cambios posteriores a las correcciones anteriores. No se modificó código ni Supabase durante esta auditoría.

## Hallazgos confirmados

### 1. P1 — Sintaxis inválida bloquea la aplicación

- Archivo: `src/Sedes.jsx:122`.
- `backgroundPosition` contiene `\vert{}\vert{}` dentro de una expresión JavaScript. Vite falla con `Invalid Unicode escape sequence`.
- El componente se importa desde App: el problema bloquea la compilación de toda la aplicación.
- Corrección propuesta: restaurar una interpolación válida con dos porcentajes separados por un espacio y conservar coordenadas iguales a cero usando `??`.

### 2. P1 — Importaciones de un hook que ya no se exporta

- Archivos: `src/App.jsx:39` y `src/Sedes.jsx:20`.
- Ambos importan `useTheme` desde `ThemeContext`, pero `src/ThemeContext.jsx` solo exporta `ThemeProvider`; el hook está en `src/theme.js`.
- Es un segundo bloqueo de carga, detectado por inspección de importaciones/exportaciones. La compilación actual se detiene primero en el hallazgo 1.
- Corrección propuesta: importar el hook desde `theme` y conservar el proveedor desde `ThemeContext`.

### 3. P1 — Una carga fallida puede terminar sobrescribiendo el catálogo

- Archivo: `src/admin/AdminTienda.jsx:40`, guardado en la línea 112.
- La lectura inicial ignora `error` y trata `data === null` como catálogo vacío. El editor permanece disponible.
- Si falla la lectura, se recupera la conexión y se crea un producto, se guarda una lista construida desde el estado vacío, reemplazando el catálogo remoto de esa clave.
- Corrección propuesta: distinguir error de catálogo vacío y bloquear escrituras hasta cargar correctamente los datos existentes.
- Escenario identificado en código; no se provocó una sobrescritura real.

### 4. P2 — Cancelar el motivo de suspensión suspende igualmente la sede

- Archivo: `src/admin/AdminDashboard.jsx:74`.
- El resultado `null` del botón Cancelar se convierte en `Por lluvia` por el operador `||`; la actualización sigue ejecutándose.
- Corrección propuesta: salir del controlador cuando el resultado sea `null`.

### 5. P2 — El panel muestra precios distintos de los configurados

- Archivo: `src/admin/AdminSedes.jsx:1223`.
- Las etiquetas de horarios siguen usando `precio_mes || 150`, `precio_x2 || 270` y equivalentes.
- Un precio válido de cero aparece sustituido por otro importe; un precio faltante también se presenta como conocido. El detalle público ya utiliza `mostrarPrecio`, por lo que ambos paneles pueden discrepar.
- Corrección propuesta: usar el mismo tratamiento de cero y precio faltante en ambas vistas.

### 6. P2 — El dashboard cuenta promociones con un campo diferente

- Archivo: `src/admin/AdminDashboard.jsx:47`.
- Filtra con `p.activa`, pero el editor guarda `visible_en_web`, `fecha_inicio`, `valido_hasta` y `es_permanente`.
- Una promoción creada por el editor puede no aparecer en las métricas aunque esté vigente en la web.
- Corrección propuesta: compartir la regla `promocionVigente` entre dashboard y portada.

### 7. P2 — Un CV puede quedar sin postulación asociada

- Archivo: `src/TrabajaConNosotros.jsx:73`.
- Se sube el archivo antes de insertar la postulación. Si el segundo paso falla y el visitante abandona o recarga, el archivo queda en Storage.
- Reutilizar la ruta durante un reintento evita algunas duplicaciones, pero no resuelve el abandono ni el cambio de archivo.
- Corrección propuesta: diseñar recuperación o limpieza con permisos controlados en el servidor. No dar permisos generales de borrado a visitantes. Requiere evaluar el backend actual antes de entregar una migración.

### 8. P2 — El fondo reaparece tras dejar vacía su configuración

- Archivos: `src/App.jsx:166` y `src/Sedes.jsx:46`.
- Las listas vacías activan el respaldo con fotos de sedes, igual que una configuración inexistente.
- Quitar todas las imágenes desde el editor no deja vacío el fondo público.
- Corrección propuesta: distinguir una lista vacía guardada de una clave ausente. Si el respaldo automático es intencional, el editor debe explicar ese comportamiento.

### 9. P2 — El encuadre local cambia aunque falle el guardado

- Archivo: `src/admin/AdminNosotros.jsx:260`.
- Se actualizan posiciones, fotos o logros en memoria antes de comprobar `persistirEnSupabase(objFinal)` en la línea 289.
- Ante un fallo, el editor muestra cambios que todavía no existen en la web. La alerta evita un falso mensaje de éxito, pero no revierte la vista local.
- Corrección propuesta: aplicar el nuevo estado después del guardado o identificarlo explícitamente como borrador pendiente.

## Comprobaciones

| Comprobación | Resultado |
| --- | --- |
| `npm run build` | Falló en `Sedes.jsx:122` |
| `npm run lint` | 11 errores, 0 advertencias |
| Importaciones de tema | Dos referencias a una exportación inexistente |
| Recorrido funcional y pruebas móviles | No completados: aplicación bloqueada por compilación |
| Guardados reales y acceso con roles | No ejecutados |
| Supabase actual | No consultado directamente; el CSV previo no confirma cambios posteriores |

Los 11 errores de ESLint incluyen sintaxis, variables sin uso y reglas de React en Dashboard, Eventos, Prospectos y SelectorHoras. El fallo de sintaxis es bloqueante; los restantes deben revisarse sin confundir avisos de calidad con fallos de ejecución demostrados.

## Mejoras que sí aparecen en el código

- Modal de pagos sin cuentas ficticias de respaldo, con Yape y Plin separados y contacto de la sede para el comprobante.
- Detalle público con precios faltantes diferenciados de cero y reservas desactivadas para sedes suspendidas.
- Varios guardados administrativos comprueban errores antes de anunciar éxito.
- Vista administrativa de postulaciones con enlaces temporales a CV privados, sujeta a las políticas reales de Supabase.
- La renovación exitosa de sesión del mismo usuario conserva el panel montado.

Estos puntos se comprobaron en código; no equivalen a una validación funcional completa ni a una certificación de permisos remotos.

## Orden recomendado

1. Resolver los dos bloqueos de carga.
2. Evitar sobrescritura tras fallos de lectura y respetar Cancelar.
3. Unificar precios y vigencia de promociones.
4. Resolver fondos vacíos, encuadres y recuperación de CV.
5. Repetir compilación, lint y pruebas de navegación, formularios y roles.

No se necesita SQL para corregir los bloqueos de compilación. La solución de limpieza de CV podría requerir cambios de backend y deberá acompañarse de sus scripts e instrucciones; no se ha aplicado ninguno en esta auditoría.
