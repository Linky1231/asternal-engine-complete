import { describe, expect, it } from "vitest";
import { friendlyAuthError } from "../src/lib/auth/friendly-error";
import { socialActionStateClass } from "../src/lib/social/interaction-state";
import { galleryPreviewAuthor, galleryPreviewPrice, isArtistGalleryArtwork } from "../src/lib/social/gallery-preview";
import { galleryDetailMotion } from "../src/lib/social/gallery-detail-motion";

describe("mensajes de acceso", () => {
  it("traduce el fallo técnico de credenciales a una explicación clara", () => {
    expect(friendlyAuthError("Load Failed")).toBe("Usuario o contraseña incorrectos. Revísalos e inténtalo de nuevo.");
  });
});

describe("estado visual de acciones sociales", () => {
  it("usa un gris neutro para una acción seleccionada", () => {
    const state = socialActionStateClass(true);
    expect(state).toContain("bg-muted/75");
    expect(state).not.toContain("bg-primary");
  });

  it("mantiene una acción inactiva sin fondo seleccionado", () => {
    const state = socialActionStateClass(false);
    expect(state).toContain("bg-transparent");
    expect(state).toContain("text-muted-foreground");
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
