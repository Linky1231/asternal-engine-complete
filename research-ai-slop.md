# Investigación: AI Slop y diseño genérico

## Fuente 1 — Managed Code

URL: https://www.managed-code.com/blog-post/ai-slop-in-design

La fuente caracteriza el AI Slop de interfaz como el resultado de una dirección vaga que activa patrones estadísticamente frecuentes: productos “modernos” o “limpios” terminan visualmente intercambiables. Destaca cuatro señales operativas: paletas frías usadas como sustituto de identidad, sombras y desenfoques incoherentes, jerarquías que compiten entre sí y ausencia de reglas explícitas para espaciado, tipografía y elevación. La corrección propuesta es sistematizar decisiones mediante tokens, reglas de espaciado, restricciones tipográficas y una escala de profundidad documentada.

Aplicación inicial a Asternal: no se debe eliminar el azul de marca por sí mismo; se debe reservar para acciones y estados con significado, reducir decoración que no explica una función y reforzar una gramática específica de motor social (crear, jugar, colaborar y aprender).

## Fuente 2 — Impeccable, catálogo Slop

URL: https://impeccable.style/slop/

El catálogo enumera patrones reconocibles de interfaces producidas por defecto: degradados o halos aplicados a todo, exceso de *glassmorphism*, borde fino junto con sombra amplia, tarjetas demasiado redondeadas, icono dentro de una baldosa encima de cada título, textos funcionales demasiado pequeños, jerarquía tipográfica plana, rejillas de tarjetas idénticas y tarjetas anidadas. También recomienda diferenciar espaciado dentro de un grupo y entre grupos, limitar la longitud de línea, evitar acentos decorativos sin significado y usar transiciones de salida suaves en lugar de rebotes elásticos.

Aplicación inicial a Asternal: conservar el degradado únicamente para confirmación de selección o creación; aplanar contenedores sin pérdida de agrupación; convertir acciones en herramientas con contexto; aumentar tamaños mínimos de etiqueta; y usar composición de estudio/herramienta, no el patrón de tarjeta de SaaS genérico.

## Fuente 3 — The Conversation

URL: https://theconversation.com/what-is-ai-slop-a-technologist-explains-this-new-and-largely-unwelcome-form-of-online-content-256554

La explicación académica utiliza *AI Slop* para el contenido de calidad baja o media creado con IA sin atención suficiente a exactitud o calidad. El concepto no equivale a “todo uso de IA”; identifica el resultado rápido, repetitivo y poco cuidado que desplaza aportes útiles. Trasladado al diseño de software, una pantalla se convierte en AI Slop cuando repite fórmulas reconocibles sin atender la tarea, el contexto y la identidad particular de la persona que la usa.

## Fuente 4 — Figma, Design Systems 101

URL: https://www.figma.com/blog/design-systems-101-what-is-a-design-system/

La guía presenta el sistema de diseño como un conjunto de bloques y estándares que mantiene coherencia entre experiencias. Para Asternal, la conclusión no es homogeneizar todas las vistas: el sistema debe definir qué es estable —tipografía, contraste, controles, espaciado, elevación y estados— y permitir que el editor, la comunidad y la creación de juegos tengan composiciones distintas porque cumplen tareas distintas.

## Principio de trabajo resultante

La auditoría separará defectos de producción de preferencias estéticas. Se eliminarán patrones genéricos sólo cuando oculten la tarea, reduzcan legibilidad, creen profundidad falsa, repitan decoración o borren la identidad de motor social de Asternal. La alternativa será una dirección de “estudio de creación”: superficies sobrias, herramientas explícitas, azul eléctrico reservado a confirmaciones y rutas activas, texto legible y densidad variable según el trabajo.
