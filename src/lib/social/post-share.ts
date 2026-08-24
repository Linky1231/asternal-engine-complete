/** Marcador textual compatible con la columna `content` del chat actual. */
export const POST_SHARE_PREFIX = "[[asternal:post:v1:";
const POST_SHARE_RE = /\[\[asternal:post:v1:([A-Za-z0-9_-]+)\]\]/;

export type PostShareKind = "post" | "game" | "art" | "gallery" | "image" | "video" | "link";

export type PostShareOwner = {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string;
};

export type PostSharePreview = {
  id: string;
  content: string;
  kind: PostShareKind;
  imageUrl: string;
  sourceUrl: string;
};

export type PostSharePayload = {
  version: 1;
  owner: PostShareOwner;
  post: PostSharePreview;
};

export type PostShareInput = {
  owner: Partial<PostShareOwner> & { id: string };
  post: Partial<PostSharePreview> & { id: string };
};

const SAFE_KINDS = new Set<PostShareKind>(["post", "game", "art", "gallery", "image", "video", "link"]);

function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function cleanId(value: unknown): string {
  return cleanText(value, 128).replace(/[^a-zA-Z0-9_:-]/g, "");
}

function cleanHttpUrl(value: unknown): string {
  const raw = cleanText(value, 900);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : "";
  } catch {
    return "";
  }
}

/** Normaliza el snapshot antes de enviarlo o dibujarlo dentro del chat. */
export function normalizePostShare(input: unknown): PostSharePayload | null {
  if (!input || typeof input !== "object") return null;
  const candidate = input as Partial<PostSharePayload>;
  if (candidate.version !== 1 || !candidate.owner || !candidate.post) return null;

  const ownerId = cleanId(candidate.owner.id);
  const postId = cleanId(candidate.post.id);
  if (!ownerId || !postId) return null;

  const displayName = cleanText(candidate.owner.displayName, 60) || "Creador de Asternal";
  const username = cleanText(candidate.owner.username, 40).replace(/^@+/, "");
  const requestedKind = cleanText(candidate.post.kind, 16) as PostShareKind;

  return {
    version: 1,
    owner: {
      id: ownerId,
      displayName,
      username,
      avatarUrl: cleanHttpUrl(candidate.owner.avatarUrl),
    },
    post: {
      id: postId,
      content: cleanText(candidate.post.content, 480),
      kind: SAFE_KINDS.has(requestedKind) ? requestedKind : "post",
      imageUrl: cleanHttpUrl(candidate.post.imageUrl),
      sourceUrl: cleanHttpUrl(candidate.post.sourceUrl),
    },
  };
}

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string): string | null {
  try {
    const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

/** Serializa una publicación compartida como un marcador único compatible con `ChatMessage.content`. */
export function serializePostShare(input: PostShareInput | PostSharePayload): string {
  const payload = normalizePostShare({ ...input, version: 1 });
  if (!payload) throw new Error("La publicación no contiene datos válidos para compartir");
  return `${POST_SHARE_PREFIX}${encodeBase64Url(JSON.stringify(payload))}]]`;
}

/** Extrae una publicación compartida y valida todos sus campos. */
export function parsePostShare(content: string | null | undefined): PostSharePayload | null {
  if (!content) return null;
  const match = content.match(POST_SHARE_RE);
  if (!match?.[1]) return null;
  const decoded = decodeBase64Url(match[1]);
  if (!decoded) return null;
  try {
    return normalizePostShare(JSON.parse(decoded));
  } catch {
    return null;
  }
}

/** Oculta el marcador técnico del contenido visible del mensaje. */
export function stripPostShare(content: string | null | undefined): string {
  return (content ?? "").replace(POST_SHARE_RE, "").replace(/\n{3,}/g, "\n\n").trim();
}
