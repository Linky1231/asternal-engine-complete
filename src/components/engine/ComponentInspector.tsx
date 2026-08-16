import { useMemo, useState } from "react";
import { Plus, X, Zap } from "lucide-react";
import type { ComponentType, Entity } from "@/lib/engine/core";
import { hasComponent, withComponent, withoutComponent } from "@/lib/engine/ecs";

const COMPONENTS: Array<{ type: ComponentType; label: string; description: string; required?: boolean }> = [
  { type: "transform", label: "Transform", description: "Posición, rotación, escala y pivote", required: true },
  { type: "renderer", label: "Renderer", description: "Color, textura, visibilidad y profundidad", required: true },
  { type: "collider", label: "Collider", description: "Colisiones sólidas o triggers" },
  { type: "rigidbody", label: "Rigidbody", description: "Velocidad, gravedad y masa" },
  { type: "audioSource", label: "AudioSource", description: "Sonido, volumen y reproducción" },
  { type: "animator", label: "Animator", description: "Clips y animación activa" },
  { type: "particleEmitter", label: "ParticleEmitter", description: "Emisión de partículas" },
  { type: "light", label: "Light", description: "Color, intensidad y radio" },
  { type: "camera", label: "Camera", description: "Cámara principal, zoom y seguimiento" },
  { type: "script", label: "Script", description: "Eventos y comportamiento programable" },
  { type: "ui", label: "UI", description: "Elemento de interfaz asociado" },
  { type: "gravity", label: "Gravity", description: "Participa en la gravedad de escena" },
  { type: "collectible", label: "Collectible", description: "Objeto recogible y valor" },
  { type: "hazard", label: "Hazard", description: "Daño o peligro para el jugador" },
  { type: "goal", label: "Goal", description: "Meta de la escena" },
  { type: "checkpoint", label: "Checkpoint", description: "Punto de reaparición" },
  { type: "patrol", label: "Patrol", description: "Patrulla y detección de bordes" },
  { type: "moving", label: "Moving", description: "Movimiento entre dos extremos" },
  { type: "crumble", label: "Crumble", description: "Plataforma que desaparece y reaparece" },
  { type: "spring", label: "Spring", description: "Impulso vertical al colisionar" },
  { type: "powerup", label: "Powerup", description: "Efecto temporal sobre el jugador" },
];

function defaultValue(type: ComponentType): unknown {
  switch (type) {
    case "collider": return { enabled: true, solid: true, isTrigger: false };
    case "rigidbody": return { enabled: true, gravity: true, mass: 1, drag: 0 };
    case "audioSource": return { enabled: true, url: null, volume: 1, loop: false, autoplay: false };
    case "animator": return { enabled: true, clips: [], activeClip: null, speed: 1 };
    case "particleEmitter": return { enabled: true, rate: 10, lifetime: 1, speed: 80, direction: 0, spread: 30, size: 3, gravity: 0, color: "#7dd3fc" };
    case "light": return { enabled: true, color: "#7dd3fc", intensity: 1, radius: 120 };
    case "camera": return { enabled: true, primary: false, zoom: 1, follow: false };
    case "script": return { enabled: true, scripts: [] };
    case "ui": return { enabled: true };
    case "gravity": return { enabled: true };
    case "collectible": return { enabled: true, value: 1 };
    case "goal": return { enabled: true, endsGame: true, nextSceneId: null };
    case "checkpoint": return { enabled: true };
    case "patrol": return { enabled: true, range: 160, ledgeSafe: true };
    case "moving": return { enabled: true, axis: "x", range: 120, speed: 60 };
    case "crumble": return { enabled: true, delay: 1, respawn: 3 };
    case "spring": return { enabled: true, force: 720 };
    case "powerup": return { enabled: true, kind: "speed" };
    default: return { enabled: true };
  }
}

function setLegacyFlag(entity: Entity, type: ComponentType, enabled: boolean): Entity {
  const next = { ...entity };
  if (type === "collider") next.solid = enabled;
  if (type === "rigidbody") next.gravity = enabled;
  if (type === "collectible") next.collectible = enabled;
  if (type === "hazard") next.hazard = enabled;
  if (type === "goal") next.goal = enabled;
  if (type === "checkpoint") next.checkpoint = enabled;
  if (type === "moving") next.moving = enabled ? (next.moving ?? { axis: "x", range: 120, speed: 60 }) : null;
  if (type === "crumble") next.crumble = enabled ? (next.crumble ?? { delay: 1, respawn: 3 }) : null;
  if (type === "spring") next.spring = enabled ? (next.spring ?? { force: 720 }) : null;
  if (type === "patrol") next.patrol = enabled ? (next.patrol ?? { range: 160, ledgeSafe: true }) : null;
  if (type === "powerup") next.powerup = enabled ? (next.powerup ?? "speed") : null;
  if (type === "particleEmitter") next.emitter = enabled ? (next.emitter ?? null) : null;
  if (type === "script") next.scripts = enabled ? (next.scripts ?? []) : [];
  return next;
}

