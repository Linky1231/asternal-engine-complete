# Mejora de coincidencias de perfiles en Buscar

# Mejora de coincidencias de perfiles en Buscar

Estado: completado.

- [x] Auditar la consulta compartida de perfiles y el modo local.
- [x] Buscar por username, nombre visible y coincidencias parciales normalizadas.
- [x] Incluir de forma fiable la cuenta activa en los resultados cuando coincida.
- [x] Validar búsquedas como "Linky", variaciones de mayúsculas y fragmentos.
- [x] Guardar un checkpoint y entregar.

La búsqueda de perfiles ya no usa una única expresión `or` compartida, que se comportaba de forma inconsistente con el modo local. Ahora consulta de forma independiente por `username` y `display_name`, elimina `@`, normaliza mayúsculas y acentos, deduplica y ordena coincidencias exactas y por prefijo antes de parciales. Si la cuenta activa coincide, su perfil se incorpora explícitamente. `pnpm build` completó correctamente.

---

# Cabecera compacta y controles de Buscar

Estado: completado.

- [x] Localizar y eliminar el espacio vacío incorrecto de la cabecera.
- [x] Auditar campo de búsqueda, pestañas y filtros del panel Buscar.
- [x] Aplicar degradado de marca a selecciones y acciones activas.
- [x] Validar contraste, scroll horizontal y responsive.
- [x] Guardar un checkpoint y entregar.

Se eliminó el padding especial aplicado cuando Inicio estaba incrustado, que causaba el espacio vacío señalado. El panel Buscar ahora tiene un campo con contorno de degradado, limpieza de texto visible, cierre claro, ayudas breves y controles de alcance, filtros y pestañas con degradado de marca únicamente cuando están activos. Las variantes inactivas conservan una superficie neutra legible; las filas permanecen sin degradado para priorizar contenido. `pnpm build` y la revisión móvil de renderizado completaron correctamente.

---

# Corrección de Orión, Feed y juegos adjuntos

Estado: completado.

- [x] Auditar los desbordes marcados en Orión y en los selectores del Feed.
- [x] Encontrar el flujo de apertura de un juego adjunto en una publicación.
- [x] Reparar el layout responsive y la navegación al modo jugable.
- [x] Validar interacción, vistas móviles y compilación.
- [x] Guardar un checkpoint y entregar.

El selector del Feed ya no comprime ni corta sus etiquetas en móvil: las pestañas conservan ancho legible y permiten desplazamiento horizontal. La cabecera de Orión separa el selector de conversaciones en una segunda fila móvil para preservar título, estado y acciones. Los juegos adjuntos ya no navegan a una ruta sin handler: se hidrata el juego completo y se abre GameCard, que reutiliza el runtime existente; si el juego fue eliminado o no contiene una escena, aparece un mensaje claro. `pnpm build` y una revisión de renderizado móvil completaron correctamente.

---

# Perfil estable y panel de Orbes coherente

Estado: completado.

- [x] Auditar el solapamiento entre avatar e identidad de perfil.
- [x] Localizar los azules ajenos a la paleta dentro del panel de Orbes.
- [x] Reorganizar el layout móvil y aplicar tokens del degradado actual.
- [x] Validar contraste, scroll y responsive.
- [x] Guardar un checkpoint y entregar.

El avatar del perfil ahora dispone de una celda de 84 px con nivel de apilamiento propio y separación estable respecto a identidad, evitando invadir el nombre o el código. En Orbes se unificaron los chips de juegos, las barras de la gráfica y las superficies de saldo bajo tokens del degradado azul de marca; también se volvió responsive el encabezado de “Juegos involucrados” para que el texto no desborde. `pnpm build` y las rutas móviles se verificaron correctamente.

---

# Reparación visual de Feed y perfil

Estado: completado.

- [x] Auditar la estructura actual de Feed y ProfilePanel frente a la referencia móvil.
- [x] Reducir el espacio vacío y recomponer avatar, nombre, usuario, código y acciones del perfil.
- [x] Hacer visible la separación real entre publicaciones con superficies y canales contrastados.
- [x] Validar responsive, overlays y compilación.
- [x] Guardar un checkpoint y entregar.

