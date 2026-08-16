import { describe, expect, it } from "vitest";
import type { Entity, Scene } from "./core";
import {
  createGroup,
  createInstance,
  duplicateEntity,
  resolveEntityInstance,
  resizeEntityTransform,
  getEntityTransform,
  mirrorEntity,
  reparentEntity,
  resolveEntityWorld,
  sampleTransformTrack,
  updateEntityTransform,
} from "./transforms";

function entity(id: string, x = 0, y = 0): Entity {
  return {
    id,
    kind: "decor",
    x,
    y,
    z: 0,
    w: 20,
    h: 20,
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
  };
}

function scene(entities: Entity[]): Scene {
  return {
    id: "scene",
    name: "Scene",
    width: 640,
    height: 360,
    bg: "#ffffff",
    gravity: 0,
    entities,
  };
}

describe("transformaciones de entidades", () => {
  it("mantiene valores compatibles para entidades guardadas antes del modelo XYZ", () => {
    const legacy = entity("legacy", 48, 96);
    const transform = getEntityTransform(legacy);

    expect(transform.position).toEqual({ x: 48, y: 96, z: 0 });
    expect(transform.scale).toEqual({ x: 1, y: 1, z: 1 });
    expect(transform.pivot).toEqual({ x: 0.5, y: 0.5, z: 0 });
  });

  it("sincroniza posición, rotación y escala con los campos usados por el runtime", () => {
    const transformed = updateEntityTransform(entity("shape"), {
      position: { x: 32, y: 64, z: 4 },
      rotation: { x: 0, y: 0, z: 45 },
      scale: { x: 2, y: 1.5, z: 1 },
    });

    expect(transformed.x).toBe(32);
    expect(transformed.y).toBe(64);
    expect(transformed.z).toBe(4);
    expect(transformed.rotation).toBe(45);
    expect(transformed.w).toBe(40);
    expect(transformed.h).toBe(30);
  });

  it("conserva la posición global al reparentar una entidad", () => {
    const parent = updateEntityTransform(entity("parent", 100, 50), {
      rotation: { x: 0, y: 0, z: 90 },
    });
    const child = entity("child", 140, 70);
    const initial = scene([parent, child]);
    const reparented = reparentEntity(initial, child.id, parent.id);
    const resolvedChild = resolveEntityWorld(reparented, reparented.entities.find(item => item.id === child.id)!);

    expect(resolvedChild.x).toBeCloseTo(140);
    expect(resolvedChild.y).toBeCloseTo(70);
  });

  it("crea un grupo con límites y transformación normalizada", () => {
    const group = createGroup([entity("a", 10, 20), entity("b", 30, 40)]);

    expect(group.isGroup).toBe(true);
    expect(group.w).toBe(40);
    expect(group.h).toBe(40);
    expect(getEntityTransform(group).position).toEqual({ x: 30, y: 40, z: 0 });
  });

  it("propaga la transformación global de un grupo a sus miembros parentados", () => {
    const parent = updateEntityTransform(entity("group-parent", 100, 50), {
      rotation: { x: 0, y: 0, z: 90 },
      scale: { x: 2, y: 2, z: 1 },
    });
    const child = updateEntityTransform(entity("group-child", 10, 5), { position: { x: 10, y: 5, z: 0 } });
    const resolved = resolveEntityWorld(scene([parent, { ...child, parentId: parent.id }]), { ...child, parentId: parent.id });

    expect(resolved.x).toBeCloseTo(90);
    expect(resolved.y).toBeCloseTo(70);
    expect(getEntityTransform(resolved).scale).toEqual({ x: 2, y: 2, z: 1 });
    expect(getEntityTransform(resolved).rotation.z).toBe(90);
  });

  it("duplica una entidad con un ID independiente y un desplazamiento controlado", () => {
    const original = entity("original", 50, 50);
    original.color = "#ff0000";
    const clone = duplicateEntity(original, 24);

    expect(clone.id).not.toBe("original");
    expect(clone.color).toBe("#ff0000");
    expect(clone.x).toBe(74);
    expect(clone.y).toBe(74);
  });

  it("mantiene el duplicado independiente de la fuente mientras conserva sus datos", () => {
    const original = updateEntityTransform(entity("original-independent", 20, 30), { scale: { x: 2, y: 2, z: 1 } });
    const duplicate = duplicateEntity(original, 10);
    const changed = updateEntityTransform(duplicate, { position: { x: 200, y: 300, z: 0 }, scale: { x: 3, y: 3, z: 1 } });

    expect(changed.id).not.toBe(original.id);
    expect(changed.x).toBe(200);
    expect(original.x).toBe(20);
    expect(getEntityTransform(original).scale).toEqual({ x: 2, y: 2, z: 1 });
  });

  it("crea una instancia con referencia a la fuente y transformación independiente", () => {
    const source = entity("source", 10, 10);
    source.color = "#00ff00";
    const instance = createInstance(source, 32);
    const moved = updateEntityTransform(instance, { position: { x: 100, y: 100, z: 0 } });

    expect(instance.instanceOf).toBe("source");
    expect(instance.color).toBe("#00ff00");
    expect(moved.x).toBe(100);
    expect(source.x).toBe(10);
  });

  it("propaga cambios compartidos de la fuente y conserva el override local de la instancia", () => {
    const source = updateEntityTransform(entity("shared-source", 20, 20), { scale: { x: 2, y: 2, z: 1 } });
    source.color = "#00ff00";
    const instance = updateEntityTransform(createInstance(source, 40), { position: { x: 200, y: 180, z: 0 } });
    source.color = "#ff00ff";
    const resizedSource = resizeEntityTransform(source, 90, 90);

    const resolved = resolveEntityInstance(scene([resizedSource, instance]), instance);

    expect(resolved.color).toBe("#ff00ff");
    expect(resolved.w).toBe(90);
    expect(resolved.x).toBe(200);
    expect(resolved.y).toBe(180);
    expect(resolved.instanceOf).toBe(source.id);
  });

  it("aplica mirror horizontal y vertical conservando el resto de la transformación", () => {
    const original = updateEntityTransform(entity("mirror"), {
      scale: { x: 1, y: 1, z: 1 },
      rotation: { x: 0, y: 0, z: 45 },
    });

    const mirroredX = mirrorEntity(original, "x");
    const mirroredY = mirrorEntity(original, "y");

    expect(getEntityTransform(mirroredX).scale.x).toBe(-1);
    expect(getEntityTransform(mirroredX).scale.y).toBe(1);
    expect(getEntityTransform(mirroredX).rotation.z).toBe(45);
    expect(getEntityTransform(mirroredY).scale.y).toBe(-1);
    expect(getEntityTransform(mirroredY).scale.x).toBe(1);
  });

  it("interpela claves de transformación para animar posición, rotación y escala", () => {
    const animated = updateEntityTransform(entity("animated"), { position: { x: 0, y: 0, z: 0 } });
    animated.transformTrack = {
      enabled: true,
      duration: 2,
      loop: false,
      keyframes: [
        { id: "start", time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 } },
        { id: "end", time: 2, position: { x: 20, y: 40, z: 2 }, rotation: { x: 0, y: 0, z: 180 }, scale: { x: 2, y: 3, z: 1 } },
      ],
    };

    const middle = sampleTransformTrack(animated, 1);
    const transform = getEntityTransform(middle);

    expect(transform.position).toEqual({ x: 10, y: 20, z: 1 });
    expect(transform.rotation.z).toBe(90);
    expect(transform.scale).toEqual({ x: 1.5, y: 2, z: 1 });
  });
});
