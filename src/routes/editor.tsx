import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AsternalEditor = lazy(() => import("@/components/engine/AsternalEditor").then((module) => ({ default: module.AsternalEditor })));

export const Route = createFileRoute("/editor")({
  head: () => ({ meta: [{ title: "Editor · Asternal" }] }),
  component: () => (
    <Suspense fallback={<div className="h-screen grid place-items-center bg-background"><span className="w-5 h-5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" aria-label="Cargando el editor" /></div>}>
      <AsternalEditor />
    </Suspense>
  ),
});
