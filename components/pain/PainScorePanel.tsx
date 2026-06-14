import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getPainTheme, PAIN_MAX, PAIN_MIN } from '../../lib/painScore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

const GREEN_EMOJI = require('../../assets/pain/5b81571eee979fd8c0337a790a7179307ce7266c.svg');
const RED_EMOJI = require('../../assets/pain/741a629974ea0a2f6f0d82c61bd20e5468f81be5.svg');

type Props = {
  score: number;
  onScoreChange: (score: number) => void;
  onContinue: () => void;
};

export function PainScorePanel({ score, onScoreChange, onContinue }: Props) {
  const { t } = useTranslation();
  const theme = getPainTheme(score, {
    noPain: t('pain.noPain'),
    moderatePain: t('pain.moderatePain'),
    worstPain: t('pain.worstPain'),
  });
  const displayScore = Math.round(score);

  return (
    <LinearGradient
      colors={[theme.gradientTop, theme.gradientBottom]}
      style={styles.gradient}
    >
      <View style={styles.content}>
        <View style={styles.scoreSection}>
          <View style={[styles.scoreCircle, { borderColor: theme.borderColor }]}>
            <Text style={[styles.scoreValue, { color: theme.scoreColor }]}>
              {displayScore}
            </Text>
            <Text style={styles.scoreMax}>/10</Text>
          </View>
          <Text style={[styles.scoreLabel, { color: theme.scoreColor }]}>{theme.label}</Text>
        </View>

        <View style={styles.sliderCard}>
          <View style={styles.sliderRow}>
            <Image source={GREEN_EMOJI} style={styles.emoji} contentFit="contain" />
            <View style={styles.sliderTrackWrap}>
              <LinearGradient
                colors={['#10B981', '#F59E0B', '#EF4444', '#DC2626']}
                locations={[0, 0.6, 0.9, 1]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.sliderGradient}
              />
              <Slider
                style={styles.slider}
                minimumValue={PAIN_MIN}
                maximumValue={PAIN_MAX}
                step={1}
                value={score}
                onValueChange={onScoreChange}
                minimumTrackTintColor="transparent"
                maximumTrackTintColor="transparent"
                thumbTintColor="#F3F4F6"
              />
            </View>
            <Image source={RED_EMOJI} style={styles.emoji} contentFit="contain" />
          </View>
          <View style={styles.scaleLabels}>
            <Text style={[styles.scaleText, styles.scaleGreen]}>0</Text>
            <Text style={[styles.scaleText, styles.scaleOrange]}>5</Text>
            <Text style={[styles.scaleText, styles.scaleRed]}>10</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle-outline" size={20} color={colors.buttonPrimary} />
            <Text style={styles.infoText}>{t('pain.info')}</Text>
          </View>
          <Pressable style={styles.continueButton} onPress={onContinue} accessibilityRole="button">
            <Text style={styles.continueText}>{t('pain.continue')}</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
    gap: 24,
    justifyContent: 'center',
  },
  scoreSection: {
    alignItems: 'center',
    gap: 24,
  },
  scoreCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3.3,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.25,
    shadowRadius: 25,
    elevation: 12,
  },
  scoreValue: {
    fontSize: 80,
    lineHeight: 80,
    ...font('bold'),
  },
  scoreMax: {
    fontSize: 16,
    lineHeight: 20,
    color: '#6A7282',
    ...font('regular'),
    marginTop: 4,
  },
  scoreLabel: {
    fontSize: 24,
    lineHeight: 32,
    ...font('semiBold'),
  },
  sliderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 32,
    paddingHorizontal: 32,
    paddingBottom: 24,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 7.5,
    elevation: 6,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    width: 52,
    height: 52,
  },
  sliderTrackWrap: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
  },
  sliderGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 10,
    borderRadius: 999,
  },
  slider: {
    width: '100%',
    height: 24,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 56,
  },
  scaleText: {
    fontSize: 14,
    lineHeight: 20,
    ...font('medium'),
  },
  scaleGreen: {
    color: '#6CB148',
  },
  scaleOrange: {
    color: '#FFA000',
  },
  scaleRed: {
    color: '#DC2626',
  },
  footer: {
    gap: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
    elevation: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#364153',
    ...font('medium'),
  },
  continueButton: {
    backgroundColor: colors.buttonPrimary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 7.5,
    elevation: 4,
  },
  continueText: {
    fontSize: 18,
    lineHeight: 24,
    color: '#FFFFFF',
    ...font('semiBold'),
  },
});
