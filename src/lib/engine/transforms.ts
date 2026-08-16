import type { Entity, EntityTransform, Scene, TransformKeyframe, TransformSpace, TransformTrack, TransformVector3 } from "./core";

export const vec3 = (x = 0, y = 0, z = 0): TransformVector3 => ({ x, y, z });
const cloneVec = (value: TransformVector3) => ({ ...value });

/** Returns a complete transform for legacy entities without mutating saved data. */
export function getEntityTransform(entity: Entity): EntityTransform {
  const saved = entity.transform;
  return {
    position: { x: saved?.position.x ?? entity.x, y: saved?.position.y ?? entity.y, z: saved?.position.z ?? entity.z ?? 0 },
    rotation: { x: saved?.rotation.x ?? 0, y: saved?.rotation.y ?? 0, z: saved?.rotation.z ?? entity.rotation ?? 0 },
    scale: { x: saved?.scale.x ?? 1, y: saved?.scale.y ?? 1, z: saved?.scale.z ?? 1 },
    pivot: { x: saved?.pivot.x ?? 0.5, y: saved?.pivot.y ?? 0.5, z: saved?.pivot.z ?? 0 },
    baseSize: { x: saved?.baseSize.x ?? entity.w, y: saved?.baseSize.y ?? entity.h, z: saved?.baseSize.z ?? 1 },
    space: saved?.space ?? "local",
  };
}

export function ensureEntityTransform(entity: Entity): Entity {
  return entity.transform ? entity : { ...entity, transform: getEntityTransform(entity) };
}

export function normalizeTransformEntity(entity: Entity): Entity {
  const transform = getEntityTransform(entity);
  return {
    ...entity,
    x: transform.position.x,
    y: transform.position.y,
    z: transform.position.z,
    rotation: transform.rotation.z,
    transform,
    transformSnapping: entity.transformSnapping ?? { position: 8, rotation: 15, scale: 0.1 },
  };
}

export type TransformPatch = Partial<Pick<EntityTransform, "position" | "rotation" | "scale" | "pivot" | "space">>;

/** Applies a structured transform and synchronizes fields relied on by existing physics/runtime code. */
export function updateEntityTransform(entity: Entity, patch: TransformPatch): Entity {
  const before = getEntityTransform(entity);
  const transform: EntityTransform = {
    ...before,
    position: { ...before.position, ...(patch.position ?? {}) },
    rotation: { ...before.rotation, ...(patch.rotation ?? {}) },
    scale: {
      ...before.scale,
      ...(patch.scale ?? {}),
    },
    pivot: { ...before.pivot, ...(patch.pivot ?? {}) },
    space: patch.space ?? before.space,
    baseSize: cloneVec(before.baseSize),
  };
  // Preserve negative scale for mirroring, but prevent scale from becoming exactly 0
  transform.scale.x = Math.abs(transform.scale.x) < 0.05 ? 0.05 * Math.sign(transform.scale.x || 1) : transform.scale.x;
  transform.scale.y = Math.abs(transform.scale.y) < 0.05 ? 0.05 * Math.sign(transform.scale.y || 1) : transform.scale.y;
  transform.scale.z = Math.abs(transform.scale.z) < 0.05 ? 0.05 * Math.sign(transform.scale.z || 1) : transform.scale.z;
  return {
    ...entity,
    x: transform.position.x,
    y: transform.position.y,
    z: transform.position.z,
    rotation: transform.rotation.z,
    w: Math.max(1, transform.baseSize.x * Math.abs(transform.scale.x)),
    h: Math.max(1, transform.baseSize.y * Math.abs(transform.scale.y)),
    transform,
  };
}

/** Keeps scale stable when legacy resize handles change a physical width/height. */
export function resizeEntityTransform(entity: Entity, w: number, h: number): Entity {
  const transform = getEntityTransform(entity);
  const baseSize = {
    x: Math.max(1, w / transform.scale.x),
    y: Math.max(1, h / transform.scale.y),
    z: transform.baseSize.z,
  };
  return { ...entity, w, h, transform: { ...transform, baseSize } };
}

export function snapValue(value: number, step: number) {
  return step > 0 ? Math.round(value / step) * step : value;
}

export function snapVector(value: TransformVector3, step: number) {
  return { x: snapValue(value.x, step), y: snapValue(value.y, step), z: snapValue(value.z, step) };
}

