export type TrustLevelPresentation = {
  label: "crítico" | "bajo" | "normal";
  textClass: string;
  surfaceClass: string;
  progressColor: string;
};

export function trustLevelPresentation(points: number): TrustLevelPresentation {
  if (points <= 2) {
    return {
      label: "crítico",
      textClass: "text-red-500",
      surfaceClass: "bg-red-50 border-red-200/60",
      progressColor: "#ef4444",
    };
  }

  if (points <= 6) {
    return {
      label: "bajo",
      textClass: "text-amber-500",
      surfaceClass: "bg-amber-50 border-amber-200/60",
      progressColor: "#f59e0b",
    };
  }

  return {
    label: "normal",
    textClass: "text-emerald-500",
    surfaceClass: "bg-emerald-50 border-emerald-200/60",
    progressColor: "#10b981",
  };
}
