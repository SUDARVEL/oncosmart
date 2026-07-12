/**
 * Male Workouts placeholder SVGs embed a landscape PNG in a 66×70 circle using a
 * cover-style pattern transform. For some poses that clips the body.
 *
 * We rewrite the pattern <use> matrix to a point between contain (full image,
 * often too small) and cover (fills the circle, often clips legs).
 */

export type GrowthPlaceholderFitConfig = {
  /**
   * 0 = contain (entire photo visible, smaller figure)
   * 1 = cover (fills the circle, may clip edges)
   * Use values in between so the pose stays clear without hiding the body.
   */
  fill: number;
  /** Extra Y shift in pattern units. Negative moves the subject up into the circle. */
  offsetY?: number;
};

export function applyGrowthPlaceholderFit(
  svgXml: string,
  fit: GrowthPlaceholderFitConfig,
): string {
  const imageMatch = svgXml.match(/<image\b[^>]*>/);
  if (!imageMatch) return svgXml;

  const imgTag = imageMatch[0];
  const width = Number(imgTag.match(/\bwidth="([\d.]+)"/)?.[1]);
  const height = Number(imgTag.match(/\bheight="([\d.]+)"/)?.[1]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return svgXml;
  }

  const fill = Math.min(1, Math.max(0, fit.fill));
  const contain = Math.min(1 / width, 1 / height);
  const cover = Math.max(1 / width, 1 / height);
  const scale = contain + (cover - contain) * fill;

  const dispW = width * scale;
  const dispH = height * scale;
  const tx = (1 - dispW) / 2;
  const ty = (1 - dispH) / 2 + (fit.offsetY ?? 0);
  const matrix = `matrix(${scale} 0 0 ${scale} ${tx} ${ty})`;

  if (!/transform="matrix\([^"]+\)"/.test(svgXml)) return svgXml;
  return svgXml.replace(/transform="matrix\([^"]+\)"/, `transform="${matrix}"`);
}
