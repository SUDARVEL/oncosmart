import { Redirect } from 'expo-router';

import { useAppStore } from '../../store/useAppStore';

/**
 * Language is chosen before Login. Post-login onboarding starts at username.
 * If language is somehow missing, send the user back to the pre-login gate.
 */
export default function OnboardingEntry() {
  const language = useAppStore((state) => state.language);
  if (!language) {
    return <Redirect href="/language" />;
  }
  return <Redirect href="/onboarding/username" />;
}
