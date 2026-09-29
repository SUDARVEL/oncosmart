import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from '../../lib/cancerPathway';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { uiText } from '../../theme/typography';

type Props = {
  visible: boolean;
  selected: CancerTypeSlug | null;
  onClose: () => void;
  onSelect: (slug: CancerTypeSlug) => void;
};

export function CancerTypeBottomSheet({ visible, selected, onClose, onSelect }: Props) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          style={styles.scrim}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.handleHitArea}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('settings.cancerPathway')}</Text>
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color="#374151" />
            </Pressable>
          </View>

          <Text style={styles.subtitle}>{t('settings.cancerPathwayDescription')}</Text>

          <View style={styles.chipGrid}>
            {CANCER_TYPE_SLUGS.map((slug) => {
              const isSelected = selected === slug;
              return (
                <Pressable
                  key={slug}
                  onPress={() => onSelect(slug)}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                    {t(CANCER_TYPE_I18N_KEYS[slug])}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** Current slug from persisted profile (supports legacy free-text). */
export function selectedCancerSlugFromStore(raw: string): CancerTypeSlug | null {
  return normalizeCancerTypeSlug(raw);
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
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chipSelected: {
    backgroundColor: colors.optionBgSelected,
    borderWidth: 1.5,
    borderColor: colors.optionBorderSelected,
  },
  chipText: {
    ...uiText(15, 'medium'),
    textAlign: 'center',
    color: colors.textMuted,
  },
  chipTextSelected: {
    ...font('semiBold'),
    color: colors.optionTextSelected,
  },
});
