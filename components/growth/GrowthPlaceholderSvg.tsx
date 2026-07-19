import { Image } from "expo-image";
import { SvgUri } from "react-native-svg";

import type { GrowthPlaceholderFitConfig } from "../../lib/fitGrowthPlaceholderSvg";

type GrowthPlaceholderSvgProps = {
  uri: string;
  width: number;
  height: number;
  fit: GrowthPlaceholderFitConfig | null;
  onError: () => void;
};

/**
 * Renders a Growth workout placeholder in the 66×70 circle.
 *
 * Male SVGs are already framed for that circle — use SvgUri as-is.
 * Female SVGs are shorter room-scale assets; cover-crop them with expo-image
 * so the scene fills the circle edge-to-edge (matches male / Figma reference).
 */
export function GrowthPlaceholderSvg({
  uri,
  width,
  height,
  fit,
  onError,
}: GrowthPlaceholderSvgProps) {
  if (!fit) {
    return <SvgUri uri={uri} width={width} height={height} onError={onError} />;
  }

  return (
    <Image
      source={{ uri }}
      style={{ width, height }}
      contentFit="cover"
      contentPosition="center"
      cachePolicy="memory-disk"
      recyclingKey={`growth-cover-${uri}`}
      onError={onError}
    />
  );
}
