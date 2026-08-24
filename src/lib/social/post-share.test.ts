import { describe, expect, it } from "vitest";
import { parsePostShare, serializePostShare, stripPostShare } from "./post-share";

const snapshot = {
  owner: {
    id: "creator-42",
    displayName: "Lina Creadora",
    username: "lina",
    avatarUrl: "https://cdn.example.com/lina.png",
  },
  post: {
    id: "post-88",
    content: "La primera escena de mi aventura ya está lista.",
    kind: "game" as const,
    imageUrl: "https://cdn.example.com/scene.png",
    sourceUrl: "https://asternal.example/feed?p=post-88",
  },
};

describe("post share payload", () => {
  it("serializa, recupera y oculta una publicación compartida", () => {
    const encoded = serializePostShare(snapshot);
    const content = `Mira esto\n${encoded}`;
    const parsed = parsePostShare(content);

    expect(parsed?.owner.displayName).toBe("Lina Creadora");
    expect(parsed?.post).toEqual(snapshot.post);
    expect(stripPostShare(content)).toBe("Mira esto");
  });

  it("rechaza URLs y tipos no seguros", () => {
    const encoded = serializePostShare({
      ...snapshot,
      owner: { ...snapshot.owner, avatarUrl: "javascript:alert(1)" },
      post: { ...snapshot.post, kind: "unknown" as "game", imageUrl: "data:text/html,bad" },
    });
    const parsed = parsePostShare(encoded);

    expect(parsed?.owner.avatarUrl).toBe("");
    expect(parsed?.post.kind).toBe("post");
    expect(parsed?.post.imageUrl).toBe("");
    expect(parsePostShare("[[asternal:post:v1:not-json]]")).toBeNull();
  });
});
