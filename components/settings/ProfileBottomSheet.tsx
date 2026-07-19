import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PrimaryButton } from '../PrimaryButton';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

type Props = {
  visible: boolean;
  username: string;
  onClose: () => void;
  onSave: (username: string) => void;
};

export function ProfileBottomSheet({ visible, username, onClose, onSave }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(username);

  useEffect(() => {
    if (visible) {
      setName(username);
    }
  }, [username, visible]);

  const trimmedName = name.trim();
  const canSave = trimmedName.length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave(trimmedName);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.handleHitArea}>
              <View style={styles.dragHandle} />
            </View>

            <View style={styles.header}>
              <Text style={styles.headerTitle}>{t('settings.myProfile')}</Text>
              <Pressable
                onPress={onClose}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Close"
              >
                <Ionicons name="close" size={22} color="#374151" />
              </Pressable>
            </View>

            <Text style={styles.subtitle}>{t('settings.myProfileSheetDescription')}</Text>

            <View style={styles.form}>
              <Text style={styles.label}>{t('username.label')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('username.placeholder')}
                placeholderTextColor={colors.textPlaceholder}
                style={styles.input}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                accessibilityLabel={t('username.label')}
              />
              <PrimaryButton
                label={t('settings.saveProfile')}
                onPress={handleSave}
                disabled={!canSave}
                style={styles.saveButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  handleHitArea: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    ...font('regular'),
  },
  form: {
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    lineHeight: 20,
    ...font('regular'),
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  saveButton: {
    height: 48,
    marginTop: 4,
  },
});
