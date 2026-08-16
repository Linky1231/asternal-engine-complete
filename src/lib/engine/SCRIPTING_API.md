# Asternal Engine Open Scripting API

Los scripts de código se ejecutan por evento junto a los bloques visuales existentes. El editor visual es una capa de conveniencia; el código recibe una API de motor estable y serializable.

## Object and ECS

```ts
object.position = { ...object.position, x: object.position.x + 40 };
object.rotation = { ...object.rotation, z: 90 };
object.scale = { x: 2, y: 2, z: 1 };
object.parent = other;
for (const child of object.children) child.visible = true;
object.addComponent("light", { enabled: true, color: "#7dd3fc", intensity: 2 });
object.removeComponent("light");
object.destroy();
```

`object` representa la entidad que recibe el evento y `other` representa la entidad relacionada en `onCollide`, si existe. Las propiedades de transformación actualizan simultáneamente el modelo estructurado ECS y los campos legacy.

## Physics, audio, camera and animation

```ts
physics.addForce(0, -320);
const hit = physics.raycast(object.position.x, object.position.y, 1, 0, 240);
if (hit.hit) audio.play("blip");
audio.play("coin", 0.8);
camera.setPosition(object.position.x, object.position.y, 0);
camera.setZoom(1.25);
animation.play("run", 1.0);
```

## Scenes, input and UI

```ts
if (input.isPressed("jump")) physics.addForce(0, -520);
const coin = scene.spawn("coin", object.position.x + 24, object.position.y);
const buttonId = ui.createButton("START", 20, 20, "event");
scene.load("level-02");
```

`scene.load` usa el hook de carga proporcionado por el host del runtime. `scene.spawn` crea una entidad con preset ECS y la devuelve como objeto scriptable.

## Compatibility and boundaries

Los scripts legacy basados en bloques siguen ejecutándose sin cambios. Un mismo evento puede combinar código y bloques. El código no recibe `window`, `document`, `fetch`, almacenamiento local ni constructores del host; debe utilizar los servicios expuestos por la API del motor.
