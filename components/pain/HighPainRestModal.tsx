import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  /** Patient chooses to rest and do the session later. */
  onRest: () => void;
  /** Patient acknowledges and continues anyway. */
  onContinue: () => void;
};

/**
 * Shown when the patient selects a high pain score (8-10), gently suggesting
 * they can rest and do the session later. Tamil + English via i18n.
 */
export function HighPainRestModal({ visible, onRest, onContinue }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('pain.highPainTitle')}</Text>
            <Text style={styles.subtitle}>{t('pain.highPainSubtitle')}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.continueButton} onPress={onContinue} accessibilityRole="button">
              <Text
                style={styles.continueText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {t('pain.highPainContinue')}
              </Text>
            </Pressable>
            <Pressable style={styles.restButton} onPress={onRest} accessibilityRole="button">
              <Text
                style={styles.restText}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {t('pain.highPainRest')}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    width: '100%',
    maxWidth: 362,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    width: '100%',
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 0,
    gap: 12,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
  },
  title: {
    fontSize: 18,
    lineHeight: 28,
    color: '#181D27',
    ...font('semiBold'),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#535862',
    ...font('regular'),
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  restButton: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  restText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    textAlign: 'center',
    ...font('semiBold'),
  },
  continueButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  continueText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    textAlign: 'center',
    ...font('semiBold'),
  },
});
