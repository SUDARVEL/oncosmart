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
  onSubmit: (bpm: number) => void;
};

export function EndBpmModal({ visible, onSubmit }: Props) {
  const { t } = useTranslation();
  const [bpmInput, setBpmInput] = useState('');

  useEffect(() => {
    if (visible) setBpmInput('');
  }, [visible]);

  const parsedBpm = Number.parseInt(bpmInput.trim(), 10);
  const canSubmit = Number.isFinite(parsedBpm) && parsedBpm > 0 && parsedBpm <= 250;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(parsedBpm);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('daySession.endBpmTitle')}</Text>
            <Text style={styles.subtitle}>{t('daySession.endBpmSubtitle')}</Text>
          </View>

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

          <View style={styles.actions}>
            <Pressable
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              accessibilityRole="button"
            >
              <Text style={styles.submitText}>{t('daySession.endBpmSubmit')}</Text>
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
  input: {
    marginTop: 16,
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
  actions: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  submitButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
