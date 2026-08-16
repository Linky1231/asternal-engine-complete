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
