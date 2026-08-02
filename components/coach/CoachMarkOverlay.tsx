import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';

export type CoachTargetRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  visible: boolean;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  stepIndex: number;
  stepCount: number;
  target: CoachTargetRect | null;
  preferPlacement: 'below' | 'above';
  onNext: () => void;
  onSkip: () => void;
};

const CARD_MAX_WIDTH = 320;
const CARD_MARGIN = 16;
const SPOT_PAD = 8;

/**
 * Revolut/Peloton-style coach mark: dim scrim, spotlight ring on the target,
 * white tooltip with caret, step counter, Next + Skip.
 */
export function CoachMarkOverlay({
  visible,
  title,
  body,
  icon,
  stepIndex,
  stepCount,
  target,
  preferPlacement,
  onNext,
  onSkip,
}: Props) {
  const { t } = useTranslation();
  const { width: screenW, height: screenH } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const isLast = stepIndex >= stepCount - 1;

  let cardTop = screenH * 0.35;
  let caretLeft = screenW / 2 - 8;
  let placeBelow = preferPlacement === 'below';

  if (target) {
    const spotBottom = target.y + target.height + SPOT_PAD;
    const spotTop = target.y - SPOT_PAD;
    const spaceBelow = screenH - spotBottom - insets.bottom;
    const spaceAbove = spotTop - insets.top;

    if (preferPlacement === 'below' && spaceBelow > 180) {
      placeBelow = true;
      cardTop = spotBottom + 14;
    } else if (preferPlacement === 'above' && spaceAbove > 180) {
      placeBelow = false;
      cardTop = Math.max(insets.top + 8, spotTop - 210);
    } else if (spaceBelow >= spaceAbove) {
      placeBelow = true;
      cardTop = Math.min(spotBottom + 14, screenH - insets.bottom - 220);
    } else {
      placeBelow = false;
      cardTop = Math.max(insets.top + 8, spotTop - 210);
    }

    caretLeft = Math.min(
      Math.max(target.x + target.width / 2 - 8, CARD_MARGIN + 20),
      screenW - CARD_MARGIN - 28,
    );
  }

  const cardWidth = Math.min(CARD_MAX_WIDTH, screenW - CARD_MARGIN * 2);
  const cardLeft = Math.min(
    Math.max(CARD_MARGIN, caretLeft + 8 - cardWidth / 2),
    screenW - CARD_MARGIN - cardWidth,
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.root} pointerEvents="box-none">
        {/* Dim scrim — full screen */}
        <View style={styles.scrim} />

        {/* Spotlight ring around measured target */}
        {target ? (
          <View
            pointerEvents="none"
            style={[
              styles.spotlight,
              {
                left: target.x - SPOT_PAD,
                top: target.y - SPOT_PAD,
                width: target.width + SPOT_PAD * 2,
                height: target.height + SPOT_PAD * 2,
              },
            ]}
          />
        ) : null}

        {/* Tooltip */}
        <View
          style={[
            styles.cardWrap,
            { top: cardTop, left: cardLeft, width: cardWidth },
          ]}
        >
          {placeBelow ? (
            <View style={[styles.caretUp, { left: caretLeft - cardLeft }]} />
          ) : null}

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name={icon} size={22} color={colors.buttonPrimary} />
            </View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>{body}</Text>

            <View style={styles.footer}>
              <Text style={styles.stepText}>
                {t('coach.stepOf', { current: stepIndex + 1, total: stepCount })}
              </Text>
              <Pressable
                onPress={onNext}
                style={styles.nextButton}
                accessibilityRole="button"
                accessibilityLabel={isLast ? t('coach.done') : t('coach.next')}
              >
                <Text style={styles.nextText}>
                  {isLast ? t('coach.done') : t('coach.next')}
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={onSkip}
              style={styles.skipWrap}
              accessibilityRole="button"
              accessibilityLabel={t('coach.skip')}
            >
              <Text style={styles.skipText}>{t('coach.skip')}</Text>
            </Pressable>
          </View>

          {!placeBelow ? (
            <View style={[styles.caretDown, { left: caretLeft - cardLeft }]} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  spotlight: {
    position: 'absolute',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardWrap: {
    position: 'absolute',
  },
  caretUp: {
    width: 0,
    height: 0,
    marginBottom: -1,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  caretDown: {
    width: 0,
    height: 0,
    marginTop: -1,
    alignSelf: 'flex-start',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.tabIconActiveBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: {
    ...uiText(17, 'semiBold'),
    color: colors.textPrimary,
  },
  body: {
    ...uiText(14, 'regular'),
    color: colors.textSecondary,
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepText: {
    ...uiText(13, 'medium'),
    color: colors.textMuted,
  },
  nextButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    minWidth: 88,
    alignItems: 'center',
  },
  nextText: {
    ...font('semiBold'),
    fontSize: 14,
    lineHeight: 20,
    color: colors.buttonText,
  },
  skipWrap: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  skipText: {
    ...uiText(13, 'medium'),
    color: colors.textMuted,
    textAlign: 'center',
  },
});
