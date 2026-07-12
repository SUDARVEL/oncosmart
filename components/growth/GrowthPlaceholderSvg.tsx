import { useEffect, useState } from 'react';
import { SvgUri, SvgXml } from 'react-native-svg';

import {
  applyGrowthPlaceholderFit,
  type GrowthPlaceholderFitConfig,
} from '../../lib/fitGrowthPlaceholderSvg';

type GrowthPlaceholderSvgProps = {
  uri: string;
  width: number;
  height: number;
  fit: GrowthPlaceholderFitConfig | null;
  onError: () => void;
};

/**
 * Renders a Male Workouts placeholder SVG.
 * When `fit` is set, fetches the SVG and rewrites the pattern transform so the
 * full figure (including legs) sits inside the 66×70 circle.
 */
export function GrowthPlaceholderSvg({
  uri,
  width,
  height,
  fit,
  onError,
}: GrowthPlaceholderSvgProps) {
  const [xml, setXml] = useState<string | null>(null);

  useEffect(() => {
    if (!fit) {
      setXml(null);
      return;
    }

    let cancelled = false;
    setXml(null);

    fetch(uri)
      .then((response) => {
        if (!response.ok) throw new Error(`SVG fetch ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
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

  if (!xml) return null;
  return <SvgXml xml={xml} width={width} height={height} />;
}
