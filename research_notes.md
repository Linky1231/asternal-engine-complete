# Hallazgos externos iniciales

## Arquitectura de Supabase
Fuente: https://supabase.com/docs/guides/getting-started/architecture

Supabase describe a Postgres como el núcleo del proyecto. Un proyecto Supabase agrupa una instancia de PostgreSQL con una pasarela Envoy y servicios conectados: GoTrue/Auth, PostgREST, Realtime, Storage API, pg_meta, Edge Functions y pg_graphql. La documentación indica que Storage usa almacenamiento de objetos compatible con S3 y conserva sus metadatos en Postgres; Realtime ofrece WebSockets para presencia, broadcasting y cambios de base de datos; Auth emite tokens JWT y se integra con Postgres/RLS; PostgREST expone acceso REST; y Edge Functions ejecuta lógica personalizada en el borde.

La documentación también identifica como accesibles desde una aplicación frontend las APIs de Auth, PostgREST, Realtime, Storage y Edge Functions, siempre que el proyecto esté configurado y las políticas de seguridad sean correctas.

## Arquitectura de Supabase Auth
Fuente: https://supabase.com/docs/guides/auth/architecture

Supabase Auth usa el esquema `auth` dentro de la misma base Postgres para usuarios y otra información relacionada. Ese esquema no se expone mediante la API autogenerada. La arquitectura se organiza en cuatro capas: cliente, pasarela Envoy, servicio Auth/GoTrue y Postgres.

La documentación recomienda conectar los usuarios de Auth con tablas propias mediante triggers de base de datos y claves foráneas. Cualquier vista que exponga datos relacionados con Auth debe protegerse con RLS o con permisos revocados. En Postgres 15, una vista creada con `security_invoker` puede heredar las políticas RLS de sus tablas subyacentes; las vistas sin esa configuración pueden operar con permisos del propietario y omitir RLS.

## RLS y acceso desde el navegador
Fuente: https://supabase.com/docs/guides/database/postgres/row-level-security

Supabase exige habilitar RLS en las tablas de esquemas expuestos, normalmente `public`, cuando se accede desde el navegador. `auth.uid()` devuelve el UUID del usuario autenticado y devuelve `null` si no existe un token válido o la sesión expiró. Las políticas deben separar `using` para filas existentes y `with check` para filas insertadas o actualizadas. Las claves `service_role` pueden omitir RLS y nunca deben exponerse en el navegador.

La guía recomienda especificar el rol objetivo en las políticas, indexar columnas usadas por las políticas, envolver llamadas a funciones con `select`, filtrar explícitamente las consultas y evitar joins costosos dentro de las políticas. Esto es especialmente relevante para las tablas sociales, de compras y de chat de Asternal Engine.

## Storage y control de archivos
Fuente: https://supabase.com/docs/guides/storage/security/access-control

Storage usa RLS sobre `storage.objects`. Por defecto, no permite cargas a buckets sin políticas. Las políticas se definen por operación (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) y pueden restringirse por bucket y por la primera carpeta de la ruta. Para `upsert`, además de `INSERT` se necesitan permisos `SELECT` y `UPDATE`. Un bucket privado requiere autorización también para descargar archivos; un bucket público cambia el modelo de acceso al servir los objetos.

## Realtime
Fuente: https://supabase.com/docs/guides/realtime/architecture

Realtime funciona como un servicio WebSocket/Channels que puede manejar broadcast, presence y cambios de Postgres. La arquitectura incluye un gateway y un flujo de lectura del Write-Ahead Log para transmitir cambios. En el código de Asternal Engine, la presencia de `supabase.channel` y configuraciones de publicación debe comprobarse por módulo; las operaciones RPC y consultas REST no son Realtime por sí mismas.

## Edge Functions
Fuente: https://supabase.com/docs/guides/functions

Las Edge Functions son funciones TypeScript server-side ejecutadas en el runtime Deno de Supabase, distribuidas globalmente. El gateway recibe la petición, aplica enrutamiento y puede validar JWT; después el runtime regional ejecuta la función. Los secretos deben guardarse como project secrets y leerse desde variables de entorno. Son adecuadas para webhooks, integraciones con Stripe, correo, endpoints autenticados, generación de imágenes y tareas breves idempotentes. El repositorio auditado no muestra una carpeta `supabase/functions`, por lo que las operaciones actuales parecen depender principalmente de PostgREST, Auth y funciones SQL/RPC dentro de Postgres, no de Edge Functions propias.

## Cliente JavaScript y sesiones
Fuentes: https://supabase.com/docs/reference/javascript/initializing y https://supabase.com/docs/guides/auth/sessions

El cliente web se inicializa con la URL única del proyecto y una clave pública/anon o publishable key. Las opciones `auth.persistSession` y `auth.autoRefreshToken` controlan la persistencia local y la renovación automática. La sesión contiene un access token JWT de vida corta y un refresh token de uso único que obtiene el siguiente par de tokens. El usuario puede tener varias sesiones por dispositivo y el cierre de sesión elimina las sesiones afectadas en Auth.

En Asternal Engine, el frontend usa `getSession`, `getUser`, `onAuthStateChange`, `signUp`, `signInWithPassword`, `resetPasswordForEmail`, `updateUser` y `signOut`. Esto implica que la disponibilidad de Auth, las URLs de redirección y el correo de recuperación deben configurarse en el proyecto Supabase, aunque no requieren un backend propio en la aplicación.

## Investigación de degradados azules y accesibilidad
Fuentes: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html, https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html y https://www.w3.org/TR/css-color-4/#ok-lab

La nueva dirección visual mantiene el azul de marca, pero aumenta el croma y separa mejor las intensidades: azul cobalto profundo para el inicio, azul eléctrico para el centro y azur/cian controlado para el cierre. Se conserva OKLCH porque CSS Color 4 define este espacio perceptual y facilita ajustar luminosidad y croma de forma coherente. Los textos normales sobre fondos de degradado deben apuntar a una relación mínima de 4.5:1; los textos grandes, 3:1. Los componentes y señales visuales importantes deben mantener al menos 3:1 frente a colores adyacentes. Por ello, los CTA usan un cierre de degradado más contenido y los banners reciben un overlay profundo, en lugar de depender de un extremo azul demasiado claro.

## Nueva investigación de degradados azules

- W3C WCAG 2.2, SC 1.4.3: el texto normal debe mantener una relación de contraste mínima de 4.5:1; el texto grande, 3:1. La evaluación debe considerar la luminancia real del fondo, no solo el matiz o la saturación. Fuente: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- CSS-Tricks, `oklch()`: OKLCH separa perceptualmente luminosidad, croma y matiz; permite ajustar viveza sin perder control sobre la luminosidad y produce gradientes más predecibles que RGB/HSL. Fuente: https://css-tricks.com/almanac/functions/o/oklch/
- Evil Martians, OKLCH in CSS: OKLCH facilita sistemas de color coherentes y modificaciones de paleta; sus ejes de lightness, chroma y hue son más legibles para diseñar variaciones. Las combinaciones de croma alta deben revisarse por compatibilidad de gamut. Fuente: https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- Decisión para Asternal: usar un degradado de azul eléctrico/cobalto con croma intermedia-alta, luminosidad media para sostener texto claro en CTAs, y endpoints no pastel para evitar el aspecto apagado. Las variantes suaves se reservarán para fondos, mientras banners y botones usarán la versión más profunda.
