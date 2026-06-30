export function getDisplayPainScore(painScores: Record<string, number>): number {
  const keys = Object.keys(painScores);
  if (keys.length === 0) {
    return 4;
  }

  const latestKey = keys[keys.length - 1];
  const latestScore = painScores[latestKey];
  if (latestScore !== undefined) {
    return latestScore;
  }

  return 4;
}
