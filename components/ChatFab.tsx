import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { openWhatsAppSupport } from '../lib/openWhatsAppSupport';
import { colors } from '../theme/colors';
import { PressableScale } from './PressableScale';

type Props = {
  bottom?: number;
  accessibilityLabel?: string;
};

/** Shared WhatsApp chat FAB — filled bubble icon. */
export function ChatFab({
  bottom = 96,
  accessibilityLabel = 'Chat',
}: Props) {
  return (
    <PressableScale
      style={[styles.fab, { bottom }]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={openWhatsAppSupport}
      pressedScale={0.94}
    >
      <Ionicons name="chatbubble" size={22} color={colors.buttonPrimary} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.buttonPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 20,
  },
});
