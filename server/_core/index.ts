import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { completeOrionChat } from "../orion";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "96kb" }));

app.post("/api/orion/chat", async (req, res) => {
  try {
    const result = await completeOrionChat(req.body?.history, req.body?.options);
    res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "No se pudo consultar a Orión.";
    res.status(400).json({ error: message });
  }
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// `index.ts` y el cliente de Vite se publican juntos dentro de `dist`.
// Resolver desde el propio directorio del bundle hace que el fallback SPA
// funcione también en el contenedor de producción.
const publicDirectory = dirname;
app.use(express.static(publicDirectory));
app.use((_req, res) => res.sendFile(path.join(publicDirectory, "index.html")));

const port = Number(process.env.PORT);
if (!Number.isFinite(port) || port <= 0) throw new Error("El entorno debe proporcionar un puerto para iniciar el servidor.");
app.listen(port, () => console.log(`Asternal disponible en el puerto ${port}`));
