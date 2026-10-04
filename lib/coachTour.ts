export type CoachTourStepId =
  | 'home.avatar'
  | 'home.progress'
  | 'home.session'
  | 'home.growthTab'
  | 'growth.progress'
  | 'growth.pauseProgress'
  | 'growth.workouts'
  | 'growth.workoutCard'
  | 'home.settingsTab'
  | 'settings.menu';

export type CoachTourScreen = 'home' | 'growth' | 'settings';

export type CoachSpotlightShape = 'circle' | 'pill' | 'rounded';

export type CoachTourStep = {
  id: CoachTourStepId;
  screen: CoachTourScreen;
  preferPlacement: 'below' | 'above';
  spotlight: CoachSpotlightShape;
  pad: number;
  icon:
    | 'person-outline'
    | 'ribbon-outline'
    | 'play-circle-outline'
    | 'play-circle'
    | 'stats-chart-outline'
    | 'stats-chart'
    | 'trending-up-outline'
    | 'pause-circle-outline'
    | 'list-outline'
    | 'walk'
    | 'document-text-outline'
    | 'settings-outline'
    | 'settings';
  titleKey: string;
  bodyKey: string;
  growthTab?: 'progress' | 'workouts';
};

/** Same beats as the walkthrough reference: exercise, levels, workouts, profile. */
export const COACH_TOUR_STEPS: CoachTourStep[] = [
  {
    id: 'home.session',
    screen: 'home',
    preferPlacement: 'above',
    spotlight: 'rounded',
    pad: 8,
    icon: 'play-circle',
    titleKey: 'coach.sessionTitle',
    bodyKey: 'coach.sessionBody',
  },
  {
    id: 'growth.progress',
    screen: 'growth',
    preferPlacement: 'below',
    spotlight: 'rounded',
    pad: 8,
    icon: 'stats-chart',
    titleKey: 'coach.progressTitle',
    bodyKey: 'coach.progressBody',
    growthTab: 'progress',
  },
  {
    id: 'growth.workouts',
    screen: 'growth',
    preferPlacement: 'below',
    spotlight: 'pill',
    pad: 6,
    icon: 'walk',
    titleKey: 'coach.workoutsTitle',
    bodyKey: 'coach.workoutsBody',
    growthTab: 'workouts',
  },
  {
    id: 'settings.menu',
    screen: 'settings',
    preferPlacement: 'below',
    spotlight: 'rounded',
    pad: 6,
    icon: 'settings',
    titleKey: 'coach.settingsMenuTitle',
    bodyKey: 'coach.settingsMenuBody',
  },
];

/** Step index used while the closing “You’re all set” card is on screen. */
export const COACH_TOUR_FINALE_STEP = COACH_TOUR_STEPS.length;

/** How long each spotlight stays before the tour moves on by itself. */
export const COACH_TOUR_BEAT_MS = 5200;

/** How long the closing card stays before the app continues on its own. */
export const COACH_TOUR_FINALE_MS = 4200;

export function coachStepIndex(id: CoachTourStepId): number {
  return COACH_TOUR_STEPS.findIndex((s) => s.id === id);
}
