# Base44 Dev Environment

## Stack
Vite 7 + React 19 + TanStack Router + Tailwind v4 + shadcn/ui. Package manager: **pnpm** (lockfile `pnpm-lock.yaml`).

## Running
`docker compose -f docker-compose.base44.yml up -d` — single `web` service (node:22) bind-mounts the repo, installs deps via corepack/pnpm at startup, and runs `vite --host` on port 5173, mapped to host port 3000.

## Backend
The app talks to **Supabase**, NOT Convex (the README is a generic template; the `convex/` dir is unused by `src/`). The Supabase client (`src/integrations/supabase/client.ts`) has:
- Embedded default project URL + anon key, so it connects to a real Supabase project with zero config.
- A full **localStorage fallback** when no credentials are present — auth, data, and storage all work in-browser.

No external secrets are required to boot. The index route (`/`) redirects unauthenticated users to `/auth`; that is expected behavior, not an error.

## Optional: Orion AI chat
The Orion assistant (`server/orion.ts`, exposed at `POST /api/orion/chat` via a Vite dev middleware) calls an LLM through `server/ai-provider.ts`. It needs either `ORION_AI_BASE_URL` + `ORION_AI_API_KEY` + `ORION_AI_MODEL`, or `BUILT_IN_FORGE_API_URL` + `BUILT_IN_FORGE_API_KEY`. Without them the app boots fine; only the Orion chat panel errors when opened. These are server-side `process.env` vars (not `VITE_`), so add them to the `web` service `environment:` (or `/run/base44/app.env`) if you want Orion working.

## Preview host
`vite.config.ts` `server.allowedHosts` is set to `true` so the preview's rotating external hostname isn't blocked. Do NOT narrow it back to a fixed domain list.

## Verify
`curl -sf -H "Host: 3000-preview.example.com" http://localhost:3000/` must return the Vite HTML (with `/@vite/client`). The served page must include `@react-refresh` / `@vite/client` scripts — that confirms live source, not a prebuilt bundle.