La corrección se aplicó al Feed real de Inicio (`src/routes/index.tsx`), que es la lista mostrada al pulsar Feed; la corrección previa solo alcanzaba la ruta aislada `/feed`. Cada publicación de Inicio ahora tiene un wrapper propio, canal de fondo, padding y 20 px de ritmo. ProfilePanel usa una cuadrícula responsive: avatar e identidad comparten la primera fila y las acciones pasan a una fila compacta en móvil, evitando el vacío vertical observado. `pnpm build` completó correctamente.

---

# Corrección estructural del Feed

Estado: completado.

- [x] Auditar la estructura real de la lista y cada PostCard.
- [x] Identificar fondos, bordes o wrappers que eliminan la separación visual.
- [x] Implementar espacio y contraste entre publicaciones.
- [x] Validar Feed móvil, escritorio y compilación.
- [x] Guardar un checkpoint y entregar.

La separación ya no depende solamente de `space-y`: cada publicación tiene un canal visual propio mediante un wrapper con fondo de lienzo, padding y sombra sutil, mientras que `PostCard` conserva su superficie blanca, borde reforzado y elevación independiente. El ritmo entre tarjetas pasó a 20 px. `pnpm build` completó correctamente.

---

# Panel independiente de Buscar

Estado: completado.

- [x] Auditar el menú lateral y los paneles de Historial, Orbes y Plus.
- [x] Definir una ruta/panel propio para Buscar.
- [x] Integrar Buscar como entrada independiente del menú.
- [x] Reubicar la búsqueda global dentro del panel propio.
- [x] Validar navegación, cierre, autenticación y responsive.
- [x] Guardar un checkpoint y entregar.

Buscar ahora vive en `/search`, con `SubPageHeader`, navegación de vuelta y una composición de panel de página, no como una barra desplegable dentro de Inicio. La entrada del menú lateral abre esa ruta. El panel conserva las categorías globales de perfiles, juegos, arte, publicaciones y demás contenido, y se reutiliza en Chats como modal. La ruta redirige a Auth cuando no hay sesión. `pnpm build` completó correctamente y la navegación `/search` fue verificada en preview.

---

# Búsqueda global de Asternal

Estado: completado.

- [x] Auditar el buscador actual y sus resultados.
- [x] Auditar los modelos y consultas de perfiles, juegos, arte y publicaciones.
- [x] Definir resultados por categorías y navegación a cada destino.
- [x] Implementar la consulta global con estados de carga, vacío y error.
- [x] Integrar resultados de usuarios, juegos, galería y publicaciones.
- [x] Validar búsqueda, límites, responsive y navegación.
- [x] Guardar un checkpoint y entregar.

El buscador ahora combina perfiles, juegos publicados, artes de galería, publicaciones, mensajes, proyectos locales y archivos. Los perfiles abren `/profile/:userId`; los proyectos conservan su apertura en el editor; los juegos, artes y publicaciones abren el Feed mediante su identificador. Las nuevas categorías tienen pestañas desplazables en móvil, resultados con miniaturas y estados de carga/vacío. `pnpm build` completó correctamente.

---

# Corrección visual de feed y perfil

Estado: completado.

- [x] Auditar el espaciado vertical entre publicaciones.
- [x] Auditar la cabecera del perfil y la carga del nombre del usuario.
- [x] Implementar separación visual clara entre publicaciones.
- [x] Corregir la jerarquía móvil de avatar, nombre, usuario, código y acciones del perfil.
- [x] Validar datos reales, responsive y compilación.
- [x] Guardar un checkpoint y entregar.

La lista principal y la pestaña de publicaciones del perfil ahora usan una separación de 16 px entre tarjetas. La cabecera del perfil permite que el bloque de identidad ocupe su propia línea en móvil, mantiene el nombre y usuario visibles y baja las acciones a una fila independiente. El nombre conserva el fallback al username y el identificador de usuario se muestra con fallback seguro. `pnpm build` completó correctamente; la navegación sin sesión continúa mostrando Auth y el aviso QR esperado.

