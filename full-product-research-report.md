# Asternal Engine: investigación integral del producto

**Estado:** investigación del producto completada. Este documento explica el funcionamiento observado en el código existente; no implementa nuevas funciones ni modifica la lógica de la aplicación.

## 1. Qué es Asternal Engine

> **Asternal Engine es un motor de videojuegos social:** una plataforma donde una persona puede crear juegos, editarlos, ejecutarlos, publicarlos, compartirlos y descubrir las creaciones de otras personas, mientras participa en una comunidad con perfiles, publicaciones, comentarios, reacciones, seguidores, chat, eventos y foros.

No es únicamente un editor de juegos ni únicamente una red social. Su propuesta central es unir ambos mundos en un mismo ciclo: la creación produce juegos; la red social les da visibilidad, conversación y audiencia; la audiencia juega, reacciona, comparte y puede convertirse en creadora. El usuario no tiene que salir de la plataforma para pasar de diseñar a publicar, ni de publicar a jugar o interactuar.

## 2. La experiencia completa en una frase

La experiencia ideal de Asternal Engine es: **entrar, descubrir o crear, construir una experiencia jugable, guardarla, publicarla, conseguir que otras personas la jueguen y participar en la comunidad que se forma alrededor de ella**.

| Momento | Qué hace el usuario | Qué parte de la aplicación participa |
|---|---|---|
| Entrada | Se registra, inicia sesión o recupera su contraseña. | Supabase Auth y rutas de autenticación. |
| Descubrimiento | Explora feed, juegos, tendencias, perfiles y búsqueda. | Feed social, `GamesHome`, búsqueda y perfiles. |
| Creación | Abre el editor, administra proyectos y construye escenas. | `AsternalEditor`, `ProjectManager`, editores de escena, script, UI y pintura. |
| Prueba | Ejecuta el juego dentro de la aplicación. | `GameRuntime` y la capa de núcleo/runtime. |
| Persistencia | Guarda localmente y sincroniza proyectos con la nube. | `storage.ts` y `cloud-sync.ts`. |
| Publicación | Publica una obra jugable con metadatos y portada. | `PublishGameDialog`, posts/juegos y Storage. |
| Comunidad | Recibe reacciones, comentarios, seguidores y notificaciones. | API social y componentes de interacción. |
| Juego | Abre una creación publicada, la ejecuta y registra la partida. | Modal/runtime de juego y `game_plays`. |
| Economía | Usa Orbes, Plus, compras o reventa cuando están habilitados. | RPC de Postgres, rutas Orbes/Plus y tablas económicas. |
| Comunidad avanzada | Conversa, organiza eventos y participa en foros. | Chat, grupos, eventos, foro y moderación. |

## 3. Las dos caras del producto

### 3.1. El motor de videojuegos

El motor es la parte que transforma una idea en una experiencia jugable. El usuario trabaja con proyectos, escenas, entidades, scripts, interfaces y recursos visuales. La presencia de `SceneEditor`, `ScriptEditor`, `UIEditor`, `PaintEditor`, `GameRuntime` y `AsternalEditor` indica una arquitectura de edición integrada en el navegador, no un flujo que dependa obligatoriamente de una herramienta externa.

El editor se divide conceptualmente en varias capas:

| Capa del motor | Responsabilidad observada |
|---|---|
| Proyecto | Crear, seleccionar, renombrar, guardar y sincronizar proyectos. |
| Escena | Construir la composición visual y espacial del juego. |
| Entidades y propiedades | Definir objetos, transformaciones y comportamiento. |
| Script | Añadir lógica interactiva al juego. |
| UI | Diseñar elementos de interfaz que aparecen durante la experiencia. |
| Pintura | Crear o guardar recursos gráficos y sprites. |
| Runtime | Ejecutar la experiencia dentro de la propia aplicación. |
| Publicación | Convertir un proyecto en una obra/juego que puede aparecer en la red social. |

