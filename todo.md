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

---

# Corrección de retorno Google y limpieza del acceso

- [x] Auditar el callback OAuth y el destino posterior para resolver el retorno detenido tras Google. El fallo era que la publicación estática no atendía `/api/oauth/callback`.
- [x] Corregir la redirección post-OAuth preservando el retorno QR seguro y la sesión Manus. El artefacto publicado incorpora ahora el servidor Manus OAuth y el callback responde con la validación esperada de `code` y `state`.
- [x] Eliminar el botón Continuar con TikTok y el código de proveedor que quede sin uso.
- [x] Eliminar el bloque bajo ACCEDER: recuperación de contraseña, aviso de sincronización y enlace de soporte.
- [x] Validar flujo, accesibilidad, pruebas, build, preview móvil y guardar checkpoint publicado. El servidor de producción inicia, `/api/oauth/callback` responde 400 sin parámetros —comportamiento esperado—, 25 tests pasan y el diseño móvil fue revisado.

# Reparación del retorno OAuth de Google

- [x] Corregir retorno de Google: confiar en proxy, alinear cookies y conectar la sesión Manus con la autenticación activa del frontend.
- [x] Verificar redirección OAuth en una ruta válida de TanStack Router y cubrirla con regresiones.
- [x] Ejecutar pruebas, build y revisión end-to-end del login Google.

# Corrección del 404 tras login Google

- [x] Auditar la ruta de inicio real y el fallback de TanStack Router tras `/api/oauth/callback`.
- [x] Corregir la redirección OAuth y asegurar que `/` resuelva a la pantalla de inicio en producción.
- [x] Validar el flujo en móvil, pruebas y build antes de publicar.

# Corrección del callback OAuth sin parámetros

- [x] Auditar el launcher de Google, la URL de autorización y la validación del callback.
- [x] Evitar que un callback incompleto muestre JSON crudo y devolver una salida segura hacia Auth.
- [x] Probar el callback incompleto, el flujo normal y publicar la corrección.

# Autenticación Google independiente

- [x] Evaluar la integración OAuth de Google independiente y las credenciales necesarias.
- [x] Retirar el flujo Manus del botón Google para no mostrar una identidad ajena como si fuera Google.
- [x] Implementar la alternativa aprobada y validar que la sesión permanezca dentro de Asternal.

# Validación final Google OAuth — cancelada por decisión del usuario

- [x] Cancelado: confirmar la URL de autorización Google.
- [x] Cancelado: verificar el retorno autenticado de Google.
- [x] Cancelado: publicar la integración Google validada.

# Publicación de backend OAuth — cancelada por decisión del usuario

- [x] Cancelado: publicar rutas OAuth Google bajo `/api`.
- [x] Cancelado: verificar la ruta de inicio OAuth Google.

# Credenciales Google propias de Asternal — canceladas por decisión del usuario

- [x] Cancelado: reemplazar el cliente OAuth de Google.
- [x] Cancelado: validar el consentimiento Google de Asternal.

# Retirada de inicio de sesión Google

- [x] Eliminar el botón, mensajes y launcher de Google de la pantalla de acceso.
- [x] Eliminar rutas, verificación y pruebas OAuth de Google sin afectar el inicio local por usuario/correo y contraseña.
- [x] Ejecutar pruebas, build y verificación visual del formulario de acceso simplificado.

# Rediseño del panel de notificaciones

- [x] Auditar la estructura, estados, interacción y coherencia visual del panel de notificaciones actual.
- [x] Rediseñar la cabecera, filtros, grupos, tarjetas, estados vacíos y acciones con la paleta de Asternal.
- [x] Validar responsividad, accesibilidad, pruebas y build antes de publicar.

# Rediseño integral del buscador

- [x] Auditar la pantalla Buscar, sus consultas, filtros, estados y problemas de interfaz actuales.
- [x] Reestructurar la experiencia de descubrimiento: cabecera, buscador, filtros, secciones y tarjetas de resultados.
- [x] Refinar estados de inicio, carga, vacío y error, además de accesibilidad y comportamiento móvil.
- [x] Validar resultados reales, pruebas, build y revisión visual antes de publicar.

# Corrección de perfil y navegación de Inicio

- [x] Auditar el solapamiento de avatar, nombre, usuario y código en la cabecera de perfil señalada.
- [x] Reorganizar la identidad del perfil para separar portada, avatar, acciones y metadatos con una jerarquía estable.
- [x] Mejorar la navegación principal de Inicio para priorizar destinos, estado activo y adaptación móvil.
- [x] Validar interacción, responsividad, pruebas y build antes de publicar.

