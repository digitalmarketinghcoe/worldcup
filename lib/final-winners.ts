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

const ADDITIONAL_POINT_OVERRIDES = [
  {
    name: "Abhinav Paudel",
    studentId: "HCE080BCE027",
    points: 178,
  },
  {
    name: "Ayush Shah",
    studentId: "HCE080BCE007",
    points: 174,
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
  const override = [...FINAL_WINNERS, ...ADDITIONAL_POINT_OVERRIDES].find(
    (entry) =>
      entry.studentId.toLowerCase() === studentId?.trim().toLowerCase() &&
      normalizeName(entry.name) === normalizeName(name),
  );
  return override?.points ?? computedPoints;
}
