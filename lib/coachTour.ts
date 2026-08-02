export type CoachTourStepId =
  | 'home.avatar'
  | 'home.progress'
  | 'home.session'
  | 'home.growthTab'
  | 'growth.progress'
  | 'growth.workouts';

export type CoachTourScreen = 'home' | 'growth';

export type CoachTourStep = {
  id: CoachTourStepId;
  screen: CoachTourScreen;
  /** Preferred caret direction relative to the tooltip card. */
  preferPlacement: 'below' | 'above';
  icon: 'person-circle-outline' | 'trophy-outline' | 'fitness-outline' | 'stats-chart-outline' | 'pulse-outline' | 'barbell-outline';
  titleKey: string;
  bodyKey: string;
  /** When entering this step on Growth, force the progress/workouts pill. */
  growthTab?: 'progress' | 'workouts';
};

export const COACH_TOUR_STEPS: CoachTourStep[] = [
  {
    id: 'home.avatar',
    screen: 'home',
    preferPlacement: 'below',
    icon: 'person-circle-outline',
    titleKey: 'coach.avatarTitle',
    bodyKey: 'coach.avatarBody',
  },
  {
    id: 'home.progress',
    screen: 'home',
    preferPlacement: 'below',
    icon: 'trophy-outline',
    titleKey: 'coach.homeProgressTitle',
    bodyKey: 'coach.homeProgressBody',
  },
  {
    id: 'home.session',
    screen: 'home',
    preferPlacement: 'above',
    icon: 'fitness-outline',
    titleKey: 'coach.sessionTitle',
    bodyKey: 'coach.sessionBody',
  },
  {
    id: 'home.growthTab',
    screen: 'home',
    preferPlacement: 'above',
    icon: 'stats-chart-outline',
    titleKey: 'coach.growthTabTitle',
    bodyKey: 'coach.growthTabBody',
  },
  {
    id: 'growth.progress',
    screen: 'growth',
    preferPlacement: 'below',
    icon: 'pulse-outline',
    titleKey: 'coach.progressTitle',
    bodyKey: 'coach.progressBody',
    growthTab: 'progress',
  },
  {
    id: 'growth.workouts',
    screen: 'growth',
    preferPlacement: 'below',
    icon: 'barbell-outline',
    titleKey: 'coach.workoutsTitle',
    bodyKey: 'coach.workoutsBody',
    growthTab: 'workouts',
  },
];

export function coachStepIndex(id: CoachTourStepId): number {
  return COACH_TOUR_STEPS.findIndex((s) => s.id === id);
}
