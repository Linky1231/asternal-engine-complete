import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const distDir = resolve(fileURLToPath(new URL(".", import.meta.url)), "public");
const port = Number(process.env.PORT || 3000);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};

function safeFile(pathname) {
  const requested = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const candidate = normalize(join(distDir, requested));
  return candidate.startsWith(distDir) && existsSync(candidate) && statSync(candidate).isFile()
    ? candidate
    : join(distDir, "index.html");
}

createServer((request, response) => {
  const pathname = new URL(request.url || "/", "http://localhost").pathname;
  const file = safeFile(pathname);
  response.writeHead(200, {
    "Content-Type": types[extname(file)] || "application/octet-stream",
    "Cache-Control": file.endsWith("index.html") ? "no-cache" : "public, max-age=31536000, immutable",
  });
  createReadStream(file).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Asternal Engine listening on ${port}`);
});