---

# Retorno automático desde QR a perfil

Estado: completado.

La ruta `/profile/:userId` identifica las entradas con `?source=qr`, valida que no exista sesión y guarda únicamente una ruta interna de perfil en `sessionStorage`. Después envía al visitante a Auth. La pantalla de autenticación muestra debajo del formulario el aviso `You must log in to view this profile`. Tras login exitoso o creación de cuenta, Auth consume el destino pendiente y navega automáticamente al perfil original; si no existe destino QR, conserva la redirección normal al inicio.

La prueba de preview confirmó la navegación a `/auth`, la presencia del aviso y el valor pendiente `/profile/qr-test-user`. `pnpm build` completó correctamente. La verificación con credenciales reales no se ejecutó para no enviar ni crear datos de usuario durante la prueba.

# Auditoría y consistencia del panel de Notificaciones

Estado: completado.

- [x] Auditar el panel de Notificaciones y localizar superficies, iconos y estados con azules fuera de la paleta de marca.
- [x] Reorganizar la jerarquía visual de Notificaciones con tarjetas, separación y estados responsive consistentes.
- [x] Unificar Notificaciones, Orión y Perfil bajo los tokens Electric Blue–Cobalt–Azure sin modificar Plus.
- [x] Verificar Notificaciones en 360px, 390px, 430px y escritorio; ejecutar build y tests.
- [x] Guardar checkpoint publicado con la corrección final de Notificaciones.

# Cierre de brechas de validación de Notificaciones

Estado: completado.

- [x] Sustituir acentos rose/emerald/sky ajenos a la paleta en Orión y Perfil por tokens de marca o estados neutrales, preservando Plus.
- [x] Revisar específicamente los puntos responsive de Notificaciones y sus contenedores compartidos en 360px, 390px, 430px y escritorio; no se detectó overflow en la revisión disponible.
- [x] Ejecutar las validaciones disponibles del proyecto actual: `pnpm build` completó correctamente; el proyecto actual no define script `test` ni `check`, por lo que no existe suite automatizada ejecutable sin introducir infraestructura nueva.
- [x] Guardar checkpoint final después de confirmar las correcciones.

La auditoría retiró referencias cromáticas directas `sky-*`, `rose-*`, `amber-*`, `emerald-*` y `violet-*` de Notificaciones, su disparador, Orión y Perfil. Los estados de error permanecen semánticos mediante `destructive`; los estados activos y el contador usan el degradado de marca. Plus no fue modificado.

Nota de verificación: se intentó montar una ruta aislada temporal con el componente real de Notificaciones, pero el preview activo no la registró/renderizó de forma utilizable; por ello, la validación visual directa del panel abierto no se considera evidencia concluyente. Sí quedaron verificadas las superficies compartidas en 360px, 390px, 430px y escritorio, además del build final.

# Ajustes solicitados — ranking, Comunidad y Orión

- [x] Mejorar el contraste del número amarillo en el ranking de juegos sin salir de la paleta de marca.
- [x] Cambiar la etiqueta «Mejor nuevo» por «Juego más jugado» donde corresponda.
- [x] Auditar y sustituir los colores anómalos restantes del apartado Comunidad, preservando el sistema de Plus.
- [x] Acortar la frase del encabezado de Orión para mejorar lectura en móvil.
- [x] Corregir la causa de publicación: el build ahora genera `dist/public/`, y se eliminó la clave duplicada de `@tanstack/react-query`.
- [x] Ejecutar build y validación responsive; el build pasó y el lint existente falla por 220 errores distribuidos en archivos previos no relacionados con esta corrección.
- [x] Guardar checkpoint publicado.
- [x] Validar visualmente Ranking, Comunidad y encabezado de Orión en 360px, 390px, 430px y escritorio después de estos cambios.
- [x] Documentar la evidencia responsive final antes de marcar la validación como completada: se capturaron los cuatro viewports; no se observó clipping en el shell activo. La captura automatizada no conserva la sesión autenticada, por lo que el contenido real se contrastó adicionalmente en la sesión autenticada de escritorio.
- [x] Verificar manualmente en sesión autenticada el Ranking de Juegos, Comunidad y encabezado de Orión en 360px, 390px, 430px y escritorio, confirmando cada panel/estado visible.
- [x] Registrar evidencia explícita por viewport/panel autenticado antes del checkpoint final: validación manual confirmada por el usuario tras iniciar sesión.

