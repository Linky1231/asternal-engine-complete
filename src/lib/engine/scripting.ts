import type { Entity, EntityKind, RuntimeInput, RuntimeState, Scene, UIElement } from "./core";
import { KIND_PRESETS, uid as coreUid } from "./core";
import { getEntityTransform, updateEntityTransform } from "./transforms";
import { addDefaultComponents, getComponent, hasComponent, withComponent, withoutComponent } from "./ecs";
import { playSound, type SoundName } from "./sfx";

export interface ScriptRuntimeHooks {
  shake?: (intensity: number, duration: number) => void;
  restart?: () => void;
  loadScene?: (sceneId: string) => void;
}

export interface ScriptApiContext {
  self: Entity;
  other?: Entity;
  scene: Scene;
  state: RuntimeState;
  input: RuntimeInput;
  hooks: ScriptRuntimeHooks;
  dt: number;
}

export interface ScriptObjectApi {
  readonly id: string;
  readonly kind: EntityKind;
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  pivot: { x: number; y: number; z: number };
  parent: ScriptObjectApi | null;
  readonly children: ScriptObjectApi[];
  getComponent<T = unknown>(type: string): T | undefined;
  addComponent(type: string, data?: Record<string, unknown>): void;
  removeComponent(type: string): void;
  destroy(): void;
}

const vector = (value: { x: number; y: number; z: number }) => ({ x: value.x, y: value.y, z: value.z });