# Restauración del acceso de graduado — descartada tras aclaración del usuario

- [x] Descartado: localizar y restaurar el acceso de graduado; la solicitud se refería al degradado superior.
- [x] Descartado: integrar el acceso de graduado en la cabecera.
- [x] Descartado: validar el acceso de graduado.

# Restauración del degradado superior

- [x] Revisar los acentos de degradado actuales de la cabecera y navegación de Inicio.
- [x] Restaurar un degradado superior sutil, coherente y legible.
- [x] Validar contraste, responsive, pruebas y build antes de publicar.

# Corrección de panel superpuesto y botón Crear móvil

- [x] Auditar por qué el panel de notificaciones muestra contenido de Inicio y se superpone a la navegación.
- [x] Aislar el panel de notificaciones y corregir su capa, scroll y fondo en móvil.
- [x] Reubicar el botón Crear respetando las áreas seguras y controles del sistema móvil.
- [x] Validar panel, navegación, responsive, pruebas y build antes de publicar.

# Degradado activo y modo Voz de Orión

- [x] Restaurar el degradado azul como estado activo de los botones de navegación y controles principales, sin aplicarlo como franja superior.
- [x] Auditar el chat Orión, sus respuestas y los patrones de captura/reproducción de audio existentes.
- [x] Implementar el modo Voz con conversación por turnos, micrófono, síntesis femenina y respuestas concisas.
- [x] Incluir estados de permiso, escucha, pensamiento, habla, pausa y compatibilidad sin voz.
- [x] Validar accesibilidad, pruebas, build y comportamiento móvil antes de publicar.

Orión incorpora ahora un activador de Voz en la cabecera y otro en el compositor. Al activar el modo, Orión emite un saludo, escucha por turnos mediante la API de reconocimiento del navegador, genera una respuesta con límite de 170 tokens e instrucciones de dos frases breves, y la reproduce con la voz española femenina disponible de mayor prioridad. La tarjeta de estado comunica si Orión está hablando, escuchando, pensando o si el navegador no ofrece las APIs necesarias; se puede detener en cualquier momento. La navegación principal de Inicio aplica `grad-brand` dentro del destino seleccionado, sin una franja decorativa en la cabecera. Vitest pasó con 33 pruebas y la compilación de producción completó correctamente.

---

# Auditoría y corrección de patrones AI Slop

- [x] Investigar el término AI Slop, sus señales visuales y los patrones de diseño genérico de constructores de aplicaciones.
- [x] Auditar las vistas de Asternal para localizar jerarquías, decoraciones, controles y vacíos que parezcan genéricos, incoherentes o poco intencionales.
- [x] Definir una dirección de diseño propia para un motor de videojuegos que también es red social, sin modificar las funciones del motor.
- [x] Reemplazar los patrones prioritarios detectados por interfaces más específicas, legibles y consistentes.
- [x] Validar capturas, accesibilidad, pruebas y compilación antes de publicar.

La auditoría y sus referencias quedaron documentadas en `research-ai-slop.md` y `ai-slop-audit.md`. La primera corrección elimina la estructura de tarjeta reiterada en la entrada y en Historial: Acceso ahora explica el flujo real de construir, probar y compartir; Historial pasa de seis métricas vacías a una bitácora que guía la primera actividad y usa registros continuos cuando ya existen datos. La lógica de autenticación, datos, editor y motor permanece sin cambios.

---

# Actualización desde el repositorio del usuario

- [x] Inspeccionar la nueva versión de `Linky1231/asternal-engine` y comparar sus cambios con el proyecto desplegado.
- [x] Integrar los cambios compatibles sin sobrescribir la infraestructura, datos ni configuración de Manus.
- [x] Validar pruebas, compilación y vista previa antes de publicar la actualización transferida.

La transferencia prioriza la novedad funcional de la versión externa: los juegos se abren ahora en una superficie dedicada y sus jugadores pueden apoyar a creadores con orbes. La transacción valida sesión, juego, propiedad, saldo y cantidad antes de actualizar las cuentas y registrar ambos movimientos; se mantiene el adaptador de datos local existente para no volver a añadir servicios externos. La validación completó 37 pruebas, compilación de producción y una revisión de renderizado sin errores visibles.

---

# Transferencia literal de la versión nueva

- [x] Crear un respaldo recuperable del estado publicado actual.
- [x] Reemplazar íntegramente los archivos del proyecto por la última versión de `Linky1231/asternal-engine`.
- [x] Conservar y reconciliar solo los adaptadores imprescindibles de ejecución y publicación del entorno.
- [x] Validar la compilación, las pruebas disponibles y la publicación de la transferencia completa.

