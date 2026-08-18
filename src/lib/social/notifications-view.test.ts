import { describe, expect, it } from "vitest";
import { groupNotificationsByRecency } from "./notifications-view";

describe("línea de tiempo de notificaciones", () => {
  it("ordena por fecha y agrupa la actividad en hoy, ayer y anteriores", () => {
    const now = new Date("2026-08-18T15:00:00.000Z");
    const groups = groupNotificationsByRecency([
      { id: "old", created_at: "2026-08-15T08:00:00.000Z" },
      { id: "newer", created_at: "2026-08-18T12:00:00.000Z" },
      { id: "yesterday", created_at: "2026-08-17T14:00:00.000Z" },
      { id: "newest", created_at: "2026-08-18T14:00:00.000Z" },
    ], now);

    expect(groups.map(group => group.label)).toEqual(["Hoy", "Ayer", "Anteriores"]);
    expect(groups[0].items.map(item => item.id)).toEqual(["newest", "newer"]);
    expect(groups[1].items.map(item => item.id)).toEqual(["yesterday"]);
    expect(groups[2].items.map(item => item.id)).toEqual(["old"]);
  });
});
