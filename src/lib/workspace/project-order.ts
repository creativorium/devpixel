export function parseProjectOrder(value: string): string[] {
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((id) => typeof id === "string")
      ? [...new Set(parsed)]
      : [];
  } catch {
    return [];
  }
}

export function orderedProjects<T extends { id: string }>(
  projects: T[],
  order: string[],
): T[] {
  const ranks = new Map(order.map((id, index) => [id, index]));
  return [...projects].sort(
    (a, b) => (ranks.get(a.id) ?? Infinity) - (ranks.get(b.id) ?? Infinity),
  );
}

export function moveProject(
  order: string[],
  id: string,
  target: string,
  after = false,
): string[] {
  if (id === target || !order.includes(id) || !order.includes(target))
    return order;
  const next = order.filter((item) => item !== id);
  next.splice(next.indexOf(target) + Number(after), 0, id);
  return next;
}
