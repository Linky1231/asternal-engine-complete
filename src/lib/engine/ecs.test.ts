import { describe, expect, it } from "vitest";
import type { Entity } from "./core";
import { hasEntityComponent, newRuntimeState, stepScene } from "./core";
import {
  addDefaultComponents,
  componentEntries,
  getComponent,
  hasComponent,
  normalizeEntityComponents,
  syncLegacyFields,
  withComponent,
  withoutComponent,
} from "./ecs";

function entity(overrides: Partial<Entity> = {}): Entity {
  return {
    id: "entity-1",
    kind: "decor",
    x: 10,
    y: 20,
    w: 32,
    h: 32,
    vx: 0,
    vy: 0,
    color: "#ffffff",
    solid: false,
    gravity: false,
    controllable: false,
    collectible: false,
    hazard: false,
    goal: false,
    visible: true,
    opacity: 1,
    ...overrides,
  };
}

describe("sistema ECS", () => {
  it("migra una entidad legacy a Transform y Renderer sin borrar sus campos", () => {
    const legacy = entity({ kind: "platform", solid: true, gravity: false, color: "#123456" });
    const migrated = addDefaultComponents(legacy);

    expect(hasComponent(migrated, "transform")).toBe(true);
    expect(hasComponent(migrated, "renderer")).toBe(true);
    expect(hasComponent(migrated, "collider")).toBe(true);
    expect(migrated.x).toBe(10);
    expect(migrated.color).toBe("#123456");
    expect(getComponent<{ solid: boolean }>(migrated, "collider")?.solid).toBe(true);
  });

  it("permite combinaciones que no dependen de EntityKind", () => {
    const strange = withComponent(
      withComponent(entity({ kind: "decor" }), "light", { intensity: 2.5, radius: 120 }),
      "camera",
      { primary: true, zoom: 1.4 },
    );
    const composed = withComponent(strange, "rigidbody", { gravity: true, mass: 10 });

    expect(hasComponent(composed, "light")).toBe(true);
    expect(hasComponent(composed, "camera")).toBe(true);
    expect(getComponent<{ mass: number }>(composed, "rigidbody")?.mass).toBe(10);
    expect(composed.kind).toBe("decor");
    expect(componentEntries(composed).map(([type]) => type)).toEqual(["light", "camera", "rigidbody"]);
  });

  it("sincroniza componentes explícitos hacia los campos legacy usados por sistemas existentes", () => {
    const composed = withComponent(
      withComponent(entity({ color: "#111111", gravity: false }), "renderer", { color: "#00ff99", opacity: 0.5 }),
      "rigidbody",
      { gravity: true, velocity: { x: 80, y: -20, z: 0 } },
    );
    const synced = syncLegacyFields(composed);

    expect(synced.color).toBe("#00ff99");
    expect(synced.opacity).toBe(0.5);
    expect(synced.gravity).toBe(true);
    expect(synced.vx).toBe(80);
    expect(synced.vy).toBe(-20);
  });

  it("resuelve capacidades desde componentes y conserva fallback legacy", () => {
    const legacy = entity({ solid: true, gravity: true, controllable: true });
    expect(hasEntityComponent(legacy, "collider", legacy.solid)).toBe(true);
    expect(hasEntityComponent(legacy, "rigidbody", legacy.gravity)).toBe(true);
    expect(hasEntityComponent(legacy, "controller", legacy.controllable)).toBe(true);

    const disabled = withComponent(legacy, "collider", { enabled: false, solid: true });
    expect(hasEntityComponent(disabled, "collider", disabled.solid)).toBe(false);
  });

  it("conserva componentes personalizados al serializar y deserializar una escena", () => {
    const source = withComponent(entity({ kind: "decor" }), "custom", { portal: { enabled: true, target: "secret-room", charge: 3 } });
    const roundTrip = JSON.parse(JSON.stringify({ entities: [source] })) as { entities: Entity[] };
    expect(roundTrip.entities[0].components?.custom?.portal).toEqual({ enabled: true, target: "secret-room", charge: 3 });
  });

  it("ejecuta una combinación ECS arbitraria aunque no tenga flags legacy", () => {
    const actor = withComponent(withComponent(entity({ kind: "decor", controllable: false, gravity: false }), "controller", { enabled: true }), "rigidbody", { enabled: true, gravity: true, mass: 2, drag: 0 });
    const scene = { id: "ecs-scene", name: "ECS", bg: "#000", gravity: 900, width: 640, height: 360, entities: [actor] };
    const state = newRuntimeState(scene);
    stepScene(scene, { left: false, right: true, jump: false }, state, 1 / 60);
    expect(actor.vx).toBeGreaterThan(0);
    expect(actor.vy).toBeGreaterThan(0);
  });

  it("permite desactivar y quitar componentes sin afectar los demás", () => {
    const composed = normalizeEntityComponents(entity({ solid: true }));
    const disabled = withComponent(composed, "light", { enabled: false, intensity: 4 });
    const removed = withoutComponent(disabled, "light");

    expect(hasComponent(disabled, "light")).toBe(false);
    expect(hasComponent(disabled, "collider")).toBe(true);
    expect(removed.components?.light).toBeUndefined();
    expect(hasComponent(removed, "transform")).toBe(true);
  });
});
