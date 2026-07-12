import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
};

export function ReadyToBeginModal({ visible, onYes, onNo }: Props) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onNo}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('pain.readyTitle')}</Text>
            <Text style={styles.subtitle}>{t('pain.readySubtitle')}</Text>
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.noButton} onPress={onNo} accessibilityRole="button">
              <Text style={styles.noText}>{t('pain.readyNo')}</Text>
            </Pressable>
            <Pressable style={styles.yesButton} onPress={onYes} accessibilityRole="button">
              <Text style={styles.yesText}>{t('pain.readyYes')}</Text>
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
  noButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    ...font('semiBold'),
  },
  yesButton: {
    flex: 1,
    backgroundColor: colors.buttonPrimary,
    borderWidth: 1,
    borderColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  yesText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
