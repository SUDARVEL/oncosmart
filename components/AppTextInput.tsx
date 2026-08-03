import { forwardRef } from 'react';
import {
  TextInput,
  type TextInputProps,
  type TextStyle,
  type StyleProp,
} from 'react-native';

import { colors } from '../theme/colors';
import { textFieldStyle } from '../theme/typography';

type Props = TextInputProps & {
  style?: StyleProp<TextStyle>;
};

/**
 * Text field with Tamil-safe vertical metrics (no clipped placeholders).
 */
export const AppTextInput = forwardRef<TextInput, Props>(function AppTextInput(
  { style, placeholderTextColor = colors.textPlaceholder, ...rest },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      {...rest}
      placeholderTextColor={placeholderTextColor}
      style={[textFieldStyle, style]}
    />
  );
});
