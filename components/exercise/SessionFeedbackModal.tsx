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

import type { SessionFeedback } from '../../lib/sessionFeedback';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';
import { AppTextInput } from '../AppTextInput';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect: (feedback: SessionFeedback, note?: string) => void;
};

const OPTIONS: { id: Exclude<SessionFeedback, 'other'>; labelKey: string }[] = [
  { id: 'easy', labelKey: 'complete.feedbackEasy' },
  { id: 'hard', labelKey: 'complete.feedbackHard' },
  { id: 'tired', labelKey: 'complete.feedbackTired' },
];

/** Asked once after a session is saved. Presets close the sheet. "Any other" asks for a note. */
export function SessionFeedbackModal({ visible, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [otherOpen, setOtherOpen] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!visible) {
      setOtherOpen(false);
      setNote('');
    }
  }, [visible]);

  const trimmedNote = note.trim();
  const canSaveOther = trimmedNote.length > 0;

  const submitOther = () => {
    if (!canSaveOther) return;
    onSelect('other', trimmedNote);
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
            <Text style={styles.title}>{t('complete.feedbackTitle')}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel={t('pain.close')}
            >
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Text style={styles.subtitle}>{t('complete.feedbackSubtitle')}</Text>
            <View style={styles.options}>
              {OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  style={styles.optionButton}
                  onPress={() => onSelect(option.id)}
                  accessibilityRole="button"
                >
                  <Text style={styles.optionText}>{t(option.labelKey)}</Text>
                </Pressable>
              ))}
              <Pressable
                style={[styles.optionButton, otherOpen && styles.optionButtonSelected]}
                onPress={() => setOtherOpen(true)}
                accessibilityRole="button"
                accessibilityState={{ selected: otherOpen }}
              >
                <Text style={[styles.optionText, otherOpen && styles.optionTextSelected]}>
                  {t('complete.feedbackOther')}
                </Text>
              </Pressable>
              {otherOpen ? (
                <AppTextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder={t('complete.feedbackOtherPlaceholder')}
                  style={styles.noteInput}
                  multiline
                  maxLength={240}
                  textAlignVertical="top"
                  returnKeyType="done"
                  blurOnSubmit
                  onSubmitEditing={submitOther}
                  accessibilityLabel={t('complete.feedbackOther')}
                />
              ) : null}
            </View>
          </ScrollView>
          {otherOpen ? (
            <View style={styles.footer}>
              <Pressable
                style={[styles.saveButton, !canSaveOther && styles.saveButtonDisabled]}
                onPress={submitOther}
                disabled={!canSaveOther}
                accessibilityRole="button"
                accessibilityState={{ disabled: !canSaveOther }}
              >
                <Text style={styles.saveButtonText}>{t('complete.feedbackOtherSave')}</Text>
              </Pressable>
            </View>
          ) : null}
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
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  title: {
    flex: 1,
    fontSize: 18,
    lineHeight: 26,
    color: '#1F2937',
    ...font('semiBold'),
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 14,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4B5563',
    ...font('regular'),
  },
  options: {
    gap: 12,
    marginTop: 4,
  },
  optionButton: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionButtonSelected: {
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.cardSelectedBg,
  },
  optionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1F2937',
    textAlign: 'center',
    ...font('semiBold'),
  },
  optionTextSelected: {
    color: colors.buttonPrimary,
  },
  noteInput: {
    height: 96,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  saveButton: {
    minHeight: 52,
    borderRadius: 12,
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
