import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';

import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { AppText } from '@/components/ui/app-text';
import { MascotIllustration } from '@/components/ui/mascot-illustration';
import { Colors } from '@/constants/theme';
import { OnboardingProvider, useOnboarding } from '@/state/onboarding-context';
import { ShoppingListProvider, useShoppingList } from '@/state/shopping-list-context';

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

function AppContent() {
  const { storageReady: onboardingReady } = useOnboarding();
  const { storageReady: shoppingReady } = useShoppingList();
  const appReady = onboardingReady && shoppingReady;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: Colors.canvas } }}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
      {appReady ? <OnboardingHost /> : <StorageLoadingOverlay />}
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

function StorageLoadingOverlay() {
  return (
    <View accessibilityLabel="Loading your saved lists" accessibilityRole="progressbar" style={styles.loadingOverlay}>
      <MascotIllustration expression="loading" size={116} />
      <AppText style={styles.loadingTitle} variant="heading">Getting your lists ready</AppText>
      <AppText tone="muted" variant="caption">Just a moment</AppText>
    </View>
  );
}

export default function RootLayout() {
  return (
    <OnboardingProvider>
      <ShoppingListProvider>
        <AppContent />
      </ShoppingListProvider>
    </OnboardingProvider>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    justifyContent: 'center',
    padding: 24,
    zIndex: 100,
  },
  loadingTitle: {
    marginBottom: 4,
    marginTop: 16,
    textAlign: 'center',
  },
});
