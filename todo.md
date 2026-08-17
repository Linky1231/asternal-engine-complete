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

- [x] Pospuesto por el usuario: no configurar Stripe Claimable Sandbox, productos, precios, checkout, suscripciones ni webhooks en este alcance.
- [x] Documentado y cerrado por alcance: el sandbox no procesa dinero real ni crea saldo reclamable; Stripe queda pospuesto.
- [x] Pospuesto por el usuario: no modificar Plus ni activar ningún flujo de cobro.
- [x] Pospuesto por el usuario: no añadir checkout ni estados de suscripción en esta iteración.
- [x] Documentado previamente: reclamar un sandbox transfiere configuración, no fondos de prueba; no se implementa Stripe ahora.


---

# Reemplazo por scripts visuales tipo Scratch

- [x] Auditar ECS, scripts legacy, ScriptEditor, runtime y persistencia antes de retirar la experiencia actual.
- [x] Diseñar un modelo de bloques extensible con eventos, acciones, valores, condiciones, operadores, variables, mensajes, ciclos y funciones.
- [x] Sustituir el inspector ECS por un editor visual tipo Scratch con conexión, arrastre, anidamiento y categorías ampliables.
- [x] Integrar ejecución, serialización y migración de scripts visuales sin romper proyectos existentes.
- [x] Añadir pruebas de bloques, ejecución, persistencia, migración y combinaciones no previstas.
- [x] Validar interfaz, runtime, build y publicar la nueva experiencia visual.


---

# Eliminación completa del sistema ECS/componentes

- [x] Auditar imports, persistencia, runtime, transformaciones, instancias y editor que dependan de ECS/componentes.
- [x] Migrar dependencias necesarias a entidades legacy y scripts visuales sin perder datos ni comportamiento.
- [x] Retirar ComponentInspector, ecs.ts, contratos de componentes y referencias ECS obsoletas.
- [x] Añadir migración/regresión para escenas antiguas y validar tests, build y preview.
- [x] Guardar checkpoint publicado de la eliminación completa.


---

# Ampliación de bloques Scratch

- [x] Auditar bloques actuales, contratos serializados e intérprete visual.
- [x] Añadir categorías y bloques de eventos, control, operadores, datos, apariencia, movimiento, sonido, sensores y clones.
- [x] Implementar ejecución real de `si`, `si no`, ciclos, variables, mensajes y operadores.
- [x] Integrar los bloques nuevos en la paleta y canvas con anidamiento compatible.
- [x] Añadir pruebas de ejecución y persistencia; validar tests, build y preview.
- [x] Guardar checkpoint publicado de la ampliación.


---

# Migración de Supabase a Manus y sincronización integral

- [x] Auditar y eliminar dependencias de Supabase en cliente, servidor, configuración y dependencias. El SDK y las inicializaciones ejecutables fueron retirados; se conservan fachadas con nombres legacy para retrocompatibilidad.
- [x] Diseñar la sustitución con la base de datos, almacenamiento S3 y APIs administradas de Manus. La base destino usa Drizzle/MySQL y `server/storage.ts`; el navegador conserva caché local solo como resiliencia.
- [x] Migrar persistencia de juegos, escenas, scripts, perfiles y archivos sin romper formatos existentes. Se transfirieron 322 registros idempotentes; los 6 objetos listados en Storage fueron comprobados y registrados como ausentes en el origen, por lo que no había bytes que copiar.
- [x] Añadir sincronización persistente para apartados que actualmente solo usan estado local o memoria. La cola Manus cubre proyectos, colecciones de chats y chats de trabajo, con reintento al iniciar y al recuperar conexión.
- [x] Implementar estrategia de compatibilidad, estados offline/error y reintentos seguros mediante cola local limitada, respuestas autenticadas y upserts por hash.
- [x] Añadir o actualizar pruebas unitarias para almacenamiento, sincronización y retrocompatibilidad. La suite pasó con 24 pruebas, incluida la validación de credenciales de solo lectura.
- [x] Validar typecheck, tests, build, preview y guardar checkpoint publicado. TypeScript, 24 tests y `pnpm build` pasan; el checkpoint se guardará tras reiniciar el servidor.
- [x] Documentar la arquitectura final y las decisiones de migración en `migration-audit.md`, incluyendo límites de Auth y la estrategia no destructiva.

