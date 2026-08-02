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
  /** Stick to widely-available Ionicons names (avoid missing-glyph crashes). */
  icon: 'person-outline' | 'ribbon-outline' | 'play-circle-outline' | 'stats-chart-outline' | 'trending-up-outline' | 'list-outline';
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
    icon: 'person-outline',
    titleKey: 'coach.avatarTitle',
    bodyKey: 'coach.avatarBody',
  },
  {
    id: 'home.progress',
    screen: 'home',
    preferPlacement: 'below',
    icon: 'ribbon-outline',
    titleKey: 'coach.homeProgressTitle',
    bodyKey: 'coach.homeProgressBody',
  },
  {
    id: 'home.session',
    screen: 'home',
    preferPlacement: 'above',
    icon: 'play-circle-outline',
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
    icon: 'trending-up-outline',
    titleKey: 'coach.progressTitle',
    bodyKey: 'coach.progressBody',
    growthTab: 'progress',
  },
  {
    id: 'growth.workouts',
    screen: 'growth',
    preferPlacement: 'below',
    icon: 'list-outline',
    titleKey: 'coach.workoutsTitle',
    bodyKey: 'coach.workoutsBody',
    growthTab: 'workouts',
  },
];

export function coachStepIndex(id: CoachTourStepId): number {
  return COACH_TOUR_STEPS.findIndex((s) => s.id === id);
}
