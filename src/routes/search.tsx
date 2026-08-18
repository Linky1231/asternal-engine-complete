import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { GlobalSearchPanel } from "@/components/social/GlobalSearchPanel";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Buscar · Asternal" },
      { name: "description", content: "Busca cuentas, juegos, arte, publicaciones y más contenido de Asternal." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (active && !session) navigate({ to: "/auth" });
    });
    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen w-full bg-background px-3 py-3 text-foreground sm:px-5 sm:py-5 lg:px-8">
      <main className="mx-auto w-full max-w-5xl pb-20">
        <GlobalSearchPanel
          defaultScope="all"
          standalone
          onClose={() => navigate({ to: "/" })}
          onOpenMessage={() => navigate({ to: "/" })}
        />
      </main>
    </div>
  );
}