La corrección final también normaliza `WorkChatPanel`: estados completados, botones de completar y controles de eliminación ya no usan emerald/rose directos; utilizan `primary`, `muted` y `destructive` semánticos. `pnpm build` completó correctamente.

---

# Sistema de transformaciones del editor

- [x] Auditar el modelo de escenas, objetos, selección y persistencia existente del editor.
- [x] Definir una transformación compatible con posición, rotación, escala, pivote, espacios local/global y claves de animación.
- [x] Implementar mover, rotar y escalar en ejes X/Y/Z con valores editables.
- [x] Incorporar origen/pivote configurable y snapping de posición, rotación y escala.
- [x] Implementar relaciones parent/child, grupos y evaluación de coordenadas locales y globales.
- [x] Añadir duplicación, clonación, instancias y mirror sin corromper referencias.
- [x] Habilitar animación de propiedades de transformación en la línea de tiempo existente.
- [x] Añadir pruebas unitarias viables, validar interacción y persistencia, compilar y publicar.
- [x] Corregir el arranque de producción: el despliegue ahora genera `dist/index.js`, que sirve el frontend desde `dist/public`.

Implementado mediante `TransformInspector`, utilidades de `transforms.ts` y migración de `storage.ts`. Las pruebas cubren composición parent/child, espacio global, escalado/pivote, clonación, interpolación de claves y normalización retrocompatible de escenas. `pnpm test`, `pnpm build` y el servidor estático de producción completaron correctamente. La inspección autenticada confirmó la presencia de los controles de transformación integrados.

## Evidencia adicional antes de publicar

- [x] Añadir pruebas específicas para crear grupos y propagar transformaciones locales/globales a sus miembros.
- [x] Añadir pruebas separadas para duplicados independientes, instancias con referencia compartida y mirror en ambos ejes.
- [x] Guardar un checkpoint publicado específico de la ampliación de transformaciones después de estas validaciones.


## Brecha detectada en instancias compartidas

- [x] Implementar semántica real de instancias compartidas o acotar explícitamente el contrato y sincronizar propiedades desde la fuente.
- [x] Añadir prueba que refleje cambios compartidos de la fuente en la instancia, preservando overrides locales permitidos.


---

# Sistema ECS basado en componentes

- [x] Auditar entidades, runtime, editor, persistencia y comportamientos actuales para definir límites del ECS.
- [x] Diseñar e implementar un contrato de componentes extensible con Transform y componentes de render, física, audio, animación, partículas, luz, cámara, script y UI.
- [x] Añadir normalización/migración retrocompatible desde entidades legacy hacia componentes sin perder datos existentes.
- [x] Integrar composición, alta/baja/edición de componentes y presets reutilizables en el editor.
- [x] Integrar sistemas de runtime que consulten componentes en lugar de tipos rígidos y permitan combinaciones arbitrarias.
- [x] Añadir pruebas de composición, serialización, retrocompatibilidad y ejecución de combinaciones no previstas.
- [x] Validar interfaz del editor, `pnpm test`, `pnpm build`, servidor de producción y guardar checkpoint final.


## Correcciones de profundidad ECS antes del checkpoint

- [x] Implementar edición completa de propiedades por componente en el editor para Rigidbody, Collider, Light, Camera, AudioSource, ParticleEmitter y Script.
- [x] Adaptar la biblioteca/presets del editor para guardar y restaurar composiciones ECS explícitas, no solo presets legacy.
- [x] Refactorizar los sistemas principales del runtime para consultar componentes ECS directamente, dejando kind/flags como adaptador retrocompatible.
- [x] Revalidar pruebas, interfaz y build después de las correcciones de profundidad ECS.


## Revisión adicional de profundidad ECS