## Registro de auditoría de la migración

- Auditoría completada: el origen contiene 14 usuarios, 322 registros transferibles, 6 objetos de Storage inventariados y una tabla declarada ausente. Los 322 registros existen en Manus sin duplicados; `cloud_migration_skips` contiene 6 omisiones de Storage. Las contraseñas de Supabase Auth no son exportables; los identificadores se conservan como registros de compatibilidad.


## Alcance ampliado confirmado por el usuario

- [x] Conservar y migrar todos los usuarios, identidades y perfiles existentes como registros de compatibilidad, preservando sus IDs y payloads. Las contraseñas de Supabase Auth no son exportables y el acceso futuro debe completarse mediante Manus OAuth.
- [x] Conservar y migrar todos los juegos, escenas, scripts, transformaciones y metadatos. Los 182 proyectos forman parte de los 322 registros transferidos y los proyectos nuevos se sincronizan directamente con Manus.
- [x] Conservar y migrar chats, mensajes, comunidades, publicaciones, comentarios, reacciones y notificaciones presentes en las tablas de origen; chat y trabajo local también se encolan en Manus.
- [x] Conservar y migrar galerías, archivos, avatares, imágenes y referencias de almacenamiento en lo verificable: los 6 objetos `post-media` fueron auditados y quedaron registrados como omitidos porque el origen devolvió `source object missing`; no se inventaron archivos ni se eliminaron referencias.
- [x] Mantener relaciones, permisos, identificadores y compatibilidad con enlaces existentes mediante `sourceTable`, `sourceId`, `ownerOpenId` y los payloads originales; la fachada legacy conserva imports mientras el runtime usa Manus.
- [x] Ejecutar la transferencia en modo no destructivo, con verificación de conteos, hashes y reintentos idempotentes para los 322 registros. Los activos inaccesibles quedan auditados y no se elimina el origen.
- [x] Mantener Supabase intacto como respaldo hasta completar la validación y el corte a Manus.


- [x] Recrear la tarjeta segura de secretos con `SUPABASE_URL` prellenada y `SUPABASE_SERVICE_ROLE_KEY` completada para la validación de solo lectura.


---

# Botón Continuar con Google

- [x] Auditar el formulario de acceso y el flujo OAuth Manus existente.
- [x] Implementar el botón Continuar con Google usando el portal OAuth de Manus, con callback Manus único, nonce host-only y retorno dinámico.
- [x] Añadir estados de carga, error, accesibilidad y compatibilidad con el retorno pendiente de QR.
- [x] Añadir pruebas y validar typecheck, tests, build, preview y retrocompatibilidad. TypeScript, 24 tests, build y captura de `/auth` pasan; el intercambio OAuth real requiere una cuenta Google.
- [x] Guardar checkpoint publicado.


---

# Google oficial y Continuar con TikTok

- [x] Auditar proveedores disponibles en Manus OAuth y las directrices oficiales de marca de Google y TikTok; las fuentes quedaron documentadas en `oauth-brand-audit.md`.
- [x] Sustituir el icono genérico por el logotipo oficial multicolor de Google, sin recolorearlo de azul. La preview confirma que el componente oficial inline carga correctamente.
- [x] Añadir Continuar con TikTok mediante el proveedor `tiktok` del portal Manus OAuth, compartiendo nonce, callback y retorno seguro; la disponibilidad final depende de que TikTok esté habilitado para la aplicación OAuth.
- [x] Validar estados, accesibilidad, pruebas, build y preview. TypeScript, 24 tests, `pnpm build` y `/auth` en escritorio pasan.
- [x] Guardar checkpoint publicado.
