import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppTextInput } from '../../components/AppTextInput';
import { ParqQuestion } from '../../components/ParqQuestion';
import { PrimaryButton } from '../../components/PrimaryButton';
import { ScreenHeader } from '../../components/ScreenHeader';
import { useAndroidBack } from '../../hooks/useAndroidBack';
import { getCurrentSession } from '../../lib/auth';
import {
  CANCER_TYPE_I18N_KEYS,
  CANCER_TYPE_SLUGS,
  normalizeCancerTypeSlug,
  type CancerTypeSlug,
} from '../../lib/cancerPathway';
import { isAdminSession } from '../../lib/isAdmin';
import { goBackOr } from '../../lib/navBack';
import { saveCloudProfileFromStore } from '../../lib/userCloudSync';
import { AppGender, TreatmentType, useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const PARQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7'] as const;
const GENDERS: { id: AppGender; labelKey: string }[] = [
  { id: 'male', labelKey: 'gender.male' },
  { id: 'female', labelKey: 'gender.female' },
  { id: 'prefer_not_to_say', labelKey: 'gender.preferNot' },
];
const TREATMENTS: { id: TreatmentType; labelKey: string }[] = [
  { id: 'chemotherapy', labelKey: 'treatment.chemotherapy' },
  { id: 'radiation', labelKey: 'treatment.radiation' },
  { id: 'both', labelKey: 'treatment.both' },
  { id: 'none', labelKey: 'treatment.none' },
];

const MIN_AGE = 1;
const MAX_AGE = 120;

function Choice({
  label,
  selected,
  onPress,
  grow = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  grow?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.choice, grow && styles.choiceGrow, selected && styles.choiceSelected]}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export default function OnboardingAnswersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);
  const savedAge = useAppStore((state) => state.age);
  const savedGender = useAppStore((state) => state.gender);
  const savedCancer = useAppStore((state) => state.cancerType);
  const savedTreatment = useAppStore((state) => state.treatmentUndergoing);
  const savedSurgery = useAppStore((state) => state.underwentSurgery);
  const savedParq = useAppStore((state) => state.parqAnswers);

  const [ageText, setAgeText] = useState(
    savedAge != null && savedAge > 0 ? String(savedAge) : '',
  );
  const [gender, setGender] = useState<AppGender | null>(savedGender);
  const [cancer, setCancer] = useState<CancerTypeSlug | null>(normalizeCancerTypeSlug(savedCancer));
  const [treatment, setTreatment] = useState<TreatmentType | null>(savedTreatment);
  const [surgery, setSurgery] = useState<boolean | null>(savedSurgery);
  const [parq, setParq] = useState<(boolean | null)[]>(() => {
    const next = savedParq.slice(0, 7);
    while (next.length < 7) next.push(null);
    return next;
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void getCurrentSession().then((session) => {
      if (cancelled) return;
      if (!isAdminSession(session)) {
        router.replace('/settings');
        return;
      }
      setAllowed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleBack = useCallback(() => {
    goBackOr(() => router.replace('/settings'));
  }, [router]);

  useAndroidBack(
    useCallback(() => {
      handleBack();
      return true;
    }, [handleBack]),
  );

  const parsedAge = Number.parseInt(ageText.replace(/[^\d]/g, ''), 10);
  const ageOk = Number.isFinite(parsedAge) && parsedAge >= MIN_AGE && parsedAge <= MAX_AGE;
  const parqComplete = parq.every((answer) => answer !== null);
  const canSave =
    allowed &&
    !saving &&
    ageOk &&
    gender != null &&
    cancer != null &&
    treatment != null &&
    surgery != null &&
    parqComplete;

  const handleSave = async () => {
    if (!canSave || gender == null || cancer == null || treatment == null || surgery == null) {
      return;
    }
    setSaving(true);
    setSavedMessage(null);
    const store = useAppStore.getState();
    store.setAge(parsedAge);
    store.setGender(gender);
    store.setCancerType(cancer);
    store.setTreatmentUndergoing(treatment);
    store.setUnderwentSurgery(surgery);
    parq.forEach((answer, index) => {
      if (answer != null) store.setParqAnswer(index, answer);
    });
    store.setParqCleared(!parq.some((answer) => answer === true));
    const userId = useAppStore.getState().activeAuthUserId;
    if (userId) {
      await saveCloudProfileFromStore(userId);
    }
    setSaving(false);
    setSavedMessage(t('settings.onboardingSaved'));
  };

  if (!allowed) {
    return <SafeAreaView style={styles.screen} />;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScreenHeader title={t('settings.onboardingAnswers')} showBack onBack={handleBack} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.intro}>{t('settings.onboardingAnswersDescription')}</Text>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('age.header')}</Text>
            <AppTextInput
              value={ageText}
              onChangeText={(value) => setAgeText(value.replace(/[^\d]/g, '').slice(0, 3))}
              placeholder={t('age.placeholder')}
              keyboardType="number-pad"
              maxLength={3}
              style={styles.input}
              accessibilityLabel={t('age.label')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('gender.header')}</Text>
            <View style={styles.choiceList}>
              {GENDERS.map((option) => (
                <Choice
                  key={option.id}
                  label={t(option.labelKey)}
                  selected={gender === option.id}
                  onPress={() => setGender(option.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('treatment.cancerTypeLabel')}</Text>
            <View style={styles.choiceList}>
              {CANCER_TYPE_SLUGS.map((slug) => (
                <Choice
                  key={slug}
                  label={t(CANCER_TYPE_I18N_KEYS[slug])}
                  selected={cancer === slug}
                  onPress={() => setCancer(slug)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('treatment.treatmentLabel')}</Text>
            <View style={styles.choiceList}>
              {TREATMENTS.map((option) => (
                <Choice
                  key={option.id}
                  label={t(option.labelKey)}
                  selected={treatment === option.id}
                  onPress={() => setTreatment(option.id)}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('treatment.surgeryLabel')}</Text>
            <View style={styles.choiceRow}>
              <Choice
                label={t('treatment.yes')}
                selected={surgery === true}
                onPress={() => setSurgery(true)}
                grow
              />
              <Choice
                label={t('treatment.no')}
                selected={surgery === false}
                onPress={() => setSurgery(false)}
                grow
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('parq.header')}</Text>
            <Text style={styles.sectionHint}>{t('parq.intro')}</Text>
            <View style={styles.parqList}>
              {PARQ_KEYS.map((key, index) => (
                <ParqQuestion
                  key={key}
                  text={t(`parq.${key}`)}
                  value={parq[index] ?? null}
                  onChange={(value) =>
                    setParq((current) => {
                      const next = [...current];
                      next[index] = value;
                      return next;
                    })
                  }
                  yesLabel={t('parq.yes')}
                  noLabel={t('parq.no')}
                />
              ))}
            </View>
          </View>

          {savedMessage ? <Text style={styles.saved}>{savedMessage}</Text> : null}

          <PrimaryButton
            label={saving ? t('settings.onboardingSaving') : t('settings.onboardingSave')}
            onPress={() => void handleSave()}
            disabled={!canSave}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 20,
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
    ...font('regular'),
  },
  section: {
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
    ...font('semiBold'),
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.textMuted,
    ...font('regular'),
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  choiceList: {
    gap: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choice: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#D5D7DA',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  choiceGrow: {
    flex: 1,
  },
  choiceSelected: {
    borderColor: colors.buttonPrimary,
    backgroundColor: colors.cardSelectedBg,
  },
  choiceText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
    ...font('medium'),
  },
  choiceTextSelected: {
    color: colors.buttonPrimary,
  },
  parqList: {
    gap: 24,
  },
  saved: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.buttonPrimary,
    textAlign: 'center',
    ...font('medium'),
  },
});