La versión literal compila correctamente con `tsc -b && vite build` y se verificó en la vista de desarrollo en escritorio y móvil. El repositorio transferido no declara una orden de pruebas automatizadas; por la solicitud de conservar el código literal no se añadió una suite ajena. La única adaptación aplicada fue de entorno: habilitar el binario de compilación e instalar las dos dependencias ya importadas por el código (`react-router` y `@zumer/snapdom`).

---

# Asistente con IA de Manus

- [x] Localizar y retirar la integración actual de YB del asistente.
- [x] Restaurar el adaptador seguro de servidor para invocar los modelos integrados de Manus.
- [x] Conectar el asistente a Manus sin exponer credenciales en el cliente.
- [x] Validar el envío de mensajes, compilación y publicación.

YB fue retirado de imports, configuración y dependencias activas. Orión ahora llama únicamente a `/api/orion/chat`, una ruta propia que se ejecuta en el servidor y usa el modelo integrado de Manus disponible, sin enviar la clave al navegador. Se verificó una respuesta real del servicio (HTTP 200), junto con 2 pruebas unitarias y una compilación de producción correcta.

---

# Incidente: dominio publicado devuelve 404

- [x] Diagnosticar el error 404 en la ruta principal del dominio publicado.
- [x] Corregir el servidor y fallback de archivos estáticos para la aplicación SPA.
- [x] Verificar el dominio en producción y publicar la corrección.

Las primeras comprobaciones devolvieron `Not Found` mientras el nuevo artefacto se propagaba. Tras la publicación definitiva, la consulta sin caché devolvió HTTP 200 y la verificación visual de `https://asternaleng-dvlqmnye.manus.space/?verified=c2c5a7e5` muestra la pantalla de acceso de Asternal. El dominio ya no responde 404.

---

# Incidente: preview bloqueado y publicación sin directorio esperado

- [x] Corregir el bloqueo del host de la vista previa en Vite.
- [x] Restaurar la salida del frontend dentro de `dist/public` para el servidor de producción.
- [x] Verificar preview, build y publicación en producción.

---

# Sistema visual glass Apple-like para Asternal

- [x] Analizar la referencia y traducir sus principios de materialidad sin copiar su paleta ni su contenido.
- [x] Auditar botones, campos, tarjetas, paneles y navegación para localizar los estilos compartidos.
- [x] Aplicar superficies translúcidas, bordes luminosos, desenfoque y elevación suave con los colores actuales de Asternal.
- [x] Integrar estados de foco, hover, presión y reducción de movimiento accesibles.
- [x] Verificar la interfaz en escritorio y móvil, pruebas y compilación antes de publicar.

---

# Intensificación del acabado glass

- [x] Identificar los controles y superficies que aún se perciben planos u opacos.
- [x] Reforzar el vidrio de los botones azules con capa translúcida, brillo especular, borde iluminado y profundidad visible.
- [x] Extender el mismo material pronunciado a paneles, campos, tarjetas, pestañas y menús compartidos.
- [x] Validar contraste, respuesta táctil, escritorio, móvil, pruebas y compilación antes de publicar.

---

# Degradado azul constante y animaciones fluidas

- [x] Localizar todos los estados de botones y controles azules que alteran el degradado al interactuar.
- [x] Aplicar un único degradado azul constante a los estados normal, hover, foco y presión.
- [x] Optimizar únicamente animaciones para que usen propiedades de composición y respeten movimiento reducido.
- [x] Validar consistencia visual, fluidez, pruebas y compilación antes de publicar.

---

# Revisión integral de interfaz y Plus

- [x] Reducir el brillo excesivo y ordenar los controles del menú principal desplegable.
- [x] Eliminar la duplicación del encabezado en el apartado Eventos.
- [x] Unificar el icono de juegos sin portada entre Inicio y la pantalla individual de juego.
- [x] Aplicar el degradado y material glass de Asternal al apartado Plus sin alterar sus funciones.
- [x] Auditar y corregir inconsistencias visuales, textos genéricos, párrafos y acciones sin propósito en las áreas revisadas.
- [x] Validar la aplicación completa en escritorio y móvil, con pruebas y compilación antes de publicar.

---

# Restauración del azul de marca

- [x] Identificar y restaurar el tono y degradado azul originales de Asternal.
- [x] Conservar el material glass nuevo sin sustituir ni apagar el color de marca.
- [x] Verificar controles, Plus, vista previa, pruebas y compilación antes de publicar.