La arquitectura parece favorecer un enfoque de creación accesible: el usuario puede comenzar desde el navegador y, a medida que el proyecto crece, combinar edición visual con scripts. La capa visual no es un simple formulario de publicación; es un espacio de autoría.

### 3.2. La red social

La red social es el sistema de distribución, identidad y conversación alrededor de las creaciones. El juego publicado aparece como contenido social, con autor, metadatos, portada, actividad y acciones de interacción. Esto permite que un juego no sea un archivo aislado, sino una pieza de contenido con contexto y comunidad.

Las capacidades detectadas incluyen perfiles, feed, publicaciones, comentarios, reacciones, favoritos, reposts, follows, notificaciones, historial, galería, búsqueda global, eventos, foro y mensajería. Esta amplitud convierte a Asternal Engine en una comunidad de creadores y jugadores, no solo en un catálogo.

## 4. Recorrido del creador

### Paso 1: identidad y espacio personal

El usuario entra mediante Supabase Auth. La identidad vive en `auth.users`; el perfil social se guarda en `public.profiles`, conectado por el mismo UUID. Tras iniciar sesión, la aplicación consulta el perfil y decide qué vistas puede mostrar.

### Paso 2: creación del proyecto

Desde la navegación se accede al editor. `ProjectManager` administra el espacio de proyectos y `AsternalEditor` coordina las herramientas. El proyecto contiene la información que después necesita el runtime: escenas, recursos, scripts, componentes de UI y configuración del juego.

### Paso 3: edición

La creación se desarrolla en herramientas especializadas. El usuario puede editar la escena, escribir scripts, crear interfaces, pintar recursos y preparar el comportamiento jugable. La separación en componentes permite que el editor sea una estación de trabajo compuesta, en lugar de una pantalla monolítica.

### Paso 4: prueba inmediata

`GameRuntime` ejecuta el proyecto dentro del navegador. Esta etapa es crucial para la propuesta del producto: permite comprobar una idea antes de publicarla y reduce el salto entre editar y jugar.

### Paso 5: guardado y sincronización

La aplicación tiene una capa de almacenamiento del motor y una capa de sincronización cloud. El almacenamiento local permite continuidad y respuesta rápida; `cloud-sync.ts` sincroniza proyectos con Supabase cuando hay identidad y conexión. La sincronización no debe entenderse como un detalle visual: es lo que permite que el trabajo creador sobreviva al cambio de dispositivo y pueda convertirse en una publicación.

### Paso 6: publicación

`PublishGameDialog` representa el paso de proyecto privado a creación pública. La publicación necesita metadatos, recursos, portada y referencias al proyecto o contenido ejecutable. Después, el juego puede aparecer en la sección de juegos, en tendencias y en perfiles.

## 5. Recorrido del jugador

El jugador puede comenzar en la pestaña de juegos, el feed, un perfil, una búsqueda o una notificación. `GamesHome` organiza el descubrimiento con una pieza destacada, ranking de juegos jugados, continuidad, recomendaciones y tendencias como “más jugados hoy”, “creciendo rápido”, “mejor valorados” y “nuevos”.

Al seleccionar un juego, se abre una experiencia de juego dentro de la aplicación. La partida puede registrarse en `game_plays`, lo que alimenta el ranking de 24 horas. El esquema incluye una instalación separada para `game_plays`, lo que explica el aviso de sincronización que aparece si la tabla aún no existe en Supabase.

Después de jugar, el usuario puede interactuar con la obra y con su creador. El juego puede recibir reacciones, comentarios, favoritos, reposts y actividad social. De esta forma, jugar no es el final del recorrido: es una entrada a la conversación.

## 6. Cómo se organiza la red social

