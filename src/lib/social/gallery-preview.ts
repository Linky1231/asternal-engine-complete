export function galleryPreviewAuthor(username?: string | null): string {
  const normalized = username?.trim();
  return normalized ? `@${normalized}` : "Artista";
}

export function galleryPreviewPrice(value?: number | null): string {
  return new Intl.NumberFormat("es-ES", { maximumFractionDigits: 0 }).format(Math.max(0, value ?? 0));
}
