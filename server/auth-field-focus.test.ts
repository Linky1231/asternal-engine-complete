import { describe, expect, it } from "vitest";
import {
  AUTH_FIELD_FOCUS_CLASS,
  AUTH_FIELD_FOCUS_ICON_CLASS,
  AUTH_FIELD_INPUT_FOCUS_CLASS,
} from "../src/lib/auth/field-focus";

describe("foco de los campos de acceso", () => {
  it("usa un anillo sutil y evita el contorno nativo duplicado", () => {
    expect(AUTH_FIELD_FOCUS_CLASS).toContain("ring-1");
    expect(AUTH_FIELD_FOCUS_CLASS).not.toContain("ring-[3px]");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus-visible:outline-none");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus-visible:ring-0");
  });

  it("neutraliza el borde y la sombra del input interno para no cortar el marco junto al icono", () => {
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("border-0");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("!border-transparent");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("!shadow-none");
    expect(AUTH_FIELD_INPUT_FOCUS_CLASS).toContain("focus-visible:!shadow-none");
  });

  it("mantiene el icono por encima del estado de foco", () => {
    expect(AUTH_FIELD_FOCUS_ICON_CLASS).toContain("text-primary");
  });
});
