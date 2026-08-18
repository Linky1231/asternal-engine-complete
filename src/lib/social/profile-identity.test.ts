import { describe, expect, it } from "vitest";
import { profileIdentity } from "./profile-identity";

describe("identidad de perfil", () => {
  it("evita repetir el mismo nombre de usuario como nombre visible", () => {
    expect(profileIdentity("linkychronicles", "linkychronicles")).toEqual({
      displayName: null,
      handle: "@linkychronicles",
    });
  });

  it("mantiene nombre visible y usuario cuando realmente son distintos", () => {
    expect(profileIdentity("Asternal", "linkychronicles")).toEqual({
      displayName: "Asternal",
      handle: "@linkychronicles",
    });
  });
});
