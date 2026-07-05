import type { SessionDisplayLabel } from './getDay1Session';

export function formatExerciseDurationDisplay(seconds: number): {
  displayValue: string;
  displayLabel: SessionDisplayLabel | 'SECS';
} {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return { displayValue: '00', displayLabel: 'SECS' };
  }

  if (seconds >= 60) {
    const minutes = Math.ceil(seconds / 60);
    return {
      displayValue: String(minutes).padStart(2, '0'),
      displayLabel: 'MINS',
    };
  }

  return {
    displayValue: String(Math.round(seconds)),
    displayLabel: 'SECS',
  };
}
