import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getBadgeIconSource } from '../../lib/badgeIcons';
import type { BadgeKey } from '../../lib/getEarnedBadges';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { PressableScale } from '../PressableScale';

const BADGE_COPY: Record<BadgeKey, { titleKey: string; subtitleKey: string }> = {
  startup: {
    titleKey: 'growth.badgeStartupTitle',
    subtitleKey: 'growth.badgeStartupSubtitle',
  },
  consistent: {
    titleKey: 'growth.badgeConsistentTitle',
    subtitleKey: 'growth.badgeConsistentSubtitle',
  },
  strength: {
    titleKey: 'growth.badgeStrengthTitle',
    subtitleKey: 'growth.badgeStrengthSubtitle',
  },
  hero: {
    titleKey: 'growth.badgeHeroTitle',
    subtitleKey: 'growth.badgeHeroSubtitle',
  },
  unstoppable: {
    titleKey: 'growth.badgeUnstoppableTitle',
    subtitleKey: 'growth.badgeUnstoppableSubtitle',
  },
};

const svgCache = new Map<string, string>();

/** Fetch badge SVG and normalize CSS vars so it renders cleanly on native. */
function sanitizeBadgeSvg(xml: string): string {
  return xml
    .replace(/style="display:\s*block;?"/gi, '')
    .replace(/\sfill="var\(--fill-0,\s*([^)]+)\)"/gi, ' fill="$1"')
    .replace(/\sstroke="var\(--stroke-0,\s*([^)]+)\)"/gi, ' stroke="$1"');
}

function useBadgeSvgXml(uri: string | null): { xml: string | null; loading: boolean } {
  const [xml, setXml] = useState<string | null>(() =>
    uri && svgCache.has(uri) ? svgCache.get(uri)! : null,
  );
  const [loading, setLoading] = useState(() => Boolean(uri && !svgCache.has(uri)));

  useEffect(() => {
    if (!uri) {
      setXml(null);
      setLoading(false);
      return;
    }

    const cached = svgCache.get(uri);
    if (cached) {
      setXml(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setXml(null);

    fetch(uri)
      .then((response) => {
        if (!response.ok) throw new Error(`Badge SVG ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (cancelled) return;
        const cleaned = sanitizeBadgeSvg(text);
        svgCache.set(uri, cleaned);
        setXml(cleaned);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setXml(null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [uri]);

  return { xml, loading };
}

type BadgeCelebrationModalProps = {
  badgeKey: BadgeKey | null;
  visible: boolean;
  onDismiss: () => void;
};

export function BadgeCelebrationModal({
  badgeKey,
  visible,
  onDismiss,
}: BadgeCelebrationModalProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0.86)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const source = badgeKey ? getBadgeIconSource(badgeKey) : null;
  const uri =
    source && typeof source === 'object' && 'uri' in source ? source.uri : null;
  const { xml, loading } = useBadgeSvgXml(visible ? uri : null);

  useEffect(() => {
    if (!visible || !badgeKey) return;

    scale.setValue(0.86);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 70,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 240,
        useNativeDriver: true,
      }),
    ]).start();
  }, [badgeKey, opacity, scale, visible]);

  if (!badgeKey) return null;

  const copy = BADGE_COPY[badgeKey];
  const title = t(copy.titleKey);
  const subtitle = t(copy.subtitleKey);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
          <View style={styles.badgeWrap}>
            <View style={styles.badgeRing} />
            <View style={styles.badgePlate}>
              {loading ? (
                <ActivityIndicator color={colors.buttonPrimary} size="large" />
              ) : xml ? (
                <SvgXml xml={xml} width={152} height={152} />
              ) : (
                <View style={styles.badgeFallback}>
                  <Text style={styles.badgeFallbackText}>★</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.headline}>
            {t('growth.badgeEarnedHeadline', { badge: title })}
          </Text>
          <Text style={styles.body}>
            {t('growth.badgeEarnedBody', { detail: subtitle })}
          </Text>
        </Animated.View>

        <PressableScale
          style={styles.button}
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t('growth.badgeEarnedGotIt')}
        >
          <Text style={styles.buttonText}>{t('growth.badgeEarnedGotIt')}</Text>
        </PressableScale>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  badgeWrap: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E8F4FC',
  },
  badgePlate: {
    width: 164,
    height: 164,
    borderRadius: 82,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  badgeFallback: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeFallbackText: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  headline: {
    fontSize: 26,
    lineHeight: 32,
    ...font('semiBold'),
    color: '#00131F',
    textAlign: 'center',
    letterSpacing: -0.3,
    paddingHorizontal: 8,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    ...font('regular'),
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  button: {
    width: '100%',
    maxWidth: 360,
    height: 52,
    borderRadius: 999,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    letterSpacing: 0.6,
    ...font('semiBold'),
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
});
