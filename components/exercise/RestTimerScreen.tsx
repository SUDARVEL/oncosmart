import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '../../theme/colors';
import { font, displayFontStyle } from '../../theme/fonts';

type Props = {
  seconds: number;
  onComplete: () => void;
  onBackPress: () => void;
};

export function RestTimerScreen({ seconds, onComplete, onBackPress }: Props) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onCompleteRef.current();
      return;
    }

    const timer = setTimeout(() => {
      setRemaining((value) => value - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={onBackPress} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{t('sessionFlow.restTitle')}</Text>
          <Text style={styles.subtitle}>{t('sessionFlow.restSubtitle')}</Text>
        </View>

        <Text style={styles.timer}>
          {remaining} {t('sessionFlow.restSecondsUnit')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 13,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 17,
    gap: 11,
  },
  textBlock: {
    width: '100%',
    maxWidth: 356,
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    color: '#262526',
    textAlign: 'center',
    ...font('semiBold'),
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#535862',
    textAlign: 'center',
    ...font('regular'),
  },
  timer: {
    fontSize: 64,
    lineHeight: 82,
    color: '#00131F',
    textAlign: 'center',
    ...displayFontStyle(),
  },
});
