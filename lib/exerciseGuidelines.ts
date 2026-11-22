import type { ImageSource } from 'expo-image';

import type { CancerTypeSlug } from './cancerPathway';

export type GuidelineGender = 'female' | 'male';

type GenderedImage = Record<GuidelineGender, ImageSource>;

function shared(source: ImageSource): GenderedImage {
  return { female: source, male: source };
}

/** Key points shown on the General Instructions screen, in display order. */
export const GENERAL_INSTRUCTIONS: readonly { key: string; image: GenderedImage }[] = [
  {
    key: 'timingClothing',
    image: shared(require('../assets/guidelines/shared/g-timing-clothing.jpg')),
  },
  {
    key: 'fever',
    image: shared(require('../assets/guidelines/shared/g-fever.jpg')),
  },
  {
    key: 'breathlessness',
    image: {
      female: require('../assets/guidelines/female/g-breathless.jpg'),
      male: require('../assets/guidelines/male/g-breathless.jpg'),
    },
  },
  {
    key: 'pain',
    image: {
      female: require('../assets/guidelines/female/g-pain.jpg'),
      male: require('../assets/guidelines/male/g-pain.jpg'),
    },
  },
  {
    key: 'dizziness',
    image: {
      female: require('../assets/guidelines/female/g-dizzy.jpg'),
      male: require('../assets/guidelines/male/g-dizzy.jpg'),
    },
  },
  {
    key: 'heartChest',
    image: shared(require('../assets/guidelines/shared/g-heart-chest.jpg')),
  },
  {
    key: 'informTeam',
    image: {
      female: require('../assets/guidelines/female/g-inform-team.jpg'),
      male: require('../assets/guidelines/male/g-inform-team.jpg'),
    },
  },
];

