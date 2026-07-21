export const FINAL_WINNERS = [
  {
    position: 1,
    name: "Amrit Raj Puri",
    studentId: "BEI073",
    points: 184,
    title: "Champion",
  },
  {
    position: 2,
    name: "Roshan Rai",
    studentId: "HCE080BCE032",
    points: 180,
    title: "Runner-up",
  },
] as const;

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function applyFinalPointsOverride(
  name: string,
  studentId: string | null,
  computedPoints: number,
): number {
  const winner = FINAL_WINNERS.find(
    (entry) =>
      entry.studentId.toLowerCase() === studentId?.trim().toLowerCase() &&
      normalizeName(entry.name) === normalizeName(name),
  );
  return winner?.points ?? computedPoints;
}
