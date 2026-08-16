import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SubPageHeader } from "@/components/social/SubPageHeader";
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
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground">
      <SubPageHeader
        title="BUSCAR"
        icon={<Search size={15} />}
        subtitle="Encuentra cuentas, juegos, arte y publicaciones"
      />
      <main className="flex-1 max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto w-full px-3 py-3 pb-24">
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
