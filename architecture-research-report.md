# Informe de investigación: Asternal Engine y Supabase Cloud

**Estado:** investigación completada; no se implementaron nuevas funciones ni se modificó la lógica de la aplicación. El único material añadido para esta fase son notas e informe de investigación.

## 1. Resumen ejecutivo

Asternal Engine es una aplicación web React/TypeScript con Vite, enrutamiento de TanStack Router y una arquitectura principalmente **client-side**. La aplicación no parece depender de un backend propio para su funcionalidad social: el navegador usa `supabase-js` para autenticarse, consultar tablas de Postgres expuestas por la API de Supabase, ejecutar funciones SQL mediante RPC y, en partes concretas, preparar el uso de Realtime.

Supabase Cloud funciona como el backend gestionado: **Postgres** es el núcleo de datos; **Auth/GoTrue** gestiona usuarios y sesiones; **PostgREST** convierte tablas y funciones autorizadas en una API; **RLS** decide qué filas puede leer o modificar cada usuario; **Storage** gestiona archivos mediante buckets y políticas sobre `storage.objects`; y **Realtime** puede distribuir eventos mediante WebSockets. Supabase también ofrece Edge Functions, pero no se encontró una carpeta propia `supabase/functions` ni llamadas `functions.invoke` en el código auditado, por lo que no parecen formar parte de la ejecución actual.

La conclusión más importante es que el comportamiento real de la plataforma depende de dos capas que deben permanecer sincronizadas: el código React y el proyecto Supabase Cloud. El frontend puede compilar y abrir sin que el proyecto cloud tenga todas las tablas, funciones, políticas, publicaciones Realtime, buckets, URLs de redirección o variables configuradas correctamente.

## 2. Mapa de la aplicación

| Área | Ubicación principal | Función observada |
|---|---|---|
| Entrada y routing | `src/main.tsx`, `src/routes`, `src/routeTree.gen.ts` | Arranque de React y rutas de la aplicación. |
| Autenticación | `src/routes/auth.tsx`, `src/routes/reset-password.tsx`, `src/hooks/use-auth.ts`, `src/integrations/supabase/auth-*` | Registro, acceso con contraseña, recuperación, actualización de contraseña, cierre de sesión y lectura de sesión. |
| Núcleo del editor | `src/components/engine/*`, `src/lib/engine/*` | Editor Asternal, escenas, scripts, UI, pintura, runtime, publicación y sincronización de proyectos. |
| Red social | `src/lib/social/api.ts`, `src/lib/social/history.ts`, `src/lib/social/forum-storage.ts`, `src/components/social/*` | Feed, perfiles, publicaciones, reacciones, seguimiento, historial, galería, eventos, búsqueda y notificaciones. |
| Chat | `src/lib/social/chat.ts`, `src/lib/supabase/chat-schema.ts`, `src/components/social/ChatSection.tsx`, `WorkChatPanel.tsx` | Mensajes directos, grupos, miembros, roles, encuestas, regalos y anuncios. |
| Roles y administración | `src/routes/admin.tsx`, funciones SQL `has_role` e `is_mod_or_admin` | Control de administrador/moderador y acciones administrativas. |
| Monetización interna | `src/lib/stripe.ts`, rutas `plus` y `orbes`, RPC de compras | Suscripción/estado Plus, moneda interna Orbes, compra y reventa de obras/juegos. La integración de Stripe requiere una verificación separada de backend y webhooks. |
| IA | `src/lib/ai/orion.ts`, `src/components/ai/OrionPanel.tsx` | Funcionalidad de Orion/IA desde el frontend; la dependencia externa y sus secretos deben revisarse antes de usarla en producción. |
| UI compartida | `src/components/ui/*`, `src/styles.css` | Primitivas visuales, formularios, modales, paneles y estilos. |

Las rutas de primer nivel detectadas son: `/`, `/auth`, `/feed`, `/orbes`, `/paint`, `/plus`, `/profile`, `/profile/:userId`, `/reset-password` y `/admin`. El árbol de rutas generado también contiene rutas internas del editor y se debe tratar como fuente de verdad al depurar navegación.

## 3. Cómo funciona Supabase en la nube