---

# Atenuación suave del turquesa de Plus

- [x] Reducir la luminosidad del degradado turquesa de Plus sin cambiar Azure Drift.
- [x] Preservar el acabado glass, el contraste y las funciones premium de Plus.
- [x] Validar Plus en vista previa, pruebas y compilación antes de publicar.

---

# Ajuste fino de claridad en Plus

- [x] Aclarar ligeramente los turquesas Aurora de Plugin/Plus sin recuperar brillo excesivo.
- [x] Conservar el Azure Drift global, el material glass y el contraste de Plus.
- [x] Validar pruebas y compilación antes de publicar el ajuste fino.

---

# Corrección de etiquetas celestes y beneficios de perfil

- [x] Localizar los controles informativos que heredan apariencia de botón azul y pierden contraste.
- [x] Diferenciar visualmente etiquetas y acciones, preservando el degradado solo en controles interactivos.
- [x] Aplicar el turquesa suave de Plus al bloque de beneficios del perfil de forma localizada.
- [x] Validar los paneles afectados, pruebas y compilación antes de publicar.

---

# Ficha aislada de juego

- [x] Localizar la fuente de portada rota y los metadatos repetidos en la ficha aislada.
- [x] Usar un marcador seguro cuando no haya portada válida y eliminar la duplicación visual.
- [x] Reorganizar la ficha móvil con una jerarquía clara para jugar, precio, autor y actividad.
- [x] Validar la ficha, pruebas y compilación antes de publicar.

---

# Marcador único para portadas sin imagen

- [x] Localizar todas las vistas que aún muestran el icono simple para juegos sin portada.
- [x] Reutilizar el marcador blueprint compartido en ranking, carruseles y tarjetas de juego.
- [x] Validar las vistas de juegos, pruebas y compilación antes de publicar.

---

# Portada completa y acción de juego inferior

- [x] Mantener la portada completa y encuadrada sin recortarla ni superponer controles.
- [x] Llevar la acción de jugar a un botón grande situado debajo de la información del juego.
- [x] Validar la ficha móvil, pruebas y compilación antes de publicar.

- [x] Mostrar “Sin portada” únicamente en tarjetas de proyecto dentro del editor cuando no haya imagen.
- [x] Confirmar que la etiqueta no aparece en las vistas públicas de juegos.

---

# Herramienta de encuadre de portada

- [x] Auditar el flujo de selección de portada, vista previa y publicación del juego.
- [x] Añadir controles de escala y posición con vista previa interactiva del encuadre.
- [x] Guardar el encuadre y aplicarlo de forma consistente en las tarjetas públicas.
- [x] Validar la herramienta, pruebas y compilación antes de publicar.

---

# Formato único de portada cuadrada

- [x] Localizar todas las variantes de proporción de portada en vistas de juegos.
- [x] Aplicar un marco cuadrado con esquinas redondeadas como único formato público.
- [x] Conservar el encuadre guardado y los marcadores blueprint dentro del formato único.
- [x] Validar las vistas, pruebas y compilación antes de publicar.

---

# Marcador blueprint ampliado en ficha aislada

- [x] Revisar el tamaño del marcador para juegos sin portada en la ficha aislada.
- [x] Ampliar el icono blueprint sin cambiar el formato de portada cuadrado.
- [x] Validar ficha, pruebas y compilación antes de publicar.

---

# Limpieza de control inactivo en ficha de juego

- [x] Localizar y retirar el botón azul de opciones sin acción.
- [x] Ajustar la alineación de las acciones restantes de la ficha.
- [x] Validar ficha, pruebas y compilación antes de publicar.

---

# Confirmación obligatoria de donación de orbes

- [x] Localizar todos los disparadores de donación de orbes en la ficha de juego.
- [x] Mostrar un diálogo de confirmación con importe, destinatario y opciones de cancelar o donar.
- [x] Ejecutar la donación únicamente después de la confirmación explícita.
- [x] Validar cancelación, confirmación, pruebas y compilación antes de publicar.

---

# Turquesa glass exclusivo de Plugin/Plus

- [x] Identificar los botones y superficies que pertenecen únicamente a Plugin/Plus.
- [x] Aplicar el turquesa glass del primer marco de perfil a esos controles y al apartado Plugin/Plus.
- [x] Confirmar que el Azure Drift permanece intacto fuera de Plugin/Plus.
- [x] Validar Plus/Plugin en escritorio y móvil, pruebas y compilación antes de publicar.
