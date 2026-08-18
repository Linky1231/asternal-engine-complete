# Auditoría AI Slop — Asternal Engine

## Criterio de evaluación

La evaluación usa *AI Slop* como un problema de diseño, no como una acusación sobre el origen del código: una pantalla falla cuando repite una fórmula visual sin que ayude a crear, jugar, publicar o colaborar. Las señales contrastadas fueron superficies con profundidad decorativa, tarjetas excesivamente redondeadas o anidadas, jerarquía plana, etiquetas funcionales pequeñas y patrones de SaaS sin relación con el trabajo de un motor de juegos.[1][2]

## Hallazgos de la revisión de vistas

| Área observada | Señal encontrada | Consecuencia | Prioridad | Corrección propuesta |
| --- | --- | --- | --- | --- |
| Acceso y bienvenida | Tarjeta de acceso muy redondeada, halo de fondo y cuatro tarjetas de prestaciones idénticas. | La pantalla podría pertenecer a un producto SaaS genérico; la creación de juegos queda en segundo plano. | Alta | Reemplazar la cuadrícula repetitiva por una guía de inicio con lenguaje de “taller”: crear, probar y publicar; reducir profundidad decorativa y conectar el motivo de cuadrícula del editor. |
| Cabecera y navegación | El azul ya se reserva para la selección y CTA, lo cual es positivo, pero los iconos y contenedores suaves se repiten sin significado contextual. | El sistema pierde contraste entre navegar, ejecutar y crear. | Alta | Establecer tres niveles de acción: ruta, herramienta y acción de producción; conservar el gradiente sólo en acciones confirmatorias o activas. |
| Historial | Seis tarjetas métricas vacías, de igual peso, rodeadas por tarjeta principal y un estado vacío tenue. | Profundidad falsa, jerarquía escasa y una primera sesión que parece inacabada. | Alta | Aplanar el panel, sustituir estadísticas sin datos por una progresión de actividad y usar una llamada clara hacia jugar o explorar. |
| Editor | Es la vista más distintiva: canvas oscuro con rejilla, herramientas y objetos de juego. | Constituye la identidad que falta en el resto del producto. | Preservar | Tomar su vocabulario de superficies, rejilla y herramientas como origen del sistema, sin trasladar su densidad al área social. |
| Páginas protegidas no cargadas sin sesión | Feed, orbes, pintura, plus y búsqueda redirigen a acceso en la auditoría anónima. | No se puede dictaminar su densidad real con datos de sesión; no se deben inventar problemas. | Media | Auditar el código de componentes y validar las vistas autenticadas en la siguiente revisión con una sesión de prueba. |

## Dirección adoptada: Estudio de creación social

Asternal no debe parecer una landing de productividad con iconos intercambiables. Su patrón propio será el de un **estudio de creación social**: fondos claros y serenos para comunidad y acceso; rejilla y superficies operativas para creación; azul eléctrico como señal de estado o acción; y copy que habla de construir, probar, compartir y remixar. La interfaz dejará que el editor sea el momento visual más intenso y que las pantallas sociales prioricen contenido de jugadores, no decoración.

## Alcance de la primera corrección

1. Convertir la bienvenida y el acceso en una entrada de taller, manteniendo la autenticación actual intacta.
2. Revisar Historial para eliminar métricas sin valor y darle una progresión de primera actividad.
3. Consolidar reglas de radios, elevación, tipografía funcional y azul de marca para no reproducir el patrón en vistas futuras.

## Evidencia de la primera revisión de implementación

La captura de Acceso confirma que el valor del producto ya no descansa sobre cuatro tarjetas equivalentes: el recorrido de **Construye → Prueba → Comparte** crea una jerarquía única y la tarjeta de autenticación se redujo a una superficie operativa. La captura de Historial confirma que una cuenta sin actividad recibe un siguiente paso claro, en vez de seis métricas de cero. En ambas vistas, el degradado azul permanece limitado a un control activo o una acción principal; las demás superficies usan borde, tipografía y espacio.

La revisión anónima no pudo cargar las secciones autenticadas de Feed, Orbes, Galería, Plus, Perfil y Editor con datos reales. Esas zonas se conservaron para evitar cambios especulativos; el editor, en particular, se identificó como el ancla visual de mayor identidad y no se modificó.

La revisión móvil final de Historial confirma que el estado sin partidas ya no está encerrado en una tarjeta de gran tamaño: se presenta como una línea de registro con icono, título y una acción de exploración. La pantalla conserva una lectura vertical clara en 390 px, sin cortes ni desbordes.

## Referencias

[1] [Managed Code — AI in UI Design: Avoiding AI Slop](https://www.managed-code.com/blog-post/ai-slop-in-design)

[2] [Impeccable — Slop](https://impeccable.style/slop/)

[3] [The Conversation — What is AI slop?](https://theconversation.com/what-is-ai-slop-a-technologist-explains-this-new-and-largely-unwelcome-form-of-online-content-256554)

[4] [Figma — What Is a Design System](https://www.figma.com/blog/design-systems-101-what-is-a-design-system/)
