export function getDisplayPainScore(painScores: Record<string, number>): number {
  const dayKeys = Object.keys(painScores);
  if (dayKeys.length === 0) {
    return 4;
  }

  const latestDay = dayKeys
    .map((key) => Number(key))
    .filter((day) => !Number.isNaN(day))
    .sort((a, b) => b - a)[0];

  if (latestDay !== undefined && painScores[String(latestDay)] !== undefined) {
    return painScores[String(latestDay)];
  }

  if (painScores['1'] !== undefined) {
    return painScores['1'];
  }

  return 4;
}