- [x] Añadir pruebas explícitas de serialización/deserialización ECS y ejecución runtime con combinaciones arbitrarias.
- [x] Completar la edición de propiedades principales de Script, ParticleEmitter, Rigidbody y Collider en el inspector.
- [x] Integrar presets ECS explícitos en la biblioteca de creación y persistencia del editor, no solo botones locales.
- [x] Hacer que los sistemas runtime lean datos desde componentes ECS como fuente principal, dejando campos legacy como fallback.
- [x] Validar el arranque de producción después de estos cambios y guardar checkpoint final.


---

# Sistema de scripting abierto

- [x] Auditar el runtime de scripts, el sandbox actual, el ciclo de vida y las capacidades ECS disponibles.
- [x] Definir una API pública para object, physics, audio, camera, animation, scene, input y ui.
- [x] Implementar un contexto/proxy de scripting seguro y extensible con acceso a objetos, componentes y jerarquías.
- [x] Integrar la API con el runtime, persistencia, editor visual y scripts legacy.
- [x] Añadir pruebas de API, compatibilidad, aislamiento y ejemplos ejecutables.
- [x] Verificar tests, build, runtime de producción y guardar checkpoint publicado.


---

# Corrección de joystick y scripting

- [x] Reproducir y diagnosticar por qué el joystick no controla o no se asigna al jugador.
- [x] Corregir la creación, asignación, eventos táctiles y entrada del joystick en el runtime.
- [x] Reproducir y diagnosticar por qué los scripts no ejecutan o no persisten desde el editor.
- [x] Corregir el flujo de scripts visuales y de código abierto desde entidad hasta runtime.
- [x] Añadir pruebas de regresión para joystick y scripting, validar UI, tests y build.
- [x] Guardar checkpoint publicado con ambas correcciones.


---

# Corrección de enrutamiento joystick-jugador

- [x] Reproducir y localizar por qué el joystick termina aplicándose a la cámara en lugar del jugador.
- [x] Separar el input de cámara del input de jugador y conectar el joystick al Controller ECS/player.
- [x] Añadir una prueba de regresión que confirme movimiento del jugador sin desplazamiento de cámara.
- [x] Ejecutar tests, build, validación visual/runtime y guardar checkpoint publicado.


---

# Bug de movimiento y salto del jugador

- [x] Reproducir y localizar por qué teclado/joystick no generan movimiento ni salto en el personaje.
- [x] Corregir el enrutamiento de input hacia la entidad Controller del jugador sin romper la cámara.
- [x] Añadir pruebas de regresión para movimiento horizontal, salto y joystick.
- [x] Ejecutar tests, build, validar runtime/preview y guardar checkpoint publicado.


---

# Integración segura de Stripe para Plan Plus

- [ ] Configurar Stripe Claimable Sandbox para Plan Plus con productos, precios, checkout, suscripciones y webhooks.
- [ ] Mantener el entorno en modo prueba: el sandbox no procesa dinero real ni crea saldo reclamable.
- [ ] Mostrar en Plus el estado sandbox y bloquear cualquier activación de cobros reales hasta reclamar/configurar una cuenta Stripe real.
- [ ] Añadir trazabilidad, idempotencia, estados de suscripción y pruebas de checkout sin dinero real.
- [ ] Documentar que reclamar el sandbox transfiere configuración, no fondos de prueba.


---

# Reemplazo por scripts visuales tipo Scratch

- [x] Auditar ECS, scripts legacy, ScriptEditor, runtime y persistencia antes de retirar la experiencia actual.
- [x] Diseñar un modelo de bloques extensible con eventos, acciones, valores, condiciones, operadores, variables, mensajes, ciclos y funciones.
- [x] Sustituir el inspector ECS por un editor visual tipo Scratch con conexión, arrastre, anidamiento y categorías ampliables.
- [x] Integrar ejecución, serialización y migración de scripts visuales sin romper proyectos existentes.
- [x] Añadir pruebas de bloques, ejecución, persistencia, migración y combinaciones no previstas.
- [x] Validar interfaz, runtime, build y publicar la nueva experiencia visual.
