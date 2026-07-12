import Svg, { Circle } from 'react-native-svg';

type LevelsProgressRingProps = {
  completed: number;
  total: number;
  paused: boolean;
};

const WIDTH = 192;
const HEIGHT = 168;
const CX = 96;
const CY = 84;
const STROKE = 22;
const RADIUS = 70;

export function LevelsProgressRing({ completed, total, paused }: LevelsProgressRingProps) {
  const progress = total > 0 ? Math.min(Math.max(completed / total, 0), 1) : 0;
  const circumference = 2 * Math.PI * RADIUS;
  const progressLength = circumference * progress;
  const showProgress = !paused && completed > 0;

  return (
    <Svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
      <Circle
        cx={CX}
        cy={CY}
        r={RADIUS}
        stroke="#9CA3AF"
        strokeWidth={STROKE}
        fill="none"
      />
      {showProgress ? (
        <Circle
          cx={CX}
          cy={CY}
          r={RADIUS}
          stroke="#005F99"
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${progressLength} ${circumference - progressLength}`}
          strokeLinecap="round"
          transform={`rotate(90 ${CX} ${CY})`}
        />
      ) : null}
    </Svg>
  );
}
