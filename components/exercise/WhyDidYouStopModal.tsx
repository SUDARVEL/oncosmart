import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';
import { AppTextInput } from '../AppTextInput';

export type StopReason = 'tired' | 'pain' | 'exploring';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (reason: StopReason, note: string) => void;
};

export function WhyDidYouStopModal({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<StopReason | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setSelected(null);
      setNote('');
    }
  }, [visible]);

  const trimmedNote = note.trim();
  const canSave = selected != null && trimmedNote.length > 0;

  const options: { reason: StopReason; label: string }[] = [
    { reason: 'tired', label: t('sessionFlow.stopReasonTired') },
    { reason: 'pain', label: t('sessionFlow.stopReasonPain') },
    { reason: 'exploring', label: t('sessionFlow.stopReasonExploring') },
  ];

  const submit = () => {
    if (!selected || trimmedNote.length === 0) return;
    onSelect(selected, trimmedNote);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={[
          styles.backdrop,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('sessionFlow.whyDidYouStop')}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('pain.close')}
            >
              <Ionicons name="close" size={24} color="#374151" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.subtitle}>{t('sessionFlow.stopSubtitle')}</Text>

            <View style={styles.options}>
              {options.map((option) => {
                const isSelected = selected === option.reason;
                return (
                  <Pressable
                    key={option.reason}
                    style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                    onPress={() => setSelected(option.reason)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.prompt}>{t('sessionFlow.stopReasonPrompt')}</Text>
            <AppTextInput
              value={note}
              onChangeText={setNote}
              placeholder={t('sessionFlow.stopReasonPlaceholder')}
              style={styles.noteInput}
              multiline
              maxLength={240}
              textAlignVertical="top"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={submit}
              accessibilityLabel={t('sessionFlow.stopReasonPrompt')}
            />
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
              onPress={submit}
              disabled={!canSave}
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSave }}
            >
              <Text style={styles.saveButtonText}>{t('sessionFlow.stopReasonSave')}</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxWidth: 394,
    maxHeight: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: '#374151',
    ...font('medium'),
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    gap: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    ...font('regular'),
  },
  options: {
    gap: 15,
    marginTop: 8,
  },
  optionButton: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  optionButtonSelected: {
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.cardSelectedBg,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#414651',
    ...font('semiBold'),
  },
  optionTextSelected: {
    color: colors.buttonPrimary,
  },
  prompt: {
    marginTop: 8,
    color: '#374151',
    ...uiText(15, 'medium'),
  },
  noteInput: {
    height: 96,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  saveButtonDisabled: {
    backgroundColor: colors.buttonDisabled,
  },
  saveButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    ...uiText(16, 'semiBold'),
  },
});
