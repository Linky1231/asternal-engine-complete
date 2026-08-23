/**
 * Contrato visual compartido para acciones sociales.
 * Una selección se confirma con un gris sobrio, no con un bloque azul persistente.
 */
export function socialActionStateClass(active: boolean): string {
  return active
    ? "border-border/70 bg-muted/75 text-foreground shadow-sm"
    : "border-transparent bg-transparent text-muted-foreground pointer-fine:hover:bg-muted/50 pointer-fine:hover:text-foreground";
}

/** Acciones de Perfil: el azul se reserva para el panel que ya está abierto. */
export function profileControlStateClass(active: boolean): string {
  return active
    ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
    : "border-border bg-surface text-foreground hover:bg-muted/60";
}