const DO_DONT_IMAGES = {
  followPlan: {
    female: require('../assets/guidelines/female/follow-plan.jpg'),
    male: require('../assets/guidelines/male/follow-plan.jpg'),
  },
  dontOverdo: {
    female: require('../assets/guidelines/female/dont-overdo.jpg'),
    male: require('../assets/guidelines/male/dont-overdo.jpg'),
  },
  breastCheckArm: {
    female: require('../assets/guidelines/female/breast-check-arm.jpg'),
    male: require('../assets/guidelines/male/breast-check-arm.jpg'),
  },
  breastSleeve: {
    female: require('../assets/guidelines/female/breast-sleeve.jpg'),
    male: require('../assets/guidelines/male/breast-sleeve.jpg'),
  },
  breastTellDoctor: {
    female: require('../assets/guidelines/female/breast-tell-doctor.jpg'),
    male: require('../assets/guidelines/male/breast-tell-doctor.jpg'),
  },
  breastNoHeavy: {
    female: require('../assets/guidelines/female/breast-no-heavy.jpg'),
    male: require('../assets/guidelines/male/breast-no-heavy.jpg'),
  },
  breastNoInjection: {
    female: require('../assets/guidelines/female/breast-no-injection.jpg'),
    male: require('../assets/guidelines/male/breast-no-injection.jpg'),
  },
  breastNoHeatIce: shared(require('../assets/guidelines/shared/breast-no-heat-ice.jpg')),
  thoraxTellPain: {
    female: require('../assets/guidelines/female/thorax-tell-pain.jpg'),
    male: require('../assets/guidelines/male/thorax-tell-pain.jpg'),
  },
  thoraxCoughSheet: {
    female: require('../assets/guidelines/female/thorax-cough-sheet.jpg'),
    male: require('../assets/guidelines/male/thorax-cough-sheet.jpg'),
  },
  thoraxWound: {
    female: require('../assets/guidelines/female/thorax-wound.jpg'),
    male: require('../assets/guidelines/male/thorax-wound.jpg'),
  },
  thoraxCoughBlood: {
    female: require('../assets/guidelines/female/thorax-cough-blood.jpg'),
    male: require('../assets/guidelines/male/thorax-cough-blood.jpg'),
  },
  thoraxNoPush: {
    female: require('../assets/guidelines/female/thorax-no-push.jpg'),
    male: require('../assets/guidelines/male/thorax-no-push.jpg'),
  },
  thoraxNoSmoke: {
    female: require('../assets/guidelines/female/thorax-no-smoke.jpg'),
    male: require('../assets/guidelines/male/thorax-no-smoke.jpg'),
  },
  abdomenStoma: {
    female: require('../assets/guidelines/female/abdomen-stoma.jpg'),
    male: require('../assets/guidelines/male/abdomen-stoma.jpg'),
  },
  abdomenCoughSheet: {
    female: require('../assets/guidelines/female/abdomen-cough-sheet.jpg'),
    male: require('../assets/guidelines/male/abdomen-cough-sheet.jpg'),
  },
  abdomenBulge: {
    female: require('../assets/guidelines/female/abdomen-bulge.jpg'),
    male: require('../assets/guidelines/male/abdomen-bulge.jpg'),
  },
  abdomenNoBreathHold: {
    female: require('../assets/guidelines/female/abdomen-no-breath-hold.jpg'),
    male: require('../assets/guidelines/male/abdomen-no-breath-hold.jpg'),
  },
  abdomenNoLift: {
    female: require('../assets/guidelines/female/abdomen-no-lift.jpg'),
    male: require('../assets/guidelines/male/abdomen-no-lift.jpg'),
  },
  abdomenNoContact: shared(require('../assets/guidelines/shared/abdomen-no-contact.jpg')),
  hnSwelling: {
    female: require('../assets/guidelines/female/hn-swelling.jpg'),
    male: require('../assets/guidelines/male/hn-swelling.jpg'),
  },
  hnSwallow: {
    female: require('../assets/guidelines/female/hn-swallow.jpg'),
    male: require('../assets/guidelines/male/hn-swallow.jpg'),
  },
  hnLooseClothes: {
    female: require('../assets/guidelines/female/hn-loose-clothes.jpg'),
    male: require('../assets/guidelines/male/hn-loose-clothes.jpg'),
  },
  hnNoOverhead: {
    female: require('../assets/guidelines/female/hn-no-overhead.jpg'),
    male: require('../assets/guidelines/male/hn-no-overhead.jpg'),
  },
  hnNoSun: {
    female: require('../assets/guidelines/female/hn-no-sun.jpg'),
    male: require('../assets/guidelines/male/hn-no-sun.jpg'),
  },
  hnNoScratch: {
    female: require('../assets/guidelines/female/hn-no-scratch.jpg'),
    male: require('../assets/guidelines/male/hn-no-scratch.jpg'),
  },
} satisfies Record<string, GenderedImage>;

export type DoDontKey = keyof typeof DO_DONT_IMAGES;

/**
 * Do's and Don'ts per cancer type, in the order of the clinical sheet.
 * Thorax "cough up blood" sits in the sheet's Don'ts column, but it tells the
 * patient to act, so it is listed with the Do's to avoid a red cross on it.
 */
export const DOS_AND_DONTS: Record<CancerTypeSlug, { dos: DoDontKey[]; donts: DoDontKey[] }> = {
  breast: {
    dos: ['followPlan', 'breastCheckArm', 'breastSleeve', 'breastTellDoctor'],
    donts: ['dontOverdo', 'breastNoHeavy', 'breastNoInjection', 'breastNoHeatIce'],
  },
  thorax: {
    dos: ['followPlan', 'thoraxTellPain', 'thoraxCoughSheet', 'thoraxCoughBlood'],
    donts: ['dontOverdo', 'thoraxNoPush', 'thoraxNoSmoke'],
  },
  abdomen: {
    dos: ['followPlan', 'abdomenStoma', 'abdomenCoughSheet', 'abdomenBulge'],
    donts: ['dontOverdo', 'abdomenNoBreathHold', 'abdomenNoLift', 'abdomenNoContact'],
  },
  'head-neck': {
    dos: ['followPlan', 'hnSwelling', 'hnSwallow', 'hnLooseClothes'],
    donts: ['dontOverdo', 'hnNoOverhead', 'hnNoSun', 'hnNoScratch'],
  },
};

export function getDoDontImage(key: DoDontKey, gender: GuidelineGender): ImageSource {
  return DO_DONT_IMAGES[key][gender];
}
