import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet, Text, View, type View as RNView } from "react-native";

import { useExercisePauseGuard } from "../../hooks/useExercisePauseGuard";
import {
  getLevelWorkouts,
  type WorkoutLevel,
} from "../../lib/getLevelWorkouts";
import { getWorkoutDetailsForLevel } from "../../lib/getWorkoutDetails";
import { syncNextExerciseNotification } from "../../lib/nextExerciseNotification";
import { useAppStore } from "../../store/useAppStore";
import { colors } from "../../theme/colors";
import { font } from "../../theme/fonts";
import { LevelTabSwitch } from "./LevelTabSwitch";
import { ResumeProgressModal } from "./ResumeProgressModal";
import { WorkoutDetailSlider } from "./WorkoutDetailSlider";
import { WorkoutRowCard } from "./WorkoutRowCard";

type WorkoutsSectionProps = {
  firstCardAnchorRef?: (node: RNView | null) => void;
};

export function WorkoutsSection({ firstCardAnchorRef }: WorkoutsSectionProps = {}) {
  const { t } = useTranslation();
  const language = useAppStore((state) => state.language);
  const gender = useAppStore((state) => state.gender);
  const avatar = useAppStore((state) => state.avatar);
  const dayCompletedAt = useAppStore((state) => state.dayCompletedAt);
  const setProgressPaused = useAppStore((state) => state.setProgressPaused);
  const [activeLevel, setActiveLevel] = useState<WorkoutLevel>(1);
  const [sliderVisible, setSliderVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const {
    showResumeModal,
    dismissResumeModal,
    runIfProgressActive,
  } = useExercisePauseGuard();

  const workouts = useMemo(
    () => getLevelWorkouts(activeLevel, gender, avatar),
    [activeLevel, avatar, gender],
  );
  const workoutDetails = useMemo(
    () => getWorkoutDetailsForLevel(activeLevel, language, gender, avatar),
    [activeLevel, avatar, gender, language],
  );

  const openWorkout = (exerciseId: string) => {
    runIfProgressActive(() => {
      const index = workoutDetails.findIndex(
        (workout) => workout.id === exerciseId,
      );
      setSelectedIndex(index >= 0 ? index : 0);
      setSliderVisible(true);
    });
  };

  const closeSlider = () => {
    setSliderVisible(false);
  };

  return (
    <View style={styles.container}>
      <LevelTabSwitch
        activeLevel={activeLevel}
        onLevelChange={setActiveLevel}
      />

      {workouts.length > 0 ? (
        <View style={styles.list}>
          {workouts.map((workout, index) => (
            <WorkoutRowCard
              key={workout.id}
              workout={workout}
              onPress={() => openWorkout(workout.id)}
              coachAnchorRef={index === 0 ? firstCardAnchorRef : undefined}
            />
          ))}
        </View>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            {t("growth.workouts.emptyLevel", { level: activeLevel })}
          </Text>
        </View>
      )}

      <WorkoutDetailSlider
        visible={sliderVisible}
        workouts={workoutDetails}
        initialIndex={selectedIndex}
        onClose={closeSlider}
      />

      <ResumeProgressModal
        visible={showResumeModal}
        onClose={dismissResumeModal}
        onResume={() => {
          setProgressPaused(false);
          dismissResumeModal();
          void syncNextExerciseNotification(dayCompletedAt);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: "center",
    ...font("regular"),
  },
});
