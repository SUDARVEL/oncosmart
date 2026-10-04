import { Redirect } from 'expo-router';

/** Older settings entry. The questions now open on the real first onboarding screen. */
export default function OnboardingAnswersRedirect() {
  return <Redirect href="/onboarding/username?from=review" />;
}