El flujo normal de una operación autenticada es el siguiente:

1. El navegador carga `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` mediante el cliente público de Supabase.
2. `supabase.auth` contacta al servicio Auth/GoTrue. El acceso exitoso genera una sesión con un JWT de corta duración y un refresh token.
3. Las llamadas `supabase.from(...)` viajan a la API REST de PostgREST. El JWT se adjunta a la petición.
4. Postgres evalúa el rol y las políticas RLS con el contexto del usuario, especialmente `auth.uid()`.
5. Las llamadas `supabase.rpc(...)` ejecutan funciones SQL publicadas y autorizadas en el esquema `public`, también bajo el contexto del usuario salvo que la propia función use mecanismos de privilegio elevado.
6. Si se habilita Realtime para una tabla, el servicio puede recibir cambios de Postgres y distribuirlos por WebSocket a los clientes autorizados.
7. Si se usan archivos, Storage opera mediante buckets y políticas en `storage.objects`; el archivo vive en almacenamiento de objetos y sus metadatos se coordinan con Postgres.

Supabase describe esta arquitectura como una pasarela común conectada a Auth, PostgREST, Realtime, Storage, funciones y Postgres. Las fuentes oficiales consultadas son [Architecture](https://supabase.com/docs/guides/getting-started/architecture) y [Auth architecture](https://supabase.com/docs/guides/auth/architecture).

## 4. Autenticación y sesiones

El código usa `getSession`, `getUser`, `onAuthStateChange`, `signUp`, `signInWithPassword`, `resetPasswordForEmail`, `updateUser` y `signOut`. En términos operativos:

- `signUp` crea el usuario en `auth.users`; según la configuración del proyecto puede exigir confirmación por correo.
- `signInWithPassword` devuelve la sesión y el frontend pasa a consultar datos relacionados en `public.profiles`.
- `getSession` permite saber si existe una sesión local; `getUser` valida/obtiene el usuario actual desde Auth.
- `onAuthStateChange` reacciona a cambios de sesión, especialmente en la pantalla de restablecimiento de contraseña.
- `resetPasswordForEmail` depende de que Supabase Auth tenga configurada la URL de redirección correcta.
- `signOut` invalida la sesión afectada en Auth y el cliente deja de tener autorización.

Una sesión de Supabase se representa por un access token JWT y un refresh token. El access token es corto; el refresh token obtiene un nuevo par y se usa una sola vez. La persistencia y renovación dependen de la configuración del cliente (`persistSession` y `autoRefreshToken`) y del comportamiento de `supabase-js`. Fuente oficial: [User sessions](https://supabase.com/docs/guides/auth/sessions) y [Initializing supabase-js](https://supabase.com/docs/reference/javascript/initializing).

La tabla `public.profiles` enlaza `id` con `auth.users(id)` y se crea con borrado en cascada. El esquema instala además un trigger `on_auth_user_created`, cuyo objetivo es crear o completar el perfil al crear la cuenta. Esto significa que Auth y el perfil público no son la misma tabla: Auth contiene la identidad y `profiles` contiene la información pública/social.

## 5. Base de datos, RPC y seguridad RLS

El archivo `supabase-setup.sql` contiene, según el inventario estático, **27 tablas públicas, 20 funciones SQL y 82 políticas**. También contiene índices, triggers, tipos enumerados, relaciones con `auth.users` y configuración de la publicación Realtime para el chat.

Las tablas se agrupan funcionalmente en:

- identidad y perfiles: `profiles`, `user_roles` y datos auxiliares;
- contenido social: publicaciones, etiquetas, medios, reacciones, comentarios, reposts, follows, historial y notificaciones;
- proyectos y juegos: proyectos del editor, obras/juegos publicados, compras, propiedad y registros de partidas;
- economía interna: Orbes, reclamaciones, compras, Plus y movimientos;
- comunicación: chats, miembros, mensajes, encuestas, regalos y anuncios;
- comunidad: eventos, participantes, foro, hilos, posts y votos;
- archivos y metadatos asociados, cuando corresponda.

El frontend llama RPC para operaciones que deben agrupar validaciones y efectos atómicos, entre ellas `purchase_game`, `purchase_artwork`, `resell_artwork`, `activate_plus`, `claim_plus_orbes`, `join_event`, `leave_event`, `get_or_create_dm`, `create_group_chat`, `create_chat_poll`, `vote_chat_poll`, `create_orb_gift`, `claim_orb_gift`, `forum_vote_thread` y `forum_vote_post`.

La razón de usar RPC en compras, economía, moderación y chat es importante: una función SQL puede validar saldo, propiedad, identidad y actualizaciones relacionadas dentro de una misma operación. Sin embargo, la seguridad final depende de que las funciones estén correctamente escritas, tengan un `search_path` seguro, no confíen en parámetros de usuario para identificar al actor y no otorguen privilegios excesivos.

Supabase recomienda habilitar RLS en todas las tablas de esquemas expuestos. Una política `using` controla filas existentes y `with check` valida inserciones o actualizaciones. `auth.uid()` devuelve `null` sin autenticación; por tanto, las políticas deben expresar explícitamente si desean acceso anónimo o autenticado. Las claves `service_role` omiten RLS y jamás deben estar en el navegador. Fuente oficial: [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## 6. Chat y Realtime

El archivo `src/lib/supabase/chat-schema.ts` prepara el chat y añade tablas como `chats`, `chat_members`, `chat_messages`, `orb_gifts` y `chat_polls` a la publicación `supabase_realtime`. Esto indica que el esquema cloud está preparado para cambios en tiempo real.

En la auditoría no se detectaron llamadas claras a `supabase.channel(...).on(...).subscribe(...)` en el frontend principal; sí se detectó la preparación SQL de la publicación y una capa RPC extensa para leer/escribir chats. Por ello, hay que distinguir entre **tener tablas publicadas para Realtime** y **consumir activamente sus eventos por WebSocket**. La interfaz podría estar usando consultas y refrescos manuales, o la suscripción podría estar encapsulada en un módulo no identificado; esto debe confirmarse antes de prometer sincronización instantánea.

Supabase Realtime ofrece broadcast, presence y Postgres Changes sobre canales. Fuente oficial: [Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture).

## 7. Archivos y Storage

La investigación detectó integración con archivos en el área del editor/social, pero la configuración exacta de buckets debe comprobarse en el proyecto Supabase, no solo en el código. El modelo esperado es:

- el archivo se carga a un bucket;
- la ruta o URL se guarda en una columna de Postgres, por ejemplo en un perfil, publicación o proyecto;
- la descarga depende de si el bucket es público o privado;
- las operaciones sobre `storage.objects` se autorizan con RLS.

Por defecto, Supabase Storage no permite cargas sin políticas. Una carga normal necesita `INSERT`; un `upsert` requiere también `SELECT` y `UPDATE`. Las políticas deben restringir bucket, usuario y carpeta. Fuente oficial: [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control).

## 8. Auto-configuración del esquema

`src/lib/supabase/setup.ts` incorpora una función de configuración que intenta ejecutar SQL desde el navegador mediante la Management API de Supabase. El flujo usa un token personal con formato `sbp_...`, extrae el project ref de la URL y primero intenta una ruta proxy local (`/__supabase-mgmt/...`) antes de intentar la Management API directa.

Este mecanismo no es equivalente al uso normal de la aplicación: el anon key es una credencial pública pensada para el cliente, mientras que un token personal de Management API tiene capacidad administrativa y no debe tratarse como un dato normal de usuario. La interfaz también ofrece copiar el SQL para ejecutarlo en el SQL Editor. La opción más segura para producción es ejecutar el esquema mediante un canal administrativo controlado, no pedir al usuario final un token de alto privilegio dentro de la aplicación pública.

## 9. Edge Functions, Stripe y servicios externos

No se encontró una carpeta propia `supabase/functions` ni uso de `supabase.functions.invoke`. Por tanto, no hay evidencia de Edge Functions implementadas en este repositorio. Supabase Edge Functions son funciones TypeScript server-side en runtime Deno, adecuadas para webhooks, secretos, integraciones y operaciones que no deben vivir en el navegador. Fuente oficial: [Edge Functions](https://supabase.com/docs/guides/functions).

El repositorio contiene `src/lib/stripe.ts` y `VITE_STRIPE_PUBLISHABLE_KEY`. Una clave publicable puede usarse en el cliente para iniciar ciertos flujos, pero por sí sola no implementa pagos seguros, verificación de precios ni webhooks. Antes de activar cobros reales hay que determinar si existe un servidor o Edge Function para crear sesiones, validar eventos y proteger secretos. En la auditoría actual no se debe asumir que la monetización está lista para producción únicamente porque el módulo de Stripe compila.

## 10. Variables y dependencias operativas

Se detectaron estos nombres de variables en el código, sin leer ni exponer sus valores:

| Variable | Papel probable |
|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Clave pública del cliente. No sustituye una service key. |
| `VITE_SUPABASE_ACCESS_TOKEN` | Token de Management API usado por la configuración automática; requiere tratamiento administrativo. |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Clave publicable de Stripe. |
| `VITE_VLY_APP_ID`, `VITE_VLY_MONITORING_URL` | Integración de tooling/monitorización del entorno original. |

Una variable `VITE_*` termina potencialmente en el bundle del navegador. Nunca debe contener una service role key, contraseña de Postgres, secreto de Stripe ni token administrativo permanente.

## 11. Riesgos y puntos que requieren verificación cloud

| Prioridad | Punto | Motivo |
|---|---|---|
| Alta | RLS de todas las tablas y funciones RPC | La aplicación es client-side; una política defectuosa expone datos o permite mutaciones indebidas. |
| Alta | Token `VITE_SUPABASE_ACCESS_TOKEN` | Un token de Management API no debe distribuirse a usuarios finales ni quedar en un bundle público. |
| Alta | Compras, Orbes y Plus | Deben probarse saldo, doble compra, reventa, concurrencia y autorización del propietario. |
| Alta | `auth.users` → `profiles` | El trigger y la política de creación deben funcionar para cada alta real. |
| Media | Chat Realtime | El esquema publica tablas, pero falta confirmar que el frontend se suscribe efectivamente a canales. |
| Media | Buckets y URLs | Hay que comprobar nombres, visibilidad, políticas de carga/descarga y expiración de URLs. |
| Media | Reset de contraseña | Requiere Redirect URLs y plantillas de correo configuradas en Supabase Auth. |
| Media | Stripe | Hay que localizar el servidor/webhook que valida eventos antes de usar pagos reales. |
| Baja | Funciones de setup desde navegador | Útiles para desarrollo, pero deben aislarse o eliminarse del flujo público de producción. |

## 12. Modelo mental final

> **Asternal Engine no es únicamente una SPA compilada:** es una SPA que actúa como cliente de un proyecto Supabase. El código define qué pide; Supabase Cloud decide si existe el recurso, si el JWT es válido, si RLS permite la fila y si la función SQL autoriza la operación.

Por eso, una futura función debe investigarse y probarse en cuatro capas: **interfaz**, **cliente Supabase**, **SQL/RLS** y **configuración del proyecto cloud**. Añadir solo componentes React no garantiza que la función exista en producción.

## Referencias oficiales consultadas

1. [Supabase Architecture](https://supabase.com/docs/guides/getting-started/architecture)
2. [Auth Architecture](https://supabase.com/docs/guides/auth/architecture)
3. [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
4. [Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
5. [Realtime Architecture](https://supabase.com/docs/guides/realtime/architecture)
6. [Edge Functions](https://supabase.com/docs/guides/functions)
7. [User Sessions](https://supabase.com/docs/guides/auth/sessions)
8. [Initializing supabase-js](https://supabase.com/docs/reference/javascript/initializing)

## Alcance y siguiente decisión

Este informe documenta el estado observado sin ejecutar migraciones cloud, consultar datos reales ni activar funciones nuevas. Antes de cualquier implementación, la decisión recomendada es validar primero: **(a)** si el proyecto Supabase real corresponde al código, **(b)** si el esquema ya fue ejecutado, **(c)** qué buckets y proveedores Auth existen, y **(d)** si se desea conservar el flujo de auto-configuración administrativa desde el navegador.
