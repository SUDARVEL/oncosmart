import type { ImageSource } from 'expo-image';

/** Figma-exported preview thumbnails for Day 1 stretch exercises. */
export const DAY1_THUMBNAILS: Partial<Record<string, ImageSource>> = {
  'hamstring-stretch': require('../../assets/exercise-day1/cfd4394157a26cc21bb4ea79c83afc8c14e610e2.png'),
  'quadriceps-stretch-right': require('../../assets/exercise-day1/cfff2aab3ebfd40624de881b415d98c7088fc284.png'),
  'quadriceps-stretch-left': require('../../assets/exercise-day1/baaf4399ae5ac37785c1c2dcc2c0cd21834eb75e.png'),
  'calf-stretch-right': require('../../assets/exercise-day1/c2d8df2a1a8e8b92625ad193f024044c98a34740.png'),
  'calf-stretch-left': require('../../assets/exercise-day1/811aed4cf59198df4c515a025a64cbde159650ae.png'),
  'triceps-stretch-right': require('../../assets/exercise-day1/719cba09074b61f6a636d17d0f41e7dca66b5501.png'),
  'triceps-stretch-left': require('../../assets/exercise-day1/ca2a9ee6cca6976ab2eff930b2d42b3c6d722323.png'),
  'chest-stretch': require('../../assets/exercise-day1/899fa08b6455f67f4ece51219368919cf26a89a3.png'),
  'neck-stretch-right': require('../../assets/exercise-day1/71b1117feb749929882983012df33f99697488f8.png'),
  'neck-stretch-left': require('../../assets/exercise-day1/16b8421baff9ab6bcf6e1f2715e2a1f3601629d3.png'),
};

export function getDay1Thumbnail(exerciseId: string): ImageSource | null {
  return DAY1_THUMBNAILS[exerciseId] ?? null;
}
