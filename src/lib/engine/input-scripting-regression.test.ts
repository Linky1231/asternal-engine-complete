import { describe, expect, it } from "vitest";
import { addDefaultComponents } from "./ecs";
import { newRuntimeState, stepScene, type Entity, type Scene } from "./core";
import { createScriptRunner } from "./scripts";

function player(): Entity {
  return addDefaultComponents({
    id: "player",
    kind: "player",
    x: 40,
    y: 40,
    w: 32,
    h: 32,
    vx: 0,
    vy: 0,
    color: "#fff",
    solid: true,
    gravity: false,
    controllable: true,
    collectible: false,
    hazard: false,
    goal: false,
  });
}

function sceneOf(entity: Entity): Scene {
  return { id: "scene", name: "Regression", bg: "#000", gravity: 0, width: 640, height: 360, entities: [entity] };
}

describe("input and scripting regressions", () => {
  it("moves an ECS controller from the same left/right input produced by a joystick", () => {
    const entity = player();
    const scene = sceneOf(entity);
    const state = newRuntimeState(scene);

    stepScene(scene, { left: false, right: true, jump: false }, state, 1 / 60);

    expect(entity.vx).toBeGreaterThan(0);
    expect(entity.x).toBeGreaterThan(40);
  });

  it("runs a code-only script when serialized blocks are absent", () => {
    const entity = player();
    entity.scripts = [{
      id: "code-only",
      event: "onStart",
      code: "object.position = { ...object.position, x: 128 };",
    } as never];
    const scene = sceneOf(entity);
    const runner = createScriptRunner();

    runner.step(scene, newRuntimeState(scene), { left: false, right: false, jump: false }, { shake: () => undefined, restart: () => undefined }, 1 / 60);

    expect(entity.x).toBe(128);
  });
});

  it("follows the controller player instead of another entity", () => {
    const entity = player();
    entity.x = 300;
    const cameraLikeEntity = { ...player(), id: "camera-like", controllable: false, x: 20, y: 20 };
    const scene = sceneOf(entity);
    scene.entities.push(cameraLikeEntity);
    const state = newRuntimeState(scene);

    stepScene(scene, { left: false, right: false, jump: false }, state, 1 / 60);

    expect(state.cameraX).toBeCloseTo(entity.x - 160, 5);
  });
