/**
 * Male Workouts placeholder SVGs embed a landscape PNG in a 66×70 circle using a
 * cover-style pattern transform. Female files use the same pattern but often a
 * shorter viewBox/rect (66×68), which leaves a white crescent under the floor.
 *
 * We rewrite the pattern matrix and normalize the frame to the male 66×70 circle.
 */

export type GrowthPlaceholderFitConfig = {
  /**
   * 0 = contain (entire photo visible, smaller figure)
   * 1 = cover (fills the circle height like male, may clip sides)
   * >1 = zoom past cover (tighter crop for room-scale female photos)
   */
  fill: number;
  /**
   * Extra Y shift in pattern units after top-aligning.
   * Negative moves the subject up (show more floor / less ceiling).
   */
  offsetY?: number;
};

const FRAME_W = 66;
const FRAME_H = 70;
const FRAME_RX = 33;

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

  // Male placeholders cover circle height (scale ≈ 1/imageHeight) and top-align
  // (ty = 0) so the floor meets the bottom of the ring. Match that, then zoom.
  const fill = Math.min(2.5, Math.max(0, fit.fill));
  const contain = Math.min(1 / width, 1 / height);
  const cover = Math.max(1 / width, 1 / height);
  const scale =
    fill <= 1 ? contain + (cover - contain) * fill : cover * fill;

  const dispW = width * scale;
  const tx = (1 - dispW) / 2;
  // Top-align like male so content always reaches the bottom edge.
  const ty = fit.offsetY ?? 0;
  const matrix = `matrix(${scale} 0 0 ${scale} ${tx} ${ty})`;

  if (!/transform="matrix\([^"]+\)"/.test(svgXml)) return svgXml;
  let next = svgXml.replace(
    /transform="matrix\([^"]+\)"/,
    `transform="${matrix}"`,
  );

  // Normalize root to the male 66×70 circle frame.
  next = next.replace(/<svg\b[^>]*>/, (tag) => {
    let updated = tag
      .replace(/viewBox="[^"]*"/, `viewBox="0 0 ${FRAME_W} ${FRAME_H}"`)
      .replace(/\bwidth="[^"]*"/, `width="${FRAME_W}"`)
      .replace(/\bheight="[^"]*"/, `height="${FRAME_H}"`);
    if (!/\bpreserveAspectRatio=/.test(updated)) {
      updated = updated.replace(
        /<svg\b/,
        '<svg preserveAspectRatio="xMidYMid slice"',
      );
    } else {
      updated = updated.replace(
        /preserveAspectRatio="[^"]*"/,
        'preserveAspectRatio="xMidYMid slice"',
      );
    }
    return updated;
  });

  // Female SVGs keep rect height 68 after viewBox normalize — that leaves the
  // white crescent under the floor. Force the rounded rect to the full circle.
  next = next.replace(/<rect\b[^>]*>/, (tag) => {
    const fillAttr = tag.match(/fill="[^"]*"/)?.[0] ?? 'fill="url(#pattern0)"';
    return `<rect width="${FRAME_W}" height="${FRAME_H}" rx="${FRAME_RX}" ${fillAttr}/>`;
  });

  return next;
}
