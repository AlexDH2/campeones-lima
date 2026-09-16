# Reglas del proyecto

Estas reglas fueron establecidas explícitamente por el usuario y se aplican a todo el proyecto.

## Preservar lo logrado

«Todo lo logrado no se puede cambiar a menos que te diga lo contrario».

Conservar las funcionalidades, el diseño, el contenido y el comportamiento existentes. Modificar únicamente lo que el usuario solicite o autorice; una solicitud concreta autoriza los cambios necesarios dentro de ese alcance. No aprovechar una tarea para introducir rediseños, refactorizaciones, eliminaciones o correcciones ajenas a lo solicitado. Los hallazgos de una auditoría no autorizan por sí solos su corrección.

## Entregar SQL para cambios en Supabase

«Cada cambio, si es que requiere un cambio en la base de datos (Supabase), me enviar también el SQL».

Cuando una modificación requiera cambios en la base de datos de Supabase, entregar también el script SQL correspondiente, completo y coherente con la implementación, preferiblemente en un archivo `.sql` del proyecto enlazado en la respuesta. Incluir las instrucciones necesarias para aplicarlo e indicar claramente si está pendiente de ejecución o si ya se ejecutó. Entregar el SQL no equivale a haberlo ejecutado. Si el cambio no requiere modificar la base de datos, indicarlo en el resumen de la entrega.
