import { describe, expect, it } from "vitest";
import { friendlyAuthError } from "../src/lib/auth/friendly-error";
import { nextExclusiveFooterAction, optimisticFollowStats, postFooterActionIsActive, profileControlStateClass, socialActionStateClass } from "../src/lib/social/interaction-state";
import { galleryPreviewAuthor, galleryPreviewPrice, isArtistGalleryArtwork } from "../src/lib/social/gallery-preview";
import { galleryDetailMotion } from "../src/lib/social/gallery-detail-motion";
import { qrPreviewGeometry } from "../src/lib/social/qr-preview";
import { postSurfaceClass } from "../src/lib/social/post-surface";

describe("mensajes de acceso", () => {
  it("traduce el fallo técnico de credenciales a una explicación clara", () => {
    expect(friendlyAuthError("Load Failed")).toBe("Usuario o contraseña incorrectos. Revísalos e inténtalo de nuevo.");
  });
});

describe("estado visual de acciones sociales", () => {
  it("usa el azul de marca para una acción seleccionada", () => {
    const state = socialActionStateClass(true);
    expect(state).toContain("bg-primary/15");
    expect(state).toContain("text-primary");
  });

  it("mantiene una acción inactiva sin fondo seleccionado", () => {
    const state = socialActionStateClass(false);
    expect(state).toContain("bg-transparent");
    expect(state).toContain("text-muted-foreground");
  });

  it("mantiene los controles de Perfil neutros hasta que su panel esté abierto", () => {
    const neutral = profileControlStateClass(false);
    expect(neutral).toContain("bg-surface");
    expect(neutral).not.toContain("bg-primary");

    const active = profileControlStateClass(true);
    expect(active).toContain("bg-primary");
    expect(active).toContain("text-primary-foreground");
  });

  it("mantiene un único foco visual entre las acciones inferiores de una publicación", () => {
    expect(nextExclusiveFooterAction(null, "like")).toBe("like");
    expect(nextExclusiveFooterAction("like", "favorite")).toBe("favorite");
    expect(nextExclusiveFooterAction("repost", "repost")).toBeNull();
  });

  it("reserva el azul del pie para las acciones propias y no para un foco temporal", () => {
    const ownActions = { liked: true, favorited: false, reposted: true, commentsOpen: false };
    expect(postFooterActionIsActive("like", ownActions)).toBe(true);
    expect(postFooterActionIsActive("favorite", ownActions)).toBe(false);
    expect(postFooterActionIsActive("repost", ownActions)).toBe(true);
    expect(postFooterActionIsActive("comments", ownActions)).toBe(false);
    expect(postFooterActionIsActive("comments", { ...ownActions, commentsOpen: true })).toBe(true);
  });

  it("actualiza el seguimiento y su contador de forma optimista sin valores negativos", () => {
    const following = optimisticFollowStats({ followers: 4, i_follow: false }, true);
    expect(following).toEqual({ followers: 5, i_follow: true });
    expect(optimisticFollowStats({ followers: 0, i_follow: true }, false)).toEqual({ followers: 0, i_follow: false });
  });

  it("reserva un margen de seguridad con el marco QR redondeado predeterminado", () => {
    expect(qrPreviewGeometry(240, "rounded")).toEqual({ padding: 16, frameSize: 272 });
  });
});

describe("vista previa de obras", () => {
  it("muestra un autor claro sin añadir metadatos secundarios a la tarjeta", () => {
    expect(galleryPreviewAuthor("criper")).toBe("@criper");
    expect(galleryPreviewAuthor(" ")).toBe("Artista");
  });

  it("muestra el precio como un número compacto y no negativo", () => {
    expect(galleryPreviewPrice(8195)).toBe("8195");
    expect(galleryPreviewPrice(-10)).toBe("0");
  });

  it("limita la Galería a obras artísticas y excluye assets heredados de la antigua Tienda", () => {
    expect(isArtistGalleryArtwork({ category: "artwork", asset_preset: null })).toBe(true);
    expect(isArtistGalleryArtwork({ category: "artwork", asset_preset: { kind: "sprite" } })).toBe(false);
    expect(isArtistGalleryArtwork({ category: "game_asset", asset_preset: null })).toBe(false);
    expect(isArtistGalleryArtwork(undefined)).toBe(false);
  });
});

describe("capas Azure Drift de publicaciones", () => {
  it("usa una superficie azul suave para el juego fijado sin emplear fondos negros", () => {
    const game = postSurfaceClass("game");
    expect(game).toContain("bg-primary");
    expect(game).toContain("border-primary");
    expect(game).not.toContain("bg-black");
  });

  it("mantiene las piezas informativas en capas azules y no las convierte en acciones principales", () => {
    for (const kind of ["poll", "html", "locked"] as const) {
      const surface = postSurfaceClass(kind);
      expect(surface).toContain("bg-primary");
      expect(surface).not.toContain("grad-brand");
    }
  });
});

describe("apertura del detalle de obras", () => {
  it("usa una transición breve y desactiva el movimiento si el usuario lo solicita", () => {
    expect(galleryDetailMotion(false).panel.duration).toBe(0.24);
    expect(galleryDetailMotion(true)).toEqual({
      overlay: { duration: 0 },
      panel: { duration: 0 },
      initialPanel: false,
    });
  });
});
