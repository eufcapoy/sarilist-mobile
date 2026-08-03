import Feather from '@expo/vector-icons/Feather';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { WalkthroughTarget } from '@/components/onboarding/walkthrough-target';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';

type FloatingActionDockProps = {
  onHomePress: () => void;
  onCreatePress: () => void;
  onScanPress: () => void;
};

function triggerHaptic() {
  void Haptics.selectionAsync();
}

export function FloatingActionDock({
  onHomePress,
  onCreatePress,
  onScanPress,
}: FloatingActionDockProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.positioner, { paddingBottom: Math.max(insets.bottom, Spacing[3]) }]}>
      <View style={styles.dockShell}>
        <View pointerEvents="none" style={styles.backgroundClip}>
          {Platform.OS === 'android' ? (
            <View style={[StyleSheet.absoluteFill, styles.androidFrostedFallback]} />
          ) : (
            <BlurView
              blurReductionFactor={1.5}
              intensity={62}
              style={StyleSheet.absoluteFill}
              tint="light"
            />
          )}
          <LinearGradient
            colors={[
              'rgba(255, 255, 255, 0.58)',
              'rgba(247, 247, 244, 0.48)',
              'rgba(220, 223, 220, 0.56)',
            ]}
            end={{ x: 1, y: 1 }}
            locations={[0, 0.5, 1]}
            start={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <View accessibilityLabel="Main navigation" style={styles.dockContent}>
          <Pressable
            accessibilityLabel="Home"
            accessibilityRole="tab"
            accessibilityState={{ selected: true }}
            onPress={() => {
              triggerHaptic();
              onHomePress();
            }}
            style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
            <View style={styles.activeIcon}>
              <Feather color={Colors.forest} name="home" size={20} />
            </View>
            <AppText style={styles.navLabelActive} tone="accent" variant="caption">
              Home
            </AppText>
          </Pressable>

          <View style={styles.actionSlot}>
            <WalkthroughTarget id="home-new-list-nav" shape="circle" style={styles.createTarget}>
              <Pressable
                accessibilityLabel="Create new list"
                accessibilityRole="button"
                onPress={() => {
                  triggerHaptic();
                  onCreatePress();
                }}
                style={({ pressed }) => [styles.createButton, pressed && styles.createPressed]}>
                <Feather color={Colors.cream} name="plus" size={27} />
              </Pressable>
            </WalkthroughTarget>
            <AppText style={styles.createLabel} variant="caption">
              New list
            </AppText>
          </View>

          <Pressable
            accessibilityHint="Opens the camera and photo options for scanning a list"
            accessibilityLabel="Scan a list"
            accessibilityRole="button"
            onPress={() => {
              triggerHaptic();
              onScanPress();
            }}
            style={({ pressed }) => [styles.navItem, pressed && styles.pressed]}>
            <View style={styles.scanIconWrap}>
              <Feather color={Colors.textMuted} name="camera" size={20} />
            </View>
            <AppText style={styles.navLabel} tone="muted" variant="caption">
              Scan
            </AppText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  positioner: {
    alignItems: 'center',
    bottom: 0,
    left: 0,
    paddingHorizontal: Spacing[5],
    position: 'absolute',
    right: 0,
  },
  dockShell: {
    borderColor: '#BFC5C0',
    borderRadius: Radii.xl,
    borderWidth: 1,
    height: 72,
    maxWidth: 480,
    width: '100%',
    elevation: 10,
    shadowColor: '#111411',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
  },
  backgroundClip: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    borderRadius: Radii.xl - 1,
    overflow: 'hidden',
  },
  androidFrostedFallback: {
    backgroundColor: 'rgba(247, 247, 244, 0.92)',
  },
  dockContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: Spacing[2],
  },
  navItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
    justifyContent: 'center',
    minHeight: 56,
  },
  activeIcon: {
    alignItems: 'center',
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 42,
  },
  scanIconWrap: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 42,
  },
  navLabel: {
    fontSize: 11,
    lineHeight: 14,
  },
  navLabelActive: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
  },
  actionSlot: {
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    paddingTop: 5,
    width: 104,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: Colors.forest,
    borderColor: Colors.surface,
    borderRadius: Radii.pill,
    borderWidth: 4,
    height: 58,
    justifyContent: 'center',
    width: 58,
    ...Shadows.soft,
  },
  createTarget: {
    borderRadius: Radii.pill,
    marginTop: -24,
  },
  createLabel: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 14,
    marginTop: 2,
  },
  pressed: {
    opacity: 0.62,
  },
  createPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.94 }],
  },
});