/** Resolves simple parent translation/rotation/depth for editor preview and selection. */
export function resolveEntityWorld(scene: Scene, entity: Entity, visited = new Set<string>()): Entity {
  const own = normalizeTransformEntity(entity);
  if (!own.parentId || visited.has(own.id)) return own;
  const parent = scene.entities.find(candidate => candidate.id === own.parentId);
  if (!parent) return own;
  visited.add(own.id);
  const parentWorld = resolveEntityWorld(scene, parent, visited);
  const parentTransform = getEntityTransform(parentWorld);
  const ownTransform = getEntityTransform(own);
  const radians = (parentTransform.rotation.z * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const dx = ownTransform.position.x * parentTransform.scale.x;
  const dy = ownTransform.position.y * parentTransform.scale.y;
  const worldPosition = {
    x: parentWorld.x + dx * cos - dy * sin,
    y: parentWorld.y + dx * sin + dy * cos,
    z: (parentWorld.z ?? 0) + ownTransform.position.z,
  };
  const transform: EntityTransform = {
    ...ownTransform,
    position: worldPosition,
    rotation: { ...ownTransform.rotation, z: ownTransform.rotation.z + parentTransform.rotation.z },
    scale: {
      x: ownTransform.scale.x * parentTransform.scale.x,
      y: ownTransform.scale.y * parentTransform.scale.y,
      z: ownTransform.scale.z * parentTransform.scale.z,
    },
  };
  return { ...own, x: worldPosition.x, y: worldPosition.y, z: worldPosition.z, rotation: transform.rotation.z, transform };
}

/** Converts a desired world position to the local coordinates required by a parent. */
export function worldToLocal(scene: Scene, parentId: string | null | undefined, world: TransformVector3): TransformVector3 {
  if (!parentId) return world;
  const parent = scene.entities.find(entity => entity.id === parentId);
  if (!parent) return world;
  const resolved = resolveEntityWorld(scene, parent);
  const transform = getEntityTransform(resolved);
  const radians = (-transform.rotation.z * Math.PI) / 180;
  const dx = world.x - resolved.x;
  const dy = world.y - resolved.y;
  return {
    x: (dx * Math.cos(radians) - dy * Math.sin(radians)) / transform.scale.x,
    y: (dx * Math.sin(radians) + dy * Math.cos(radians)) / transform.scale.y,
    z: world.z - (resolved.z ?? 0),
  };
}

export function reparentEntity(scene: Scene, entityId: string, parentId: string | null): Scene {
  const entity = scene.entities.find(item => item.id === entityId);
  if (!entity || parentId === entityId) return scene;
  const disallowed = new Set<string>([entityId]);
  const collectChildren = (id: string) => scene.entities.filter(item => item.parentId === id).forEach(item => { disallowed.add(item.id); collectChildren(item.id); });
  collectChildren(entityId);
  if (parentId && disallowed.has(parentId)) return scene;
  const world = resolveEntityWorld(scene, entity);
  const local = worldToLocal(scene, parentId, { x: world.x, y: world.y, z: world.z ?? 0 });
  return {
    ...scene,
    entities: scene.entities.map(item => item.id === entityId
      ? { ...updateEntityTransform({ ...item, parentId }, { position: local }), parentId }
      : item),
  };
}

export function sampleTransformTrack(entity: Entity, time: number): Entity {
  const track = entity.transformTrack;
  if (!track?.enabled || track.keyframes.length === 0) return entity;
  const duration = Math.max(track.duration, 0.001);
  const localTime = track.loop ? ((time % duration) + duration) % duration : Math.max(0, Math.min(time, duration));
  const frames = [...track.keyframes].sort((a, b) => a.time - b.time);
  const right = frames.find(frame => frame.time >= localTime) ?? frames[frames.length - 1];
  const left = [...frames].reverse().find(frame => frame.time <= localTime) ?? frames[0];
  const ratio = left.id === right.id ? 0 : (localTime - left.time) / Math.max(right.time - left.time, 0.001);
  const lerp = (a: number, b: number) => a + (b - a) * ratio;
  return updateEntityTransform(entity, {
    position: { x: lerp(left.position.x, right.position.x), y: lerp(left.position.y, right.position.y), z: lerp(left.position.z, right.position.z) },
    rotation: { x: lerp(left.rotation.x, right.rotation.x), y: lerp(left.rotation.y, right.rotation.y), z: lerp(left.rotation.z, right.rotation.z) },
    scale: { x: lerp(left.scale.x, right.scale.x), y: lerp(left.scale.y, right.scale.y), z: lerp(left.scale.z, right.scale.z) },
  });
}

export function keyframeFromEntity(entity: Entity, time: number): TransformKeyframe {
  const transform = getEntityTransform(entity);
  return { id: `${Math.round(time * 1000)}-${Math.random().toString(36).slice(2, 7)}`, time, position: cloneVec(transform.position), rotation: cloneVec(transform.rotation), scale: cloneVec(transform.scale) };
}

export function upsertTransformKeyframe(entity: Entity, time: number): Entity {
  const transform = getEntityTransform(entity);
  const existing: TransformTrack = entity.transformTrack ?? { enabled: true, duration: 1, loop: true, keyframes: [] };
  const frame = keyframeFromEntity(entity, time);
  const keyframes = [...existing.keyframes.filter(item => Math.abs(item.time - time) > 0.001), frame].sort((a, b) => a.time - b.time);
  return { ...entity, transform, transformTrack: { ...existing, enabled: true, duration: Math.max(existing.duration, time, 1), keyframes } };
}

export function setTransformSpace(entity: Entity, space: TransformSpace): Entity {
  return updateEntityTransform(entity, { space });
}

export function createGroup(entities: Entity[]): Entity {
  const minX = Math.min(...entities.map(e => e.x));
  const minY = Math.min(...entities.map(e => e.y));
  const maxX = Math.max(...entities.map(e => e.x + e.w));
  const maxY = Math.max(...entities.map(e => e.y + e.h));
  const group: Entity = {
    id: `group-${Math.random().toString(36).slice(2, 9)}`,
    kind: "decor",
    x: minX + (maxX - minX) / 2,
    y: minY + (maxY - minY) / 2,
    z: Math.max(...entities.map(e => e.z ?? 0)),
    w: Math.max(1, maxX - minX),
    h: Math.max(1, maxY - minY),
    vx: 0,
    vy: 0,
    color: "transparent",
    solid: false,
    gravity: false,
    controllable: false,
    collectible: false,
    hazard: false,
    goal: false,
    visible: true,
    isGroup: true,
  };
  return ensureEntityTransform(group);
}

export function duplicateEntity(entity: Entity, offset = 16): Entity {
  const transform = getEntityTransform(entity);
  return {
    ...entity,
    id: `dup-${Math.random().toString(36).slice(2, 9)}`,
    x: entity.x + offset,
    y: entity.y + offset,
    transform: {
      ...transform,
      position: { ...transform.position, x: transform.position.x + offset, y: transform.position.y + offset },
    },
  };
}

export function createInstance(source: Entity, offset = 16): Entity {
  const dup = duplicateEntity(source, offset);
  return { ...dup, instanceOf: source.id };
}

/**
 * Resolves shared instance properties against the current source without
 * mutating saved data. Placement and transform values remain local overrides.
 */
export function resolveEntityInstance(scene: Scene, entity: Entity, visited = new Set<string>()): Entity {
  if (!entity.instanceOf || visited.has(entity.id)) return entity;
  const source = scene.entities.find(candidate => candidate.id === entity.instanceOf);
  if (!source || source.id === entity.id) return entity;
  visited.add(entity.id);
  const resolvedSource = resolveEntityInstance(scene, source, visited);
  const sourceTransform = getEntityTransform(resolvedSource);
  const ownTransform = getEntityTransform(entity);
  const sharedKeys: Array<keyof Entity> = [
    "kind", "w", "h", "color", "solid", "gravity", "controllable", "collectible", "hazard", "goal",
    "visible", "opacity", "texture", "animations", "scripts", "hitbox", "value", "moving", "crumble",
    "spring", "patrol", "checkpoint", "slippery", "sticky", "locked", "powerup", "switchId", "doorId",
    "emitter", "facing", "flipX", "flipY", "textureFit", "dialog", "transformTrack",
  ];
  const merged: Entity = {
    ...entity,
    transform: {
      ...sourceTransform,
      position: cloneVec(ownTransform.position),
      rotation: cloneVec(ownTransform.rotation),
      scale: cloneVec(ownTransform.scale),
      pivot: cloneVec(ownTransform.pivot),
      space: ownTransform.space,
      baseSize: cloneVec(sourceTransform.baseSize),
    },
  };
  for (const key of sharedKeys) {
    if (resolvedSource[key] !== undefined) (merged as unknown as Record<string, unknown>)[key] = resolvedSource[key];
  }
  return updateEntityTransform(merged, {
    position: ownTransform.position,
    rotation: ownTransform.rotation,
    scale: ownTransform.scale,
    pivot: ownTransform.pivot,
    space: ownTransform.space,
  });
}

export function resolveSceneInstances(scene: Scene): Scene {
  return { ...scene, entities: scene.entities.map(entity => resolveEntityInstance(scene, entity)) };
}

export function mirrorEntity(entity: Entity, axis: "x" | "y"): Entity {
  const transform = getEntityTransform(entity);
  const scale = { ...transform.scale };
  if (axis === "x") {
    scale.x *= -1;
  } else {
    scale.y *= -1;
  }
  return updateEntityTransform(entity, { scale });
}
