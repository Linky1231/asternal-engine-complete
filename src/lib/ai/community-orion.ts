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

async function callCommunityOrion<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Inicia sesión para que Orión revise la publicación.");

  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || "Orión no pudo completar esta revisión.");
  return payload;
}

/** Revisión obligatoria antes de subir texto y metadatos de una publicación. */
export async function reviewPostWithOrion(input: PostReviewInput): Promise<ReviewResponse> {
  return callCommunityOrion<ReviewResponse>("/api/orion/review-post", input);
}

export function rankingCacheKey(posts: Array<Pick<PostWithMeta, "id">>, followingAuthorIds: string[]) {
  const followingKey = [...followingAuthorIds].sort().join(",");
  return `asternal_orion_ranking:${posts.map(post => post.id).join(",")}:${followingKey}`;
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
 * Pide un orden semántico sin enviar likes, favoritos, comentarios ni republicaciones.
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
      posts: posts.slice(0, 60).map(post => ({
        id: post.id,
        authorId: post.author_id,
        authorName: post.author?.display_name ?? post.author?.username ?? "Creador",
        content: post.content.slice(0, 700),
        tags: post.tags.slice(0, 8),
        postType: post.post_type ?? "",
        category: post.category ?? "",
        createdAt: post.created_at,
        followedAuthor: following.has(post.author_id),
      })),
    });
    const orderedIds = Array.isArray(response.orderedIds) ? response.orderedIds : [];
    if (orderedIds.length) {
      try { sessionStorage.setItem(key, JSON.stringify(orderedIds)); } catch { /* ignore */ }
      return preserveAllRankedPosts(posts, orderedIds);
    }
  } catch { /* el orden cronológico es el respaldo fiable */ }
  return posts;
}
