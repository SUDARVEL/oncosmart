import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getExerciseVideoSource } from '../../lib/getExerciseVideo';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';

function ExercisePlayer({ source }: { source: string }) {
  const player = useVideoPlayer(source, (instance) => {
    instance.loop = false;
    instance.play();
  });

  return (
    <VideoView
      style={styles.video}
      player={player}
      contentFit="contain"
      nativeControls
    />
  );
}

export default function ExercisePlayerScreen() {
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day: string }>();
  const dayNumber = Number(day) || 1;

  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);

  const source = getExerciseVideoSource(dayNumber, language, gender, avatar);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Day {dayNumber}</Text>
        <View style={styles.backButton} />
      </View>

      {source ? (
        <ExercisePlayer source={source} />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Video not added yet</Text>
          <Text style={styles.emptyText}>
            Upload your Day {dayNumber} video to Supabase (or any public link) and paste the URL in
            data/levels.json under videos.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    ...font('semiBold'),
    color: colors.textPrimary,
  },
  video: {
    flex: 1,
    backgroundColor: '#000000',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: colors.background,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    ...font('semiBold'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    ...font('regular'),
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
