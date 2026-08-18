# Investigación: autenticación Google independiente

Asternal no puede usar el portal de identidad de Manus para presentarse como un acceso Google propio. Para un inicio de sesión Google independiente, se necesita un cliente OAuth de tipo **Aplicación web** creado en Google Cloud, un URI de retorno autorizado que coincida exactamente con el callback de Asternal y una pantalla de consentimiento configurada.

El flujo recomendado es OAuth 2.0 Authorization Code: Asternal crea `state` antifalsificación, lleva al usuario al dominio de Google, recibe `code` en su propio callback, valida `state` y canjea el código en el servidor usando el secreto del cliente. El secreto jamás debe enviarse al navegador. Para un acceso básico se solicitan únicamente los scopes `openid`, `email` y `profile`; no se requieren permisos de Drive, Calendar u otros datos.

| Fuente | Hallazgo aplicado |
|---|---|
| [Google: OAuth 2.0 para aplicaciones web](https://developers.google.com/identity/protocols/oauth2/web-server) | Exige un cliente web, URI de retorno autorizado y conservación segura del secreto de cliente. |
| [Google Identity Services: modelo de código](https://developers.google.com/identity/oauth2/web/guides/use-code-model) | Recomienda Authorization Code con callback propio y validación de `state` contra CSRF. |
| [Ayuda de Google Cloud: clientes OAuth](https://support.google.com/googleapi/answer/6158849?hl=en) | Explica crear el OAuth Client ID en APIs y servicios → Credenciales, además de la configuración del consentimiento. |

El proyecto debe recibir dos secretos: `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`. En Google Cloud se registrará como URI de redirección autorizada: `https://asternaleng-dvlqmnye.manus.space/api/auth/google/callback`.

## Prueba publicada de 2026-08-17

La ruta publicada `https://asternaleng-dvlqmnye.manus.space/api/auth/google/start` redirige correctamente a `accounts.google.com` con el callback propio `https://asternaleng-dvlqmnye.manus.space/api/auth/google/callback`. Esto confirma que el servidor fullstack y la URI de retorno están activos. Sin embargo, la pantalla de Google muestra «to continue to manus.space», lo que confirma que el `GOOGLE_CLIENT_ID` configurado pertenece a la pantalla de consentimiento/branding de Manus, no a una aplicación Google administrada y mostrada como Asternal. Cambiar solo la URI de redirección no cambia el propietario ni el nombre de esa aplicación: se requieren credenciales OAuth de un proyecto propio de Google Cloud para Asternal.
