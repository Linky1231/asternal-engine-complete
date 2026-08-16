import { describe, expect, it, vi } from "vitest";
import type { Entity, RuntimeState, Scene } from "./core";
import { addDefaultComponents } from "./ecs";
import { createScriptApi, executeScriptCode } from "./scripting";
import { createScriptRunner } from "./scripts";

function entity(id: string, x = 0, y = 0): Entity {
  return addDefaultComponents({
    id, kind: "decor", x, y, w: 32, h: 32, vx: 0, vy: 0, color: "#fff",
    solid: false, gravity: false, controllable: false, collectible: false, hazard: false, goal: false,
  });
}

function sceneOf(...entities: Entity[]): Scene {
  return { id: "scene", name: "Test", bg: "#000", gravity: 0, width: 640, height: 360, entities };
}

const state = (): RuntimeState => ({ score: 0, lives: 3, time: 0, win: false, dead: false, cameraX: 0, jumpPrev: false, djumpAvailable: false, coyoteT: 0, jumpBufferT: 0, invulnT: 0, speedT: 0, switches: {} });

describe("open scripting API", () => {
  it("exposes object transforms and parent/children through the real ECS transform", () => {
    const parent = entity("parent", 20, 30);
    const child = entity("child", 4, 5);
    child.parentId = parent.id;
    const scene = sceneOf(parent, child);
    const api = createScriptApi({ self: child, scene, state: state(), input: { left: false, right: false, jump: false }, hooks: {}, dt: 1 / 60 });

    api.object.position = { x: 90, y: 100, z: 0 };
    api.object.rotation = { x: 0, y: 0, z: 45 };
    expect(child.x).toBe(90);
    expect(child.y).toBe(100);
    expect(api.object.parent?.id).toBe("parent");
    expect(api.object.children).toHaveLength(0);
    expect(api.object.rotation.z).toBe(45);
  });

  it("provides physics, input, scene spawning and dynamic UI creation", () => {
    const player = entity("player", 20, 30);
    const scene = sceneOf(player);
    const api = createScriptApi({ self: player, scene, state: state(), input: { left: true, right: false, jump: false }, hooks: {}, dt: 1 / 60 });

    api.physics.addForce(12, -40);
    const spawned = api.scene.spawn("coin", 100, 120);
    const button = api.ui.createButton("OPEN", 12, 18);

    expect(api.input.isPressed("left")).toBe(true);
    expect(player.vx).toBe(12);
    expect(player.vy).toBe(-40);
    expect(spawned?.kind).toBe("coin");
    expect(scene.entities).toHaveLength(2);
    expect(scene.ui?.find(element => element.id === button)?.text).toBe("OPEN");
  });

  it("runs code scripts from the event runner and blocks host globals", async () => {
    const self = entity("runner", 0, 0);
    self.scripts = [{ id: "code", event: "onStart", blocks: [], code: "object.position = { ...object.position, x: 32 };" }];
    const scene = sceneOf(self);
    const runner = createScriptRunner();
    runner.step(scene, state(), { left: false, right: false, jump: false }, { shake: () => undefined, restart: () => undefined }, 1 / 60);
    expect(self.x).toBe(32);

    const error = vi.spyOn(console, "error").mockImplementation(() => undefined);
    executeScriptCode("window.alert('no')", { self, scene, state: state(), input: { left: false, right: false, jump: false }, hooks: {}, dt: 0 });
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it("executes serializable code with the public API and does not affect legacy blocks", async () => {
    const self = entity("self", 0, 0);
    const scene = sceneOf(self);
    const log = vi.spyOn(console, "log").mockImplementation(() => undefined);

    executeScriptCode("object.position = { ...object.position, x: 64 }; physics.addForce(5, -10); log('ready');", {
      self, scene, state: state(), input: { left: false, right: true, jump: false }, hooks: {}, dt: 1 / 30,
    });
    await Promise.resolve();

    expect(self.x).toBe(64);
    expect(self.vx).toBe(5);
    expect(self.vy).toBe(-10);
    expect(log).toHaveBeenCalledWith("[script]", "ready");
    log.mockRestore();
  });
});
