import { Linking } from 'react-native';

const SUPPORT_WHATSAPP_NUMBER = '919884296898';

export function openWhatsAppSupport() {
  const url = `https://wa.me/${SUPPORT_WHATSAPP_NUMBER}`;
  return Linking.openURL(url);
}