| Sistema | Función de producto | Datos y lógica observada |
|---|---|---|
| Feed | Reunir publicaciones y actividad de la comunidad. | `fetchFeed`, posts, reacciones, comentarios y reposts. |
| Juegos | Mostrar creaciones jugables y ordenar tendencias. | `fetchGames`, `GamesHome`, `game_plays`. |
| Perfil | Presentar identidad, obras, actividad y personalización. | `profiles`, publicaciones, proyectos y preferencias. |
| Seguimiento | Conectar personas y priorizar actividad. | Follows y consultas de relaciones. |
| Notificaciones | Informar sobre interacciones y eventos. | `notifications`, `push_notification`, campana y panel. |
| Historial | Recordar actividad del usuario. | `history.ts` y tablas de actividad. |
| Galería | Gestionar recursos visuales y obras. | Componentes de galería, pintura y Storage/metadatos. |
| Búsqueda | Encontrar personas, publicaciones y juegos. | `global-search.ts` y panel de búsqueda. |
| Chat | Conversaciones directas y de grupo. | `chat.ts`, RPC de chats y tablas de mensajes. |
| Eventos | Crear o participar en actividades comunitarias. | `join_event`, `leave_event` y participantes. |
| Foro | Discusiones persistentes, votos y soluciones. | Categorías, hilos, posts, votos y moderación. |

## 7. Chat, grupos y comunidad

El chat extiende la red social desde el contenido público hacia la comunicación privada o semiprivada. El código contiene operaciones para crear chats grupales, añadir o eliminar miembros, cambiar roles, abandonar o eliminar un grupo, marcar mensajes como leídos y gestionar encuestas.

También hay funciones de regalos de Orbes y anuncios dentro del chat. Esto indica que el chat no es solo mensajería básica: puede actuar como espacio de colaboración, comunidad de jugadores y actividad económica interna.

El SQL prepara tablas de chat para la publicación `supabase_realtime`. Esto permite sincronización instantánea si el frontend se suscribe mediante canales WebSocket; la auditoría identifica preparación del lado cloud y debe confirmar por separado la existencia de suscripciones activas en cada panel.

El foro cubre conversaciones más permanentes: categorías, hilos, posts, votos positivos/negativos, edición, eliminación, citas, marcado de solución, cierre y fijado. Los roles de moderador y administrador controlan acciones de moderación.

## 8. Economía, Orbes y Plus

Asternal Engine contiene una economía virtual centrada en Orbes y una capa de membresía Plus. El usuario puede consultar saldo y movimientos, reclamar beneficios, comprar juegos/obras y revender ciertas creaciones. Las operaciones sensibles se ejecutan mediante RPC, por ejemplo `purchase_game`, `purchase_artwork`, `resell_artwork`, `claim_plus_orbes` y `activate_plus`.

| Elemento | Significado dentro del producto |
|---|---|
| Orbes | Moneda virtual para recompensas, compras y actividad de la plataforma. |
| Plus | Estado de membresía con beneficios y personalizaciones adicionales. |
| Compra | Transferencia de Orbes y asignación de propiedad o acceso. |
| Reventa | Publicación de una obra propia o adquirida para transferirla bajo reglas del sistema. |
| Historial económico | Registro de movimientos, compras, ventas y reclamaciones. |
| Roles | Permisos para usuario, moderador y administrador. |

Estas operaciones deben permanecer en el servidor de datos/RPC y no confiar solo en la interfaz. El cliente puede solicitar una compra, pero la base de datos debe validar identidad, precio, saldo, propiedad, duplicados y concurrencia.

La presencia de `src/lib/stripe.ts` indica una posible integración con pagos externos, pero la existencia de una clave publicable no demuestra por sí misma que el flujo de pagos esté completo. Para pagos reales se necesitaría un proceso seguro de creación de checkout, validación de webhooks y almacenamiento de secretos fuera del navegador.

## 9. Cómo encajan motor y red social

El vínculo principal entre ambos sistemas es la publicación. Un proyecto vive primero como trabajo de creación; al publicarse se convierte en un juego visible y jugable; el juego genera actividad; la actividad alimenta la red social; y la respuesta social vuelve al creador en forma de audiencia, comentarios, seguidores y motivación para iterar.

