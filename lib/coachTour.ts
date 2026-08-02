export type CoachTourStepId =
  | 'home.avatar'
  | 'home.progress'
  | 'home.session'
  | 'home.growthTab'
  | 'growth.progress'
  | 'growth.workouts'
  | 'home.settingsTab'
  | 'settings.menu';

export type CoachTourScreen = 'home' | 'growth' | 'settings';

export type CoachSpotlightShape = 'circle' | 'pill' | 'rounded';

export type CoachTourStep = {
  id: CoachTourStepId;
  screen: CoachTourScreen;
  preferPlacement: 'below' | 'above';
  spotlight: CoachSpotlightShape;
  /** Extra padding around the measured target (px). */
  pad: number;
  icon:
    | 'person-outline'
    | 'ribbon-outline'
    | 'play-circle-outline'
    | 'stats-chart-outline'
    | 'trending-up-outline'
    | 'list-outline'
    | 'settings-outline';
  titleKey: string;
  bodyKey: string;
  growthTab?: 'progress' | 'workouts';
};

export const COACH_TOUR_STEPS: CoachTourStep[] = [
  {
    id: 'home.avatar',
    screen: 'home',
    preferPlacement: 'below',
    spotlight: 'circle',
    pad: 4,
    icon: 'person-outline',
    titleKey: 'coach.avatarTitle',
    bodyKey: 'coach.avatarBody',
  },
  {
    id: 'home.progress',
    screen: 'home',
    preferPlacement: 'below',
    spotlight: 'rounded',
    pad: 6,
    icon: 'ribbon-outline',
    titleKey: 'coach.homeProgressTitle',
    bodyKey: 'coach.homeProgressBody',
  },
  {
    id: 'home.session',
    screen: 'home',
    preferPlacement: 'above',
    spotlight: 'rounded',
    pad: 6,
    icon: 'play-circle-outline',
    titleKey: 'coach.sessionTitle',
    bodyKey: 'coach.sessionBody',
  },
  {
    id: 'home.growthTab',
    screen: 'home',
    preferPlacement: 'above',
    spotlight: 'pill',
    pad: 4,
    icon: 'stats-chart-outline',
    titleKey: 'coach.growthTabTitle',
    bodyKey: 'coach.growthTabBody',
  },
  {
    id: 'growth.progress',
    screen: 'growth',
    preferPlacement: 'below',
    spotlight: 'pill',
    pad: 4,
    icon: 'trending-up-outline',
    titleKey: 'coach.progressTitle',
    bodyKey: 'coach.progressBody',
    growthTab: 'progress',
  },
  {
    id: 'growth.workouts',
    screen: 'growth',
    preferPlacement: 'below',
    spotlight: 'pill',
    pad: 4,
    icon: 'list-outline',
    titleKey: 'coach.workoutsTitle',
    bodyKey: 'coach.workoutsBody',
    growthTab: 'workouts',
  },
  {
    id: 'home.settingsTab',
    screen: 'home',
    preferPlacement: 'above',
    spotlight: 'pill',
    pad: 4,
    icon: 'settings-outline',
    titleKey: 'coach.settingsTabTitle',
    bodyKey: 'coach.settingsTabBody',
  },
  {
    id: 'settings.menu',
    screen: 'settings',
    preferPlacement: 'below',
    spotlight: 'rounded',
    pad: 8,
    icon: 'settings-outline',
    titleKey: 'coach.settingsMenuTitle',
    bodyKey: 'coach.settingsMenuBody',
  },
];

export function coachStepIndex(id: CoachTourStepId): number {
  return COACH_TOUR_STEPS.findIndex((s) => s.id === id);
}
