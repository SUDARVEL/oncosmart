import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { font } from '../theme/fonts';
import { YesNoToggle } from './YesNoToggle';

type ParqQuestionProps = {
  text: string;
  value: boolean | null;
  onChange: (value: boolean) => void;
  yesLabel: string;
  noLabel: string;
  tall?: boolean;
};

export function ParqQuestion({
  text,
  value,
  onChange,
  yesLabel,
  noLabel,
  tall = false,
}: ParqQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.question, tall && styles.questionTall]}>{text}</Text>
      <YesNoToggle value={value} onChange={onChange} yesLabel={yesLabel} noLabel={noLabel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  question: {
    fontSize: 14,
    ...font('semiBold'),
    color: colors.textPrimary,
    lineHeight: 20,
  },
  questionTall: {
    lineHeight: 20,
  },
});
