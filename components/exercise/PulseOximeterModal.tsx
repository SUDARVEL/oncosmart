import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  /** Moderate-zone upper heart rate (bpm) from onboarding age. */
  maxBpm: number;
  onCancel: () => void;
  onStart: (bpm: number) => void;
};

export function PulseOximeterModal({ visible, maxBpm, onCancel, onStart }: Props) {
  const { t } = useTranslation();
  const [bpmInput, setBpmInput] = useState('');

  useEffect(() => {
    if (visible) setBpmInput('');
  }, [visible]);

  const parsedBpm = Number.parseInt(bpmInput.trim(), 10);
  const hasInput = bpmInput.trim().length > 0;
  const isValidNumber = Number.isFinite(parsedBpm) && parsedBpm > 0 && parsedBpm <= 250;
  const exceedsLimit = isValidNumber && parsedBpm > maxBpm;
  const canStart = isValidNumber && !exceedsLimit;

  const handleStart = () => {
    if (!canStart) return;
    onStart(parsedBpm);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('daySession.pulseTitle')}</Text>
            <Text style={styles.subtitle}>
              {t('daySession.pulseSubtitle', { bpm: maxBpm })}
            </Text>
            <Text style={styles.allowedBpm}>
              {t('daySession.allowedBpm', { bpm: maxBpm })}
            </Text>
          </View>

          <Text style={styles.inputLabel}>{t('daySession.bpmInputLabel')}</Text>
          <TextInput
            style={styles.input}
            value={bpmInput}
            onChangeText={setBpmInput}
            keyboardType="number-pad"
            placeholder={t('daySession.bpmPlaceholder')}
            placeholderTextColor="#9CA3AF"
            maxLength={3}
            accessibilityLabel={t('daySession.bpmInputLabel')}
          />

          {exceedsLimit ? (
            <View style={styles.errorBlock}>
              <Text style={styles.errorText}>{t('daySession.bpmTooHigh')}</Text>
              <Text style={styles.doctorText}>{t('daySession.consultDoctor')}</Text>
            </View>
          ) : null}

          {hasInput && !isValidNumber ? (
            <Text style={styles.errorText}>{t('daySession.bpmInvalid')}</Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel} accessibilityRole="button">
              <Text style={styles.cancelText}>{t('daySession.pulseCancel')}</Text>
            </Pressable>
            <Pressable
              style={[styles.startButton, !canStart && styles.startButtonDisabled]}
              onPress={handleStart}
              disabled={!canStart}
              accessibilityRole="button"
            >
              <Text style={styles.startText}>{t('daySession.pulseStart')}</Text>
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
    gap: 8,
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    backgroundColor: '#FFFFFF',
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
  allowedBpm: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.buttonPrimary,
    ...font('semiBold'),
  },
  inputLabel: {
    marginTop: 16,
    marginHorizontal: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#414651',
    ...font('medium'),
  },
  input: {
    marginTop: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#181D27',
    ...font('regular'),
  },
  errorBlock: {
    marginTop: 12,
    marginHorizontal: 16,
    gap: 4,
  },
  errorText: {
    marginTop: 12,
    marginHorizontal: 16,
    fontSize: 14,
    lineHeight: 20,
    color: '#DC2626',
    ...font('medium'),
  },
  doctorText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#991B1B',
    ...font('semiBold'),
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  cancelButton: {
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
  cancelText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    ...font('semiBold'),
  },
  startButton: {
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
  startButtonDisabled: {
    opacity: 0.5,
  },
  startText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
