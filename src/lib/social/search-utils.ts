export function messagePreview(m: { kind: string | null; media_type: string | null; content: string | null }): string {
  const media = (m.media_type ?? "").toLowerCase();
  if (media.startsWith("video")) return "🎬 Vídeo";
  if (media === "audio") return "🎤 Audio de voz";
  if (media === "sticker") return "🖼️ Sticker";
  if (media.startsWith("image")) return "🖼️ Foto";
  if (m.kind === "poll") return `📊 Encuesta: ${m.content ?? ""}`;
  if (m.kind === "gift") return `🎁 Paquete de regalos: ${m.content ?? ""}`;
  if (m.kind === "announcement") return `📢 Aviso: ${m.content ?? ""}`;
  return m.content ?? "";
}
