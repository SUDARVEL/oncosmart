import { Stack } from 'expo-router';

export default function ParqLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="part2" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
