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
  | 'settings.menu'
  | 'nav.tabs';

export type CoachTourScreen = 'home' | 'growth' | 'settings';

export type CoachSpotlightShape = 'circle' | 'pill' | 'rounded';

export type CoachTourGesture = 'none' | 'tap' | 'swipe';

export type CoachTourStep = {
  id: CoachTourStepId;
  screen: CoachTourScreen;
  preferPlacement: 'below' | 'above';
  spotlight: CoachSpotlightShape;
  pad: number;
  /** How long this beat stays before the tour moves on by itself. */
  durationMs: number;
  gesture: CoachTourGesture;
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

/**
 * First-run tour, about 17 seconds, played on the real screens.
 * Welcome → start session → progress → bottom navigation → all set.
 */
export const COACH_TOUR_STEPS: CoachTourStep[] = [
  {
    id: 'home.progress',
    screen: 'home',
    preferPlacement: 'below',
    spotlight: 'rounded',
    pad: 12,
    durationMs: 3000,
    gesture: 'none',
    icon: 'ribbon-outline',
    titleKey: 'coach.tourWelcomeTitle',
    bodyKey: 'coach.tourWelcomeBody',
  },
  {
    id: 'home.session',
    screen: 'home',
    preferPlacement: 'above',
    spotlight: 'rounded',
    pad: 8,
    durationMs: 3000,
    gesture: 'tap',
    icon: 'play-circle',
    titleKey: 'coach.tourStartTitle',
    bodyKey: 'coach.tourStartBody',
  },
  {
    id: 'growth.progress',
    screen: 'growth',
    preferPlacement: 'above',
    spotlight: 'rounded',
    pad: 8,
    durationMs: 4000,
    gesture: 'swipe',
    icon: 'stats-chart',
    titleKey: 'coach.tourProgressTitle',
    bodyKey: 'coach.tourProgressBody',
    growthTab: 'progress',
  },
  {
    id: 'nav.tabs',
    screen: 'growth',
    preferPlacement: 'above',
    spotlight: 'rounded',
    pad: 6,
    durationMs: 4000,
    gesture: 'tap',
    icon: 'walk',
    titleKey: 'coach.tourNavTitle',
    bodyKey: 'coach.tourNavBody',
  },
];

/** Step index used while the closing card is on the home screen. */
export const COACH_TOUR_FINALE_STEP = COACH_TOUR_STEPS.length;

/** Closing card, then the normal app. */
export const COACH_TOUR_FINALE_MS = 3000;

export function coachStepIndex(id: CoachTourStepId): number {
  return COACH_TOUR_STEPS.findIndex((s) => s.id === id);
}
