import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

/** Router and oxygen cylinder shown on the no-internet screen. */
export function OfflineIllustration() {
  return (
    <Svg width={280} height={168} viewBox="0 0 280 168" accessibilityElementsHidden>
      <Ellipse cx="140" cy="152" rx="112" ry="12" fill="#E7F4FB" />

      <Rect x="16" y="96" width="158" height="12" rx="3" fill="#D5DDE6" />
      <Rect x="28" y="108" width="7" height="34" rx="1.5" fill="#8E99A4" />
      <Rect x="155" y="108" width="7" height="34" rx="1.5" fill="#8E99A4" />
      <Rect x="35" y="124" width="120" height="5" rx="1.5" fill="#C5CED6" />

      <Path
        d="M100 40 A 18 18 0 0 1 136 40"
        stroke="#D0D7DE"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M90 30 A 28 28 0 0 1 146 30"
        stroke="#D0D7DE"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M80 20 A 38 38 0 0 1 156 20"
        stroke="#D0D7DE"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path d="M86 12 L132 54" stroke="#E23B7A" strokeWidth="4" strokeLinecap="round" />

      <Rect x="74" y="52" width="3.5" height="20" rx="1.5" fill="#1E2A4A" />
      <Rect x="132" y="52" width="3.5" height="20" rx="1.5" fill="#1E2A4A" />
      <Rect x="58" y="68" width="94" height="32" rx="9" fill="#1E2A4A" />
      <Circle cx="80" cy="84" r="4.2" fill="#F2C14E" />
      <Circle cx="96" cy="84" r="4.2" fill="#3DDC97" />
      <Circle cx="112" cy="84" r="4.2" fill="#E25B5B" />

      <Rect x="198" y="48" width="36" height="90" rx="8" fill="#F6D0DC" />
      <Rect x="206" y="56" width="8" height="74" rx="4" fill="#FFF6F8" />
      <Ellipse cx="216" cy="48" rx="18" ry="7" fill="#F0C2D0" />
      <Rect x="211" y="30" width="10" height="16" rx="2" fill="#C5CED6" />
      <Circle cx="216" cy="28" r="5.5" fill="#B7C2CC" />
      <Rect x="190" y="134" width="52" height="4" rx="2" fill="#2E6C96" />
      <Circle cx="198" cy="140" r="7" fill="#2E6C96" />
      <Circle cx="234" cy="140" r="7" fill="#2E6C96" />
      <Circle cx="198" cy="140" r="2.6" fill="#D6E8F4" />
      <Circle cx="234" cy="140" r="2.6" fill="#D6E8F4" />
    </Svg>
  );
}
