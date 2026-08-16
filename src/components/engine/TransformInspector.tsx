import type { Entity, Scene, TransformSpace, TransformTrack, TransformVector3 } from "@/lib/engine/core";
import { uid } from "@/lib/engine/core";
import { getEntityTransform, reparentEntity, setTransformSpace, snapValue, updateEntityTransform, upsertTransformKeyframe } from "@/lib/engine/transforms";

type VectorField = "position" | "rotation" | "scale" | "pivot";

interface TransformInspectorProps {
  scene: Scene;
  entity: Entity;
  onChangeScene: (scene: Scene) => void;
  onSelect: (id: string | null) => void;
}

export function TransformInspector({ scene, entity, onChangeScene, onSelect }: TransformInspectorProps) {
  const transform = getEntityTransform(entity);
  const snapping = entity.transformSnapping ?? { position: 8, rotation: 15, scale: 0.1 };
  const replaceEntity = (next: Entity) => onChangeScene({ ...scene, entities: scene.entities.map(item => item.id === entity.id ? next : item) });
  const updateVector = (field: VectorField, axis: keyof TransformVector3, raw: number) => {
    const step = field === "position" ? snapping.position : field === "rotation" ? snapping.rotation : field === "scale" ? snapping.scale : 0;
    const value = field === "pivot" ? Math.max(-2, Math.min(2, raw)) : snapValue(raw, step);
    replaceEntity(updateEntityTransform(entity, { [field]: { ...transform[field], [axis]: value } }));
  };
  const updateSnap = (kind: keyof typeof snapping, raw: number) => replaceEntity({ ...entity, transformSnapping: { ...snapping, [kind]: Math.max(0, raw) } });
  const updateTrack = (patch: Partial<TransformTrack>) => replaceEntity({
    ...entity,
    transformTrack: { enabled: true, duration: 1, loop: true, keyframes: [], ...(entity.transformTrack ?? {}), ...patch },
  });
  const createGroup = () => {
    const id = uid();
    const group = updateEntityTransform({
      id,
      kind: "decor",
      x: entity.x,
      y: entity.y,
      w: 1,
      h: 1,
      vx: 0,
      vy: 0,
      z: entity.z ?? 0,
      color: "#ffffff",
      solid: false,
      gravity: false,
      controllable: false,
      collectible: false,
      hazard: false,
      goal: false,
      visible: false,
      opacity: 0,
      isGroup: true,
      parentId: null,
    }, { position: { x: entity.x, y: entity.y, z: entity.z ?? 0 } });
    const withGroup = { ...scene, entities: [...scene.entities, group] };
    onChangeScene(reparentEntity(withGroup, entity.id, id));
    onSelect(id);
  };
  const createCopy = (asInstance: boolean) => {
    const source = getEntityTransform(entity);
    const copy = updateEntityTransform({
      ...entity,
      id: uid(),
      instanceOf: asInstance ? entity.id : null,
      transformTrack: asInstance ? null : entity.transformTrack ? { ...entity.transformTrack, keyframes: entity.transformTrack.keyframes.map(frame => ({ ...frame, id: uid() })) } : null,
    }, { position: { ...source.position, x: source.position.x + 24, y: source.position.y + 24 } });
    onChangeScene({ ...scene, entities: [...scene.entities, copy] });
    onSelect(copy.id);
  };

  return (
    <details open className="rounded-xl border border-primary/25 bg-primary/[0.035] p-3">
      <summary className="cursor-pointer list-none font-display text-[11px] font-bold tracking-widest text-primary">
        TRANSFORMAR · {transform.space === "global" ? "GLOBAL" : "LOCAL"}
      </summary>
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          {(["local", "global"] as TransformSpace[]).map(space => (
            <button key={space} type="button" onClick={() => replaceEntity(setTransformSpace(entity, space))}
              className={`rounded-lg border px-2 py-1.5 text-[10px] font-display tracking-widest transition ${transform.space === space ? "grad-brand border-primary/20 text-white" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"}`}>
              {space.toUpperCase()}
            </button>
          ))}
        </div>
        <VectorRow label="POSICIÓN" field="position" value={transform.position} onChange={updateVector} />
        <VectorRow label="ROTACIÓN" field="rotation" value={transform.rotation} onChange={updateVector} />
        <VectorRow label="ESCALA" field="scale" value={transform.scale} onChange={updateVector} />
        <VectorRow label="PIVOTE / ORIGEN" field="pivot" value={transform.pivot} onChange={updateVector} />
        <div className="grid grid-cols-3 gap-1.5">
          {(["position", "rotation", "scale"] as const).map(kind => (
            <label key={kind} className="text-[9px] font-display tracking-wider text-muted-foreground">
              SNAP {kind === "position" ? "POS." : kind === "rotation" ? "ROT." : "ESC."}
              <input type="number" min="0" step={kind === "scale" ? 0.05 : 1} value={snapping[kind]}
                onChange={event => updateSnap(kind, Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-border bg-input/45 px-1.5 py-1 text-xs font-mono text-foreground outline-none" />
            </label>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <Action label="MIRROR X" active={!!entity.flipX} onClick={() => replaceEntity({ ...entity, flipX: !entity.flipX })} />
          <Action label="MIRROR Y" active={!!entity.flipY} onClick={() => replaceEntity({ ...entity, flipY: !entity.flipY })} />
        </div>
        <section className="space-y-1.5 border-t border-border/70 pt-3">
          <span className="text-[10px] font-display tracking-widest text-muted-foreground">JERARQUÍA</span>
          <select value={entity.parentId ?? ""} onChange={event => onChangeScene(reparentEntity(scene, entity.id, event.target.value || null))}
            className="w-full rounded-md border border-border bg-input/45 px-2 py-2 text-xs font-mono text-foreground outline-none">
            <option value="">Sin padre · raíz global</option>
            {scene.entities.filter(item => item.id !== entity.id && !item.instanceOf).map(item => (
              <option key={item.id} value={item.id}>{item.isGroup ? "Grupo" : item.kind} · {item.id.slice(0, 6)}</option>
            ))}
          </select>
          <div className="grid grid-cols-3 gap-1.5">
            <Action label="GRUPO" emphasis onClick={createGroup} />
            <Action label="CLONAR" onClick={() => createCopy(false)} />
            <Action label="INSTANCIA" onClick={() => createCopy(true)} />
          </div>
        </section>
        <section className="space-y-2 border-t border-border/70 pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-display tracking-widest text-muted-foreground">ANIMACIÓN TRANSFORM</span>
            <Action label={entity.transformTrack?.enabled ? "ACTIVA" : "ACTIVAR"} small active={!!entity.transformTrack?.enabled} onClick={() => updateTrack({ enabled: !entity.transformTrack?.enabled })} />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <Action label="CLAVE 0 s" emphasis onClick={() => replaceEntity(upsertTransformKeyframe(entity, 0))} />
            <Action label="CLAVE FINAL" emphasis onClick={() => replaceEntity(upsertTransformKeyframe(entity, entity.transformTrack?.duration ?? 1))} />
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <label className="text-[9px] font-display tracking-wider text-muted-foreground">DURACIÓN
              <input type="number" min="0.1" step="0.1" value={entity.transformTrack?.duration ?? 1}
                onChange={event => updateTrack({ duration: Math.max(0.1, Number(event.target.value)) })}
                className="mt-1 w-full rounded-md border border-border bg-input/45 px-1.5 py-1 text-xs font-mono text-foreground outline-none" />
            </label>
            <Action label={entity.transformTrack?.loop ?? true ? "LOOP · ON" : "LOOP · OFF"} active={entity.transformTrack?.loop ?? true} onClick={() => updateTrack({ loop: !(entity.transformTrack?.loop ?? true) })} />
          </div>
        </section>
      </div>
    </details>
  );
}

function VectorRow({ label, field, value, onChange }: { label: string; field: VectorField; value: TransformVector3; onChange: (field: VectorField, axis: keyof TransformVector3, value: number) => void }) {
  return <div className="space-y-1.5">
    <div className="flex items-center justify-between"><span className="text-[10px] font-display tracking-widest text-muted-foreground">{label}</span><span className="text-[9px] font-mono text-primary">XYZ</span></div>
    <div className="grid grid-cols-3 gap-1.5">{(["x", "y", "z"] as const).map(axis => <label key={axis} className="rounded-md border border-border bg-input/45 px-1.5 py-1 text-[9px] font-mono text-muted-foreground">{axis.toUpperCase()}<input type="number" step={field === "rotation" ? 1 : field === "pivot" ? 0.05 : 0.1} value={Number(value[axis].toFixed(3))} onChange={event => onChange(field, axis, Number(event.target.value))} className="mt-0.5 w-full bg-transparent text-xs text-foreground outline-none" /></label>)}</div>
  </div>;
}

function Action({ label, active = false, emphasis = false, small = false, onClick }: { label: string; active?: boolean; emphasis?: boolean; small?: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg border font-display tracking-wider transition active:scale-[0.98] ${small ? "px-2 py-1 text-[8px]" : "px-2 py-2 text-[9px]"} ${active || emphasis ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15" : "border-border bg-card text-ink-2 hover:border-primary/40 hover:text-primary"}`}>{label}</button>;
}
