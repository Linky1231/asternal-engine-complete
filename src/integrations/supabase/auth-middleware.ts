// Compatibilidad retroactiva para imports antiguos. La autenticación real la
// resuelve Manus OAuth/tRPC en el servidor; este módulo ya no inicializa Supabase.

export const requireSupabaseAuth = {
  type: "function" as const,
  server: () => ({
    async next(ctx?: { context?: Record<string, unknown> }) {
      return ctx?.context
        ? { context: { ...ctx.context, userId: null, claims: null } }
        : { context: { userId: null, claims: null } };
    },
  }),
};