export function createScriptApi(context: ScriptApiContext) {
  const { self, scene, state, input, hooks } = context;
  const find = (id: string | null | undefined) => scene.entities.find(entity => entity.id === id) ?? null;
  const objectFor = (entity: Entity | null): ScriptObjectApi | null => entity ? makeObjectApi(entity) : null;

  function makeObjectApi(entity: Entity): ScriptObjectApi {
    const api: ScriptObjectApi = {
      get id() { return entity.id; },
      get kind() { return entity.kind; },
      get name() { return entity.name ?? entity.kind; },
      set name(value: string) { entity.name = value; },
      get position() { const t = getEntityTransform(entity); return vector(t.position); },
      set position(value) { Object.assign(entity, updateEntityTransform(entity, { position: vector(value) })); },
      get rotation() { const t = getEntityTransform(entity); return vector(t.rotation); },
      set rotation(value) { Object.assign(entity, updateEntityTransform(entity, { rotation: vector(value) })); },
      get scale() { const t = getEntityTransform(entity); return vector(getEntityTransform(entity).scale); },
      set scale(value) { Object.assign(entity, updateEntityTransform(entity, { scale: vector(value) })); },
      get pivot() { return vector(getEntityTransform(entity).pivot); },
      set pivot(value) { Object.assign(entity, updateEntityTransform(entity, { pivot: vector(value) })); },
      get parent() { return objectFor(find(entity.parentId)); },
      set parent(value) { entity.parentId = value?.id ?? null; },
      get children() { return scene.entities.filter(child => child.parentId === entity.id).map(makeObjectApi); },
      getComponent<T = unknown>(type: string) { return getComponent<T>(entity, type as never); },
      addComponent(type: string, data = {}) {
        const next = withComponent(entity, type as never, data);
        entity.components = next.components;
      },
      removeComponent(type: string) {
        const next = withoutComponent(entity, type as never);
        entity.components = next.components;
      },
      destroy() { entity.x = -99999; entity.visible = false; },
    };
    return api;
  }

  const object = makeObjectApi(self);
  const physics = {
    addForce(x = 0, y = 0, z = 0) {
      const body = getComponent<{ velocity?: { x: number; y: number; z: number }; enabled?: boolean }>(self, "rigidbody") ?? {};
      const velocity = body.velocity ?? { x: self.vx, y: self.vy, z: 0 };
      const next = { ...body, velocity: { x: velocity.x + x, y: velocity.y + y, z: velocity.z + z }, enabled: true };
      self.components = { ...(self.components ?? {}), rigidbody: next };
      self.vx += x;
      self.vy += y;
    },
    raycast(x: number, y: number, dx: number, dy: number, maxDistance = 1000) {
      const length = Math.hypot(dx, dy) || 1;
      const endX = x + (dx / length) * maxDistance;
      const endY = y + (dy / length) * maxDistance;
      const hit = scene.entities.find(entity => entity.id !== self.id && entity.solid && entity.x < Math.max(x, endX) && entity.x + entity.w > Math.min(x, endX) && entity.y < Math.max(y, endY) && entity.y + entity.h > Math.min(y, endY));
      return hit ? { hit: true, object: objectFor(hit), point: { x: hit.x, y: hit.y } } : { hit: false, object: null, point: { x: endX, y: endY } };
    },
  };
  const audio = {
    play(name: string = "blip", volume = 1) { void volume; playSound(name as SoundName); },
    stop() { /* WebAudio voices are intentionally fire-and-forget in the current engine. */ },
  };
  const camera = {
    setPosition(x: number, y: number, z = 0) {
      state.cameraX = x;
      (state as RuntimeState & { cameraY?: number; cameraZ?: number }).cameraY = y;
      (state as RuntimeState & { cameraY?: number; cameraZ?: number }).cameraZ = z;
      (scene as Scene & { camera?: unknown }).camera = { ...((scene as Scene & { camera?: Record<string, unknown> }).camera ?? {}), position: { x, y, z } };
    },
    setZoom(zoom: number) {
      (state as RuntimeState & { cameraZoom?: number }).cameraZoom = Math.max(0.1, zoom);
      (scene as Scene & { camera?: unknown }).camera = { ...((scene as Scene & { camera?: Record<string, unknown> }).camera ?? {}), zoom };
    },
  };
  const animation = {
    play(name: string, speed = 1) {
      const animator = getComponent<Record<string, unknown>>(self, "animator") ?? {};
      self.components = { ...(self.components ?? {}), animator: { ...animator, enabled: true, activeClip: name, speed } };
    },
    stop() { const animator = getComponent<Record<string, unknown>>(self, "animator") ?? {}; self.components = { ...(self.components ?? {}), animator: { ...animator, activeClip: null } }; },
  };
  const sceneApi = {
    load(sceneId: string) { hooks.loadScene?.(sceneId); },
    spawn(kind: EntityKind | string, x = self.x, y = self.y) {
      const preset = KIND_PRESETS[kind as EntityKind];
      if (!preset) return null;
      const spawned = addDefaultComponents({ ...preset, id: coreUid(), x, y });
      scene.entities.push(spawned);
      return objectFor(spawned);
    },
    restart() { hooks.restart?.(); },
  };
  const inputApi = { isPressed(key: "left" | "right" | "jump") { return input[key]; } };
  const ui = {
    createButton(label: string, x = 0, y = 0, action = "none" as UIElement["action"]) {
      const element: UIElement = { id: coreUid(), kind: "button", name: label, text: label, x, y, w: 140, h: 42, anchor: "tl", action, visible: true };
      scene.ui = [...(scene.ui ?? []), element];
      return element.id;
    },
    remove(id: string) { scene.ui = (scene.ui ?? []).filter(element => element.id !== id); },
  };
  return { object, other: objectFor(context.other ?? null), physics, audio, camera, animation, scene: sceneApi, input: inputApi, ui, state, dt: context.dt, log: (...args: unknown[]) => console.log("[script]", ...args) };
}

const FORBIDDEN_HOST_TOKENS = /\b(globalThis|window|document|fetch|location|localStorage|sessionStorage|eval|Function|constructor|prototype|__proto__)\b/;

export function executeScriptCode(code: string, context: ScriptApiContext): void {
  if (!code.trim()) return;
  if (FORBIDDEN_HOST_TOKENS.test(code)) {
    console.error("[script:error] Host globals are not available. Use the public engine API instead.");
    return;
  }
  try {
    const api = createScriptApi(context);
    const runner = new Function("api", `"use strict"; const { object, other, physics, audio, camera, animation, scene, input, ui, state, dt, log } = api; return (() => { ${code}\n })();`);
    runner(api);
  } catch (error) {
    console.error("[script:error]", error);
  }
}