function NumberField({ label, value, onChange, step = 0.1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) {
  return <label className="text-[10px] text-muted-foreground space-y-1"><span className="block font-display tracking-widest">{label}</span><input type="number" value={Number.isFinite(value) ? value : 0} step={step} onChange={e => onChange(Number(e.target.value))} className="w-full rounded-md bg-input/60 border border-border px-2 py-1.5 text-xs font-mono" /></label>;
}

function ComponentPropertyEditor({ entity, type, onChange }: { entity: Entity; type: ComponentType; onChange: (entity: Entity) => void }) {
  const current = (entity.components?.[type] ?? {}) as Record<string, unknown>;
  const patch = (values: Record<string, unknown>) => onChange({ ...entity, components: { ...(entity.components ?? {}), [type]: { ...current, ...values } } });
  if (type === "rigidbody") return <div className="grid grid-cols-2 gap-2"><NumberField label="MASA" value={Number(current.mass ?? 1)} onChange={mass => patch({ mass })} /><NumberField label="DRAG" value={Number(current.drag ?? 0)} onChange={drag => patch({ drag })} /><label className="col-span-2 flex items-center gap-2 text-[10px] text-muted-foreground">GRAVEDAD<input type="checkbox" checked={current.gravity !== false} onChange={e => patch({ gravity: e.target.checked })} /></label></div>;
  if (type === "collider") return <div className="flex items-center justify-between text-xs"><span>Colisión sólida</span><input type="checkbox" checked={current.solid !== false} onChange={e => { patch({ solid: e.target.checked }); onChange({ ...entity, solid: e.target.checked }); }} /></div>;
  if (type === "light") return <div className="grid grid-cols-2 gap-2"><label className="text-[10px] text-muted-foreground">COLOR<input type="color" value={String(current.color ?? "#7dd3fc")} onChange={e => patch({ color: e.target.value })} className="mt-1 w-full h-8 bg-transparent" /></label><NumberField label="INTENSIDAD" value={Number(current.intensity ?? 1)} onChange={intensity => patch({ intensity })} /><NumberField label="RADIO" value={Number(current.radius ?? 120)} onChange={radius => patch({ radius })} /></div>;
  if (type === "camera") return <div className="grid grid-cols-2 gap-2"><NumberField label="ZOOM" value={Number(current.zoom ?? 1)} onChange={zoom => patch({ zoom })} /><label className="flex items-center gap-2 text-[10px] text-muted-foreground pt-5">PRINCIPAL<input type="checkbox" checked={current.primary === true} onChange={e => patch({ primary: e.target.checked })} /></label></div>;
  if (type === "audioSource") return <div className="grid grid-cols-2 gap-2"><label className="col-span-2 text-[10px] text-muted-foreground">URL<input value={String(current.url ?? "")} onChange={e => patch({ url: e.target.value || null })} className="mt-1 w-full rounded-md bg-input/60 border border-border px-2 py-1.5 text-xs" /></label><NumberField label="VOLUMEN" value={Number(current.volume ?? 1)} onChange={volume => patch({ volume })} /><label className="flex items-center gap-2 text-[10px] text-muted-foreground pt-5">LOOP<input type="checkbox" checked={current.loop === true} onChange={e => patch({ loop: e.target.checked })} /></label></div>;
  if (type === "particleEmitter") return <div className="grid grid-cols-2 gap-2"><NumberField label="RATE" value={Number(current.rate ?? 10)} onChange={rate => patch({ rate })} /><NumberField label="VIDA" value={Number(current.lifetime ?? 1)} onChange={lifetime => patch({ lifetime })} /><NumberField label="VELOCIDAD" value={Number(current.speed ?? 80)} onChange={speed => patch({ speed })} /><NumberField label="TAMAÑO" value={Number(current.size ?? 3)} onChange={size => patch({ size })} /><NumberField label="DIRECCIÓN" value={Number(current.direction ?? 0)} onChange={direction => patch({ direction })} /><NumberField label="DISPERSIÓN" value={Number(current.spread ?? 30)} onChange={spread => patch({ spread })} /><NumberField label="GRAVEDAD" value={Number(current.gravity ?? 0)} onChange={gravity => patch({ gravity })} /><label className="text-[10px] text-muted-foreground">COLOR<input type="color" value={String(current.color ?? "#7dd3fc")} onChange={e => patch({ color: e.target.value })} className="mt-1 w-full h-8 bg-transparent" /></label></div>;
  if (type === "script") return <label className="text-[10px] text-muted-foreground">DEFINICIÓN JSON<textarea defaultValue={JSON.stringify(current.scripts ?? [], null, 2)} onBlur={e => { try { patch({ scripts: JSON.parse(e.target.value) }); } catch { e.currentTarget.value = JSON.stringify(current.scripts ?? [], null, 2); } }} className="mt-1 min-h-24 w-full rounded-md bg-input/60 border border-border px-2 py-1.5 text-[10px] font-mono" /></label>;
  return null;
}

function applyCompositionPreset(entity: Entity, name: "door" | "enemy" | "planet" | "strange"): Entity {
  const base = entity.components ?? {};
  const components = { ...base };
  if (name === "door") Object.assign(components, { collider: { enabled: true, solid: true }, script: { enabled: true, scripts: [] } });
  if (name === "enemy") Object.assign(components, { collider: { enabled: true, solid: true }, rigidbody: { enabled: true, gravity: true, mass: 1, drag: 0 }, animator: { enabled: true, clips: [] }, script: { enabled: true, scripts: [] }, hazard: { enabled: true } });
  if (name === "planet") Object.assign(components, { rigidbody: { enabled: true, gravity: false, mass: 1000, drag: 0 }, light: { enabled: true, color: "#7dd3fc", intensity: 1.2, radius: 180 }, script: { enabled: true, scripts: [] } });
  if (name === "strange") Object.assign(components, { light: { enabled: true, color: "#c084fc", intensity: 2, radius: 100 }, camera: { enabled: true, primary: false, zoom: 1.2 }, particleEmitter: { enabled: true, rate: 6, lifetime: 1, speed: 50, direction: 0, spread: 180, size: 4, gravity: 0, color: "#f0abfc" } });
  return { ...entity, components };
}

export function ComponentInspector({ entity, onChange }: { entity: Entity; onChange: (entity: Entity) => void }) {
  const [customName, setCustomName] = useState("");
  const active = useMemo(() => COMPONENTS.filter(item => hasComponent(entity, item.type)), [entity]);
  const toggle = (type: ComponentType) => {
    const definition = COMPONENTS.find(item => item.type === type);
    if (definition?.required) return;
    if (hasComponent(entity, type)) {
      onChange(withoutComponent(setLegacyFlag(entity, type, false), type));
    } else {
      onChange(withComponent(setLegacyFlag(entity, type, true), type, defaultValue(type) as object));
    }
  };
  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    const custom = { ...(entity.components?.custom ?? {}), [name]: { enabled: true } };
    onChange({ ...entity, components: { ...(entity.components ?? {}), custom } });
    setCustomName("");
  };
  const removeCustom = (name: string) => {
    const custom = { ...(entity.components?.custom ?? {}) };
    delete custom[name];
    onChange({ ...entity, components: { ...(entity.components ?? {}), custom } });
  };

  return (
    <section className="panel rounded-xl border border-primary/20 p-3 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-display tracking-[0.18em] text-primary-glow">COMPONENTES ECS</div>
          <p className="text-[11px] text-muted-foreground mt-1">Combina capacidades sin depender del tipo del objeto.</p>
        </div>
        <Zap size={16} className="text-primary shrink-0" />
      </div>

      <div className="space-y-1.5">
        {COMPONENTS.map(item => {
          const enabled = hasComponent(entity, item.type);
          return (
            <button key={item.type} type="button" onClick={() => toggle(item.type)}
              className={`w-full text-left rounded-lg border px-2.5 py-2 transition ${enabled ? "border-primary/40 bg-primary/10" : "border-border bg-card/50 opacity-75"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-display font-semibold ${enabled ? "text-primary" : "text-foreground"}`}>{item.label}</span>
                <span className="text-[9px] font-mono text-muted-foreground">{item.required ? "CORE" : enabled ? "ON" : "OFF"}</span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{item.description}</div>
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-border space-y-2">
        <div className="text-[10px] font-display tracking-widest text-muted-foreground">CUSTOM</div>
        <div className="flex gap-2">
          <input value={customName} onChange={e => setCustomName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Nombre del componente" className="min-w-0 flex-1 rounded-md bg-input/60 border border-border px-2 py-1.5 text-xs" />
          <button type="button" onClick={addCustom} className="rounded-md bg-primary/15 border border-primary/30 text-primary px-2"><Plus size={14} /></button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(entity.components?.custom ?? {}).map(name => (
            <span key={name} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-mono">
              {name}<button type="button" onClick={() => removeCustom(name)} aria-label={`Quitar ${name}`}><X size={11} /></button>
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {active.filter(item => !item.required).map(item => <div key={`${item.type}-editor`} className="rounded-lg border border-border/70 bg-card/40 p-2"><div className="mb-2 text-[9px] font-display tracking-widest text-primary-glow">EDITAR · {item.label.toUpperCase()}</div><ComponentPropertyEditor entity={entity} type={item.type} onChange={onChange} /></div>)}
      </div>

      <div className="border-t border-border pt-2 space-y-2">
        <div className="text-[10px] font-display tracking-widest text-muted-foreground">COMPOSICIONES RÁPIDAS</div>
        <div className="grid grid-cols-2 gap-1.5">
          {([['door', 'Puerta'], ['enemy', 'Enemigo'], ['planet', 'Planeta'], ['strange', 'Extraño']] as const).map(([id, label]) => <button key={id} type="button" onClick={() => onChange(applyCompositionPreset(entity, id))} className="rounded-md border border-primary/25 bg-primary/5 px-2 py-1.5 text-[10px] font-display text-primary hover:bg-primary/15">{label}</button>)}
        </div>
      </div>

      <div className="text-[10px] text-muted-foreground">Activos: {active.length}. Transform y Renderer permanecen disponibles para todo objeto.</div>
    </section>
  );
}
