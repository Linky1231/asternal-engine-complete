import { supabase } from "@/integrations/supabase/client";
import type { PostWithMeta } from "@/lib/social/api";

export type PostReviewInput = {
  content: string;
  tags: string[];
  postTypes: string[];
  linkUrl?: string;
  htmlIncluded: boolean;
  documentNames: string[];
  hasMedia: boolean;
  pollQuestion?: string;
};

type ReviewResponse = {
  allowed: boolean;
  reason: string;
  summary: string;
};

type RankResponse = { orderedIds: string[] };

export type OriginalityCandidate = {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  tags: string[];
  postType: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  followedAuthor: boolean;
  media: { type: string; count: number; hasCover: boolean; screenshotCount: number };
  documentNames: string[];
  linkIncluded: boolean;
  htmlIncluded: boolean;
  textColorIncluded: boolean;
  poll: { question: string; optionCount: number } | null;
  pinnedGame: { title: string } | null;
  lockedContentIncluded: boolean;
};

type CommunityRequestOptions = {
  timeoutMs?: number;
  timeoutMessage?: string;
};

const RANKING_TIMEOUT_MS = 6_000;

/**
 * Evita que una llamada de IA pendiente retenga indefinidamente una pantalla
 * de carga. La operación recibe la señal para cancelar el fetch subyacente.
 */
export async function withCommunityRequestDeadline<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const expiration = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      controller.abort();
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([operation(controller.signal), expiration]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

async function callCommunityOrion<T>(path: string, body: unknown, options: CommunityRequestOptions = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Inicia sesión para que Orión revise la publicación.");

  const response = await withCommunityRequestDeadline(
    (signal) => fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      signal,
    }),
    options.timeoutMs ?? RANKING_TIMEOUT_MS,
    options.timeoutMessage ?? "Orión tardó demasiado en responder. Inténtalo de nuevo.",
  );
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Orión no pudo completar esta revisión.");
  return payload;
}

/** Revisión obligatoria antes de subir texto y metadatos de una publicación. */
export async function reviewPostWithOrion(input: PostReviewInput): Promise<ReviewResponse> {
  return callCommunityOrion<ReviewResponse>("/api/orion/review-post", input);
}

export function rankingCacheKey(posts: Array<Pick<PostWithMeta, "id"> & Partial<Pick<PostWithMeta, "updated_at" | "content" | "media_type" | "document_names" | "post_type">>>, followingAuthorIds: string[]) {
  const followingKey = [...followingAuthorIds].sort().join(",");
  const originalityRevision = posts.map((post) => [
    post.id,
    post.updated_at ?? "",
    post.content?.length ?? 0,
    post.media_type ?? "",
    post.document_names?.join(",") ?? "",
    post.post_type ?? "",
  ].join("~")).join("|");
  return `asternal_orion_originality:${originalityRevision}:${followingKey}`;
}

/** Construye solo señales útiles para la originalidad; las reacciones nunca salen del cliente. */
export function buildOriginalityCandidate(post: PostWithMeta, followingAuthorIds: Set<string>): OriginalityCandidate {
  return {
    id: post.id,
    authorId: post.author_id,
    authorName: post.author?.display_name ?? post.author?.username ?? "Creador",
    content: post.content.slice(0, 700),
    tags: post.tags.slice(0, 8),
    postType: post.post_type ?? "",
    category: post.category ?? "",
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    followedAuthor: followingAuthorIds.has(post.author_id),
    media: {
      type: post.media_type ?? "none",
      count: post.signed_media.slice(0, 4).length,
      hasCover: Boolean(post.signed_cover),
      screenshotCount: post.signed_screenshots.slice(0, 4).length,
    },
    documentNames: (post.signed_documents ?? []).map(document => document.name.slice(0, 120)).slice(0, 5),
    linkIncluded: Boolean(post.link_url),
    htmlIncluded: Boolean(post.html_content?.trim()),
    textColorIncluded: Boolean(post.text_color),
    poll: post.poll ? { question: post.poll.question.slice(0, 180), optionCount: post.poll.options.slice(0, 6).length } : null,
    pinnedGame: post.pinned_game ? { title: post.pinned_game.title.slice(0, 140) } : null,
    lockedContentIncluded: Boolean(post.locked_content?.trim()),
  };
}

/**
 * Aplica una preferencia de orden sin convertirla en un filtro: cada publicación
 * de origen aparece una sola vez, incluso si Orión devuelve una lista parcial,
 * repetida o con identificadores desconocidos.
 */
export function preserveAllRankedPosts(posts: PostWithMeta[], orderedIds: string[]) {
  const postMap = new Map(posts.map(post => [post.id, post]));
  const selected: PostWithMeta[] = [];
  for (const id of orderedIds) {
    const post = postMap.get(id);
    if (post) {
      selected.push(post);
      postMap.delete(id);
    }
  }
  return [...selected, ...posts.filter(post => postMap.has(post.id))];
}

/**
 * Pide una jerarquía de originalidad sin enviar likes, favoritos, comentarios ni republicaciones.
 * Si Orión no está disponible, preserva el orden cronológico seguro del origen.
 */
export async function rankFeedWithOrion(posts: PostWithMeta[], followingAuthorIds: string[] = []): Promise<PostWithMeta[]> {
  if (posts.length < 2) return posts;
  const key = rankingCacheKey(posts, followingAuthorIds);
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return preserveAllRankedPosts(posts, JSON.parse(cached) as string[]);
  } catch { /* el cache es solo una optimización */ }

  try {
    const following = new Set(followingAuthorIds);
    const response = await callCommunityOrion<RankResponse>("/api/orion/rank-feed", {
      posts: posts.slice(0, 60).map(post => buildOriginalityCandidate(post, following)),
    }, {
      timeoutMs: RANKING_TIMEOUT_MS,
      timeoutMessage: "La recomendación tardó demasiado; se mostrará el orden reciente.",
    });
    const orderedIds = Array.isArray(response.orderedIds) ? response.orderedIds : [];
    if (orderedIds.length) {
      try { sessionStorage.setItem(key, JSON.stringify(orderedIds)); } catch { /* ignore */ }
      return preserveAllRankedPosts(posts, orderedIds);
    }
  } catch { /* el orden cronológico es el respaldo fiable */ }
  return posts;
}
