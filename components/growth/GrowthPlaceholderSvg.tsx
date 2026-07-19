import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SvgUri, SvgXml } from "react-native-svg";

import {
  applyGrowthPlaceholderFit,
  type GrowthPlaceholderFitConfig,
} from "../../lib/fitGrowthPlaceholderSvg";

type GrowthPlaceholderSvgProps = {
  uri: string;
  width: number;
  height: number;
  fit: GrowthPlaceholderFitConfig | null;
  onError: () => void;
};

function extractEmbeddedPngDataUri(svgXml: string): string | null {
  const match = svgXml.match(
    /xlink:href="(data:image\/png;base64,[^"]+)"|href="(data:image\/png;base64,[^"]+)"/,
  );
  return match?.[1] ?? match?.[2] ?? null;
}

/**
 * Renders a Growth workout placeholder.
 * Male SVGs are already cropped for the 66×70 circle — use SvgUri as-is.
 * Female SVGs are room-scale; extract the embedded PNG and cover-crop it so
 * the figure fills the circle like male (no white crescent under the floor).
 */
export function GrowthPlaceholderSvg({
  uri,
  width,
  height,
  fit,
  onError,
}: GrowthPlaceholderSvgProps) {
  const [xml, setXml] = useState<string | null>(null);
  const [pngDataUri, setPngDataUri] = useState<string | null>(null);

  useEffect(() => {
    if (!fit) {
      setXml(null);
      setPngDataUri(null);
      return;
    }

    let cancelled = false;
    setXml(null);
    setPngDataUri(null);

    fetch(uri)
      .then((response) => {
        if (!response.ok) throw new Error(`SVG fetch ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        const embedded = extractEmbeddedPngDataUri(text);
        if (embedded) {
          setPngDataUri(embedded);
          return;
        }
        setXml(applyGrowthPlaceholderFit(text, fit));
      })
      .catch(() => {
        if (!cancelled) onError();
      });

    return () => {
      cancelled = true;
    };
  }, [uri, fit, onError]);

  if (!fit) {
    return <SvgUri uri={uri} width={width} height={height} onError={onError} />;
  }

  if (pngDataUri) {
    // Cover-crop the embedded photo into the circle — matches male fill / Figma reference.
    return (
      <View style={{ width, height, overflow: "hidden" }}>
        <Image
          source={{ uri: pngDataUri }}
          style={{ width, height }}
          contentFit="cover"
          contentPosition="center"
          cachePolicy="memory-disk"
          recyclingKey={`growth-png-${uri}`}
          onError={onError}
        />
      </View>
    );
  }

  if (!xml) return null;
  return <SvgXml xml={xml} width={width} height={height} />;
}
