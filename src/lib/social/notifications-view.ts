export type NotificationGroup<T> = {
  label: "Hoy" | "Ayer" | "Anteriores";
  items: T[];
};

/** Ordena la actividad reciente y la agrupa para que la bandeja se lea como una línea de tiempo. */
export function groupNotificationsByRecency<T extends { created_at: string }>(
  items: T[],
  now = new Date(),
): NotificationGroup<T>[] {
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);

  const groups: NotificationGroup<T>[] = [
    { label: "Hoy", items: [] },
    { label: "Ayer", items: [] },
    { label: "Anteriores", items: [] },
  ];

  for (const item of [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())) {
    const timestamp = new Date(item.created_at).getTime();
    if (timestamp >= startToday.getTime()) groups[0].items.push(item);
    else if (timestamp >= startYesterday.getTime()) groups[1].items.push(item);
    else groups[2].items.push(item);
  }

  return groups.filter(group => group.items.length > 0);
}
