export function galleryPreviewAuthor(username?: string | null): string {
  const normalized = username?.trim();
  return normalized ? `@${normalized}` : "Artista";
}
