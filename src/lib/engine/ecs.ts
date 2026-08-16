import type { ComponentType, Entity, EntityComponents, EntityKind, RendererComponent, TransformComponent } from "./core";
import { getEntityTransform, updateEntityTransform } from "./transforms";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export function hasComponent(entity: Entity, type: ComponentType): boolean {
  const component = entity.components?.[type];
  return component !== undefined && component !== null && (typeof component !== "object" || (component as { enabled?: boolean }).enabled !== false);
}

export function getComponent<T = unknown>(entity: Entity, type: ComponentType): T | undefined {
  const component = entity.components?.[type];
  if (component === undefined || component === null) return undefined;
  if (typeof component === "object" && (component as { enabled?: boolean }).enabled === false) return undefined;
  return component as T;
}

export function withComponent<T extends object>(entity: Entity, type: ComponentType, value: T): Entity {
  return { ...entity, components: { ...(entity.components ?? {}), [type]: clone(value) } };
}

export function withoutComponent(entity: Entity, type: ComponentType): Entity {
  if (!entity.components?.[type]) return entity;
  const components = { ...entity.components };
  delete components[type];
  return { ...entity, components };
}

export function normalizeEntityComponents(entity: Entity): Entity {
  const transform = getEntityTransform(entity);
  const existing = entity.components ?? {};
  const components: EntityComponents = {
    ...existing,
    transform: { ...transform, ...(existing.transform ?? {}) } as TransformComponent,
    renderer: {
      color: entity.color,
      texture: entity.texture ?? null,
      textureFit: entity.textureFit,
      opacity: entity.opacity ?? 1,
      visible: entity.visible ?? true,
      flipX: entity.flipX,
      flipY: entity.flipY,
      z: entity.z,
      ...(existing.renderer ?? {}),
    } satisfies RendererComponent,
  };

  if (entity.solid || entity.hitbox || existing.collider) components.collider = { solid: entity.solid, hitbox: entity.hitbox ?? null, ...(existing.collider ?? {}) };
  if (entity.gravity || entity.vx !== 0 || entity.vy !== 0 || existing.rigidbody) components.rigidbody = { gravity: entity.gravity, velocity: { x: entity.vx, y: entity.vy, z: 0 }, ...(existing.rigidbody ?? {}) };
  if (entity.collectible || existing.collectible) components.collectible = { value: entity.value, ...(existing.collectible ?? {}) };
  if (entity.hazard || existing.hazard) components.hazard = { ...(existing.hazard ?? {}) };
  if (entity.goal || existing.goal) components.goal = { nextSceneId: entity.nextSceneId, endsGame: entity.endsGame, ...(existing.goal ?? {}) };
  if (entity.checkpoint || existing.checkpoint) components.checkpoint = { ...(existing.checkpoint ?? {}) };
  if (entity.moving || existing.moving) components.moving = { axis: "x", range: 120, speed: 60, ...(entity.moving ?? {}), ...(existing.moving ?? {}) };
  if (entity.crumble || existing.crumble) components.crumble = { delay: 1, respawn: 3, ...(entity.crumble ?? {}), ...(existing.crumble ?? {}) };
  if (entity.spring || existing.spring) components.spring = { force: 720, ...(entity.spring ?? {}), ...(existing.spring ?? {}) };
  if (entity.patrol || existing.patrol) components.patrol = { range: 160, ledgeSafe: true, ...(entity.patrol ?? {}), ...(existing.patrol ?? {}) };
  if (entity.powerup || existing.powerup) components.powerup = { kind: entity.powerup ?? "speed", ...(existing.powerup ?? {}) };
  if (entity.emitter || existing.particleEmitter) components.particleEmitter = { enabled: true, rate: 10, lifetime: 1, speed: 80, direction: 0, spread: 30, size: 3, gravity: 0, color: "#7dd3fc", ...(entity.emitter ?? {}), ...(existing.particleEmitter ?? {}) };
  if (entity.scripts || existing.script) components.script = { scripts: entity.scripts ?? [], ...(existing.script ?? {}) };
  if (entity.animations || entity.transformTrack || existing.animator) components.animator = { clips: entity.animations ?? [], ...(existing.animator ?? {}) };

  return { ...entity, components };
}

/**
 * Projects component values back into the legacy shape used by older systems.
 * Components take precedence only for properties represented by that component.
 */
export function syncLegacyFields(entity: Entity): Entity {
  const normalized = normalizeEntityComponents(entity);
  const renderer = getComponent<RendererComponent>(normalized, "renderer");
  const transform = getComponent<TransformComponent>(normalized, "transform");
  const collider = getComponent<{ solid?: boolean; hitbox?: Entity["hitbox"] }>(normalized, "collider");
  const rigidbody = getComponent<{ gravity?: boolean; velocity?: { x: number; y: number } }>(normalized, "rigidbody");
  const scripts = getComponent<{ scripts: Entity["scripts"] }>(normalized, "script");
  const animator = getComponent<{ clips?: Entity["animations"]; activeClip?: string | null }>(normalized, "animator");
  let result: Entity = {
    ...normalized,
    color: renderer?.color ?? normalized.color,
    texture: renderer?.texture ?? normalized.texture,
    textureFit: renderer?.textureFit ?? normalized.textureFit,
    opacity: renderer?.opacity ?? normalized.opacity,
    visible: renderer?.visible ?? normalized.visible,
    flipX: renderer?.flipX ?? normalized.flipX,
    flipY: renderer?.flipY ?? normalized.flipY,
    z: renderer?.z ?? normalized.z,
    solid: collider?.solid ?? normalized.solid,
    hitbox: collider?.hitbox ?? normalized.hitbox,
    gravity: rigidbody?.gravity ?? normalized.gravity,
    vx: rigidbody?.velocity?.x ?? normalized.vx,
    vy: rigidbody?.velocity?.y ?? normalized.vy,
    scripts: scripts?.scripts ?? normalized.scripts,
    animations: animator?.clips ?? normalized.animations,
  };
  if (transform) result = updateEntityTransform(result, transform);
  return result;
}

export function componentsForKind(kind: EntityKind): EntityComponents {
  const common: EntityComponents = {
    transform: { position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, pivot: { x: 0.5, y: 0.5, z: 0 }, baseSize: { x: 32, y: 32, z: 1 }, space: "local" },
    renderer: { enabled: true } satisfies RendererComponent,
  };
  if (kind === "platform") return { ...common, collider: { enabled: true, solid: true } };
  if (kind === "player") return { ...common, collider: { enabled: true, solid: true }, rigidbody: { enabled: true, gravity: true, mass: 1, drag: 0 }, controller: { enabled: true } };
  if (kind === "enemy") return { ...common, collider: { enabled: true, solid: true }, rigidbody: { enabled: true, gravity: true, mass: 1, drag: 0 }, patrol: { enabled: true, range: 160, ledgeSafe: true }, hazard: { enabled: true } };
  if (kind === "coin") return { ...common, collectible: { enabled: true, value: 1 } };
  if (kind === "goal") return { ...common, goal: { enabled: true, endsGame: true } };
  return common;
}

export function addDefaultComponents(entity: Entity): Entity {
  return syncLegacyFields(normalizeEntityComponents(entity));
}

export function componentEntries(entity: Entity): Array<[string, unknown]> {
  return Object.entries(entity.components ?? {}).filter(([, value]) => value !== undefined && value !== null);
}
