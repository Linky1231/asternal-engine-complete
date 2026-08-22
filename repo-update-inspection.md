# Inspección de actualización externa

Repositorio solicitado: <https://github.com/Linky1231/asternal-engine>.

La inspección del 22 de agosto de 2026 identificó la rama `main` y la revisión `e0089f9c43b132665cc9d0984a552639fc1b7b68`, etiquetada como `v2026.08.22.0411`. El repositorio indica 412 commits, 1 rama y 51 etiquetas. Su último cambio modifica `src/components/social/GamePageSection.tsx` y los cambios recientes incluyen correcciones de Feed, publicaciones y donaciones de orbes.

La comparación de historial no encontró un ancestro Git compartido con el proyecto actual de Manus. La versión entrante conserva infraestructura basada en Convex y Supabase, mientras que Asternal en Manus ya utiliza servidor Express, tRPC, Drizzle/MySQL y almacenamiento S3. Por tanto, una sustitución literal sobrescribiría la migración de datos e infraestructura ya realizada; la integración debe transferir los cambios funcionales y de interfaz por módulos, conservando la capa de Manus.

## Fuente

- [Repositorio público de Asternal Engine](https://github.com/Linky1231/asternal-engine), consultado el 22 de agosto de 2026.
