import { TextStyle } from 'react-native';

import { font } from './fonts';

export const typography = {
  oncosmartTitle: {
    fontSize: 14,
    ...font('bold'),
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  collegeName: {
    fontSize: 18,
    ...font('bold'),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  collegeSubtitle: {
    fontSize: 10,
    ...font('medium'),
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  } satisfies TextStyle,
  collegeTag: {
    fontSize: 9,
    ...font('medium'),
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  } satisfies TextStyle,
} as const;
