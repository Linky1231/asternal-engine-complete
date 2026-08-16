# Auditoría de migración Supabase → Manus

## Hallazgos principales

La aplicación conserva una capa Supabase extensa y también una degradación local basada en `localStorage`. El archivo `src/integrations/supabase/client.ts` importa `@supabase/supabase-js`, expone una interfaz compatible con `supabase.from`, `supabase.auth`, `supabase.storage` y `supabase.rpc`, y en determinados escenarios usa tablas locales con prefijos `_local_data_*` y `_local_storage_*`. Esta capa es el punto de sustitución principal.

El dominio social de `src/lib/social/api.ts` depende de perfiles, publicaciones, etiquetas, reacciones, comentarios, reposts, notificaciones, compras, jugadas, transacciones de Orbes, encuestas, proyectos de usuario, roles, eventos, follows y RPC de negocio. El almacenamiento de medios usa el bucket `post-media` y URLs firmadas de Supabase.

El dominio de chats de `src/lib/social/chat.ts` usa tablas de chats, miembros, mensajes, encuestas, stickers, marcadores y RPC, además de Realtime para INSERT/UPDATE/DELETE. También contiene un fallback local que debe transformarse en caché/offline sincronizable, no mantenerse como fuente de verdad.

El editor de juegos ya dispone de sincronización parcial mediante `user_projects` en `src/lib/engine/cloud-sync.ts`, pero depende de Supabase y conserva estado local como caché. La biblioteca de assets se almacena como una fila reservada de `user_projects`.

El subsistema de chats de trabajo (`src/lib/social/work.ts`) es completamente local y guarda tareas, proyectos, archivos con `dataUrl`, hilos y mensajes en `localStorage`. Este apartado requiere nuevas tablas Manus y migración de archivos a S3.

El historial de partidas y estadísticas usa `localStorage`, mientras que los contenidos favoritos consultan tablas sociales. Debe incorporarse a persistencia Manus con una política de sincronización idempotente.

La configuración actual contiene `@supabase/supabase-js`, `convex`, un esquema SQL grande (`supabase-setup.sql`), utilidades de administración Supabase y clientes de autenticación Supabase. La base Manus existente (`drizzle/schema.ts`) solo contiene `users` para OAuth y aún no modela los dominios sociales ni de juegos.

## Restricciones de seguridad y migración

No se debe borrar ni modificar el origen durante la transferencia. La migración necesita credenciales de lectura del proyecto Supabase y acceso a sus archivos para ejecutar una exportación verificada. El destino será la base administrada por Manus mediante Drizzle/MySQL y el almacenamiento S3 integrado mediante `server/storage.ts`.

La autenticación no puede copiar contraseñas desde Supabase Auth a Manus OAuth. Se conservarán los identificadores de usuario y perfiles, y se requiere una estrategia de vinculación de identidad compatible con OAuth. Los datos de usuario, juegos y relaciones sí pueden migrarse preservando UUIDs y referencias.

## Arquitectura objetivo

El navegador dejará de hablar directamente con Supabase. Las operaciones pasarán por procedimientos tRPC protegidos, con la base Manus como fuente de verdad, `server/storage.ts` para archivos y una capa de caché local únicamente para resiliencia offline. La sincronización de chats se implementará mediante invalidación/polling controlado o el mecanismo realtime disponible en la plataforma, sin conservar canales Supabase.
