import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { newProject, type Entity } from "./core";
import { loadProjectById, saveProjectById } from "./storage";

class MemoryStorage {
  private values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, String(value));
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

describe("persistencia de transformaciones", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", new MemoryStorage());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("normaliza una entidad heredada al recargar un proyecto guardado", () => {
    const project = newProject();
    const legacyEntity: Entity = {
      id: "legacy-platform",
      kind: "platform",
      x: 48,
      y: 96,
      z: 3,
      w: 120,
      h: 24,
      vx: 0,
      vy: 0,
      color: "#2563eb",
      solid: true,
      gravity: false,
      controllable: false,
      collectible: false,
      hazard: false,
      goal: false,
      rotation: 15,
    };

    project.scenes[0]?.entities.push(legacyEntity);
    saveProjectById("transform-persist-test", project);

    const loaded = loadProjectById("transform-persist-test");
    const entity = loaded?.scenes[0]?.entities.find(item => item.id === legacyEntity.id);

    expect(entity?.transform).toMatchObject({
      position: { x: 48, y: 96, z: 3 },
      rotation: { z: 15 },
      scale: { x: 1, y: 1, z: 1 },
    });
    expect(entity?.transformSnapping).toBeDefined();
  });
});