| Motor | Red social | Resultado conjunto |
|---|---|---|
| Proyecto editable | Perfil del creador | La autoría se hace visible. |
| Juego ejecutable | Publicación compartible | La creación puede circular. |
| Runtime | Registro de partidas | Jugar genera señal de descubrimiento. |
| Portada y assets | Feed y galería | Los recursos ayudan a presentar la obra. |
| Scripts y escenas | Comentarios y comunidad | La creación se vuelve tema de conversación. |
| Publicación | Likes, favoritos y follows | La audiencia puede regresar y seguir al creador. |
| Economía | Compras y reventa | La plataforma puede asignar valor interno a las obras. |

## 10. Arquitectura técnica del producto

La capa de frontend está construida con React/TypeScript y Vite. El enrutamiento usa TanStack Router. Supabase proporciona la identidad, la API de datos, las funciones SQL y la persistencia cloud. La aplicación utiliza un patrón de cliente directo: el navegador invoca `supabase.auth`, `supabase.from` y `supabase.rpc`.

El esquema SQL observado contiene 27 tablas públicas, 20 funciones SQL y 82 políticas RLS. Las funciones RPC concentran operaciones compuestas de economía, chat, foro, eventos y notificaciones. RLS es la frontera de seguridad que debe impedir que un usuario lea o modifique filas ajenas.

La nube no ejecuta automáticamente la lógica de React. Ejecuta Auth, PostgREST, Postgres, RLS, Storage, Realtime y las funciones SQL que hayan sido instaladas en el proyecto. Por ello, el código trasladado y el proyecto Supabase deben considerarse dos mitades de la misma aplicación.

## 11. Qué necesita existir para que la aplicación esté completa

| Dependencia | Qué debe estar listo |
|---|---|
| Auth | Email/password, URLs de redirección, confirmación de correo y recuperación. |
| Base de datos | Tablas, enums, relaciones, triggers, funciones RPC e índices. |
| Seguridad | RLS, grants y funciones protegidas. |
| Storage | Buckets, visibilidad, políticas y límites de archivos. |
| Realtime | Publicación de tablas y suscripciones del frontend cuando se requiera. |
| Configuración | URL y clave pública de Supabase; nunca service role en el bundle. |
| Monetización | RPCs seguras, reglas económicas y, si aplica, backend/webhooks de Stripe. |
| Operación | Logs, copias, migraciones versionadas y pruebas de permisos. |

## 12. Definición de producto propuesta

Asternal Engine puede describirse así:

> **Asternal Engine es una plataforma social de creación de videojuegos que combina un editor accesible, un runtime para jugar en el navegador y una comunidad donde los creadores publican sus juegos, los jugadores los descubren e interactúan, y ambos participan en una economía y en espacios sociales compartidos.**

Su diferencia no está en tener un editor y una red social como dos productos separados, sino en conectar el ciclo completo de creación y participación: **crear → probar → publicar → descubrir → jugar → interactuar → mejorar**.

## 13. Conclusión

La aplicación completa debe entenderse como un ecosistema de dos bucles. El bucle creativo transforma proyectos en juegos publicados. El bucle social transforma juegos publicados en descubrimiento, conversación, audiencia y nuevas oportunidades de creación. Supabase Cloud sostiene la identidad, los datos, las reglas de acceso, los archivos, la actividad y las operaciones de servidor.

Antes de implementar una nueva función, conviene ubicarla en este mapa: si afecta al editor, al runtime, a la publicación, al descubrimiento, a la interacción social o a la economía. Después hay que revisar las cuatro capas correspondientes: UI, cliente Supabase, SQL/RLS y configuración cloud. Solo así se puede añadir una capacidad sin romper la relación entre crear, compartir y jugar.

## Referencias externas

[1] [Supabase Architecture](https://supabase.com/docs/guides/getting-started/architecture)

[2] [Auth Architecture](https://supabase.com/docs/guides/auth/architecture)

[3] [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

[4] [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)

[5] [Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture)

[6] [Edge Functions](https://supabase.com/docs/guides/functions)

[7] [User Sessions](https://supabase.com/docs/guides/auth/sessions)
