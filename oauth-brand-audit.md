# Auditoría de marcas OAuth

## Google

Fuente oficial: https://developers.google.com/identity/branding-guidelines

La guía oficial recomienda usar los botones renderizados por Google Identity Services o sus recursos preaprobados. También ofrece el paquete oficial de iconos y botones SVG/PNG en https://developers.google.com/static/identity/images/signin-assets.zip. Para este proyecto se usará el icono oficial multicolor de Google, no un icono azul genérico ni un SVG generado.

## TikTok

Fuente oficial: https://developers.tiktok.com/doc/getting-started-design-guidelines

La documentación de TikTok enlaza sus guías de marca y paquetes de recursos para desarrolladores. La disponibilidad del proveedor de inicio de sesión depende de que Manus OAuth lo tenga habilitado; el botón no debe fingir autenticación si el proveedor no está configurado.

## Decisión

Se reemplazará el icono actual de Google por el recurso oficial multicolor. TikTok se añadirá únicamente si el portal OAuth de Manus acepta el proveedor; si no, se mostrará un estado deshabilitado o una explicación clara en lugar de crear un callback falso.
