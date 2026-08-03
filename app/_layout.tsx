import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { Colors } from '@/constants/theme';
import { OnboardingProvider, useOnboarding } from '@/state/onboarding-context';
import { ShoppingListProvider } from '@/state/shopping-list-context';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.forest,
    background: Colors.canvas,
    card: Colors.surface,
    text: Colors.charcoal,
    border: Colors.border,
    notification: Colors.forest,
  },
};

export const unstable_settings = {
  anchor: '(app)',
};

function OnboardingHost() {
  const router = useRouter();
  const { dismissOnboarding, onboardingVisible } = useOnboarding();

  return (
    <OnboardingFlow
      onDismiss={dismissOnboarding}
      onStartList={() => router.replace('/new-list')}
      visible={onboardingVisible}
    />
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <ShoppingListProvider>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.canvas } }}>
            <Stack.Screen name="(app)" options={{ headerShown: false }} />
          </Stack>
          <OnboardingHost />
          <StatusBar style="dark" />
        </ThemeProvider>
      </ShoppingListProvider>
    </OnboardingProvider>
  );
}
