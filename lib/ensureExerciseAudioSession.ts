import { setAudioModeAsync, setIsAudioActiveAsync } from 'expo-audio';

let audioSessionReady: Promise<void> | null = null;

/**
 * Activate the OS audio session so guided exercise videos play with sound
 * (including when the iOS silent switch is on).
 */
export async function ensureExerciseAudioSession(): Promise<void> {
  if (!audioSessionReady) {
    audioSessionReady = (async () => {
      await setIsAudioActiveAsync(true);
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: false,
        interruptionMode: 'doNotMix',
        interruptionModeAndroid: 'doNotMix',
        shouldRouteThroughEarpiece: false,
      });
    })().catch((error) => {
      audioSessionReady = null;
      if (__DEV__) {
        console.warn('[Audio] Failed to configure exercise audio session', error);
      }
    });
  }

  return audioSessionReady ?? Promise.resolve();
}
