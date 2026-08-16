import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(scriptsDir, "..");
const output = resolve(projectRoot, "dist", "index.js");

await mkdir(dirname(output), { recursive: true });
await copyFile(resolve(scriptsDir, "static-server.mjs"), output);
