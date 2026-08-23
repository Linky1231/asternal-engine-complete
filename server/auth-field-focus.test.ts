import { describe, expect, it } from "vitest";
import {
  AUTH_FIELD_FOCUS_CLASS,
  AUTH_FIELD_FOCUS_ICON_CLASS,
  AUTH_FIELD_INPUT_FOCUS_CLASS,
} from "../src/lib/auth/field-focus";

describe("foco de los campos de acceso", () => {
  it("usa un único borde y evita anillos o contornos nativos duplicados", () => {
    expect(AUTH_FIELD_FOCUS_CLASS).toContain("border-primary/45");
    expect(AUTH_FIELD_FOCUS_CLASS).not.toContain("ring-");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus-visible:outline-none");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus-visible:ring-0");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus:outline-none");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus:shadow-none");
  });

  it("mantiene el icono por encima del estado de foco", () => {
    expect(AUTH_FIELD_FOCUS_ICON_CLASS).toContain("text-primary");
  });
});
