import { Linking } from 'react-native';

const SUPPORT_WHATSAPP_NUMBER = '919884296898';

export function openWhatsAppSupport() {
  const url = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
  return Linking.openURL(url);
}

/** Forgot password → admin WhatsApp with a ready-made reset request. */
export function openWhatsAppForgotPassword(username?: string) {
  const who = username?.trim() ? username.trim() : 'my account';
  const text = encodeURIComponent(
    `Hi, I forgot my ONCOSMART password. Username: ${who}. Please reset it.`,
  );
  const url = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}?text=${text}`;
  return Linking.openURL(url);
}
