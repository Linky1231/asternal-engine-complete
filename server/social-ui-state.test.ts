import { describe, expect, it } from "vitest";
import { friendlyAuthError } from "../src/lib/auth/friendly-error";
import { socialActionStateClass } from "../src/lib/social/interaction-state";

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
