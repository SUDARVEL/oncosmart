import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { getLevelWorkouts, type WorkoutLevel } from '../../lib/getLevelWorkouts';
import { getWorkoutDetailsForLevel } from '../../lib/getWorkoutDetails';
import { useAppStore } from '../../store/useAppStore';
import { colors } from '../../theme/colors';
import { font } from '../../theme/fonts';
import { LevelTabSwitch } from './LevelTabSwitch';
import { WorkoutDetailSlider } from './WorkoutDetailSlider';
import { WorkoutRowCard } from './WorkoutRowCard';

export function WorkoutsSection() {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);
  const [activeLevel, setActiveLevel] = useState<WorkoutLevel>(1);
  const [sliderVisible, setSliderVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const workouts = getLevelWorkouts(activeLevel, gender);
  const workoutDetails = useMemo(
    () => getWorkoutDetailsForLevel(activeLevel, language, gender, avatar),
    [activeLevel, avatar, gender, language],
  );

  const openWorkout = (exerciseId: string) => {
    const index = workoutDetails.findIndex((workout) => workout.id === exerciseId);
    setSelectedIndex(index >= 0 ? index : 0);
    setSliderVisible(true);
  };

  const closeSlider = () => {
    setSliderVisible(false);
  };

  return (
    <View style={styles.container}>
      <LevelTabSwitch activeLevel={activeLevel} onLevelChange={setActiveLevel} />

      {workouts.length > 0 ? (
        <View style={styles.list}>
          {workouts.map((workout) => (
            <WorkoutRowCard
              key={workout.id}
              workout={workout}
              onPress={() => openWorkout(workout.id)}
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {t('growth.workouts.emptyLevel', { level: activeLevel })}
          </Text>
        </View>
      )}

      <WorkoutDetailSlider
        visible={sliderVisible}
        workouts={workoutDetails}
        initialIndex={selectedIndex}
        onClose={closeSlider}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  list: {
    width: 326,
    gap: 15,
  },
  empty: {
    width: 326,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    ...font('regular'),
  },
});
