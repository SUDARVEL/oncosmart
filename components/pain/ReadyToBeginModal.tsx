import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme/colors';
import { uiText } from '../../theme/typography';

type Props = {
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
};

type Answer = 'yes' | 'no' | null;

/**
 * Pre-session check shown everywhere a session can start.
 * Exercise continues only when the patient feels ready and has no fever.
 */
export function ReadyToBeginModal({ visible, onYes, onNo }: Props) {
  const { t } = useTranslation();
  const [ready, setReady] = useState<Answer>(null);
  const [fever, setFever] = useState<Answer>(null);

  useEffect(() => {
    if (!visible) return;
    setReady(null);
    setFever(null);
  }, [visible]);

  const answered = ready !== null && fever !== null;
  const canStart = ready === 'yes' && fever === 'no';
  const shouldRest = answered && !canStart;

  const handlePrimary = () => {
    if (!answered) return;
    if (canStart) onYes();
    else onNo();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onNo}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ScrollView bounces={false} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{t('pain.readyTitle')}</Text>
            <Text style={styles.subtitle}>{t('pain.readySubtitle')}</Text>

            <ChoiceRow
              question={t('pain.readyQuestion')}
              value={ready}
              yesLabel={t('pain.readyYes')}
              noLabel={t('pain.readyNo')}
              onChange={setReady}
            />
            <ChoiceRow
              question={t('pain.feverQuestion')}
              value={fever}
              yesLabel={t('pain.readyYes')}
              noLabel={t('pain.readyNo')}
              onChange={setFever}
            />

            {shouldRest ? <Text style={styles.restNote}>{t('pain.feverRestBody')}</Text> : null}

            <Pressable
              style={[styles.primaryButton, !answered && styles.primaryButtonDisabled]}
              onPress={handlePrimary}
              disabled={!answered}
              accessibilityRole="button"
              accessibilityState={{ disabled: !answered }}
            >
              <Text style={[styles.primaryText, !answered && styles.primaryTextDisabled]}>
                {shouldRest ? t('pain.feverRest') : t('pain.readyContinue')}
              </Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ChoiceRow({
  question,
  value,
  yesLabel,
  noLabel,
  onChange,
}: {
  question: string;
  value: Answer;
  yesLabel: string;
  noLabel: string;
  onChange: (next: Answer) => void;
}) {
  return (
    <View style={styles.questionBlock}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.choices}>
        <ChoiceButton
          label={noLabel}
          selected={value === 'no'}
          onPress={() => onChange('no')}
          accessibilityLabel={`${question} ${noLabel}`}
        />
        <ChoiceButton
          label={yesLabel}
          selected={value === 'yes'}
          onPress={() => onChange('yes')}
          accessibilityLabel={`${question} ${yesLabel}`}
        />
      </View>
    </View>
  );
}

function ChoiceButton({
  label,
  selected,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      style={[styles.choice, selected && styles.choiceSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected }}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextSelected]}>{label}</Text>
    </Pressable>
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
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#0A0D18',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 12,
  },
  content: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    ...uiText(18, 'semiBold'),
    color: '#181D27',
  },
  subtitle: {
    ...uiText(14),
    color: '#535862',
    marginTop: -8,
  },
  questionBlock: {
    gap: 8,
  },
  question: {
    ...uiText(16, 'semiBold'),
    color: '#181D27',
  },
  choices: {
    flexDirection: 'row',
    gap: 12,
  },
  choice: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D5D7DA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceSelected: {
    backgroundColor: colors.buttonPrimary,
    borderColor: colors.buttonPrimary,
  },
  choiceText: {
    ...uiText(16, 'semiBold'),
    color: '#414651',
    textAlign: 'center',
  },
  choiceTextSelected: {
    color: '#FFFFFF',
  },
  restNote: {
    ...uiText(14),
    color: '#3F3F46',
    backgroundColor: '#F4F6F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  primaryText: {
    ...uiText(16, 'semiBold'),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  primaryTextDisabled: {
    color: '#9CA3AF',
  },
});
