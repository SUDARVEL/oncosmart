import { CoachMarkVideoModal } from './CoachMarkVideoModal';
import { useAppStore } from '../../store/useAppStore';

/** Shows the walkthrough video whenever the coach tour is active. */
export function CoachMarkVideoGate() {
  const coachTourSeen = useAppStore((state) => state.coachTourSeen === true);
  const coachTourStep = useAppStore((state) => state.coachTourStep);
  const setCoachTourSeen = useAppStore((state) => state.setCoachTourSeen);
  const setCoachTourStep = useAppStore((state) => state.setCoachTourStep);

  const visible = !coachTourSeen && coachTourStep != null;
  if (!visible) return null;

  return (
    <CoachMarkVideoModal
      onClose={() => {
        setCoachTourSeen(true);
        setCoachTourStep(null);
      }}
    />
  );
}
