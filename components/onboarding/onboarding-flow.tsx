import Feather from '@expo/vector-icons/Feather';
import { useRouter, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Mask, Rect } from 'react-native-svg';

import { AppText } from '@/components/ui/app-text';
import { MascotIllustration, type MascotExpression } from '@/components/ui/mascot-illustration';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import {
  useOnboarding,
  type WalkthroughTargetId,
  type WalkthroughTargetLayout,
} from '@/state/onboarding-context';

type WalkthroughStep = {
  title: string;
  message: string;
  expression: MascotExpression;
  route: Href;
  targets?: WalkthroughTargetId[];
};

const steps: WalkthroughStep[] = [
  {
    title: 'Let’s walk through SariList',
    message:
      'I’ll guide you through making a list, scanning a note, shopping, and finding your finished trips. Nothing you do in this tour will change your saved lists.',
    expression: 'empty',
    route: '/',
  },
  {
    title: 'Start a fresh list',
    message: 'Use either highlighted button to start a new list.',
    expression: 'empty',
    route: '/',
    targets: ['home-create', 'home-new-list-nav'],
  },
  {
    title: 'Name the trip and choose a budget',
    message: 'Choose if you want a spending limit. If you do, enter the amount here.',
    expression: 'loading',
    route: '/new-list',
    targets: ['new-list-basics'],
  },
  {
    title: 'Add your items',
    message: 'Type an item above. It appears below, where you can set the amount and how it is sold.',
    expression: 'success',
    route: '/new-list',
    targets: ['new-list-items'],
  },
  {
    title: 'Scan a handwritten note',
    message: 'Take a clear photo or choose one. Check the items SariList finds before adding them.',
    expression: 'loading',
    route: '/review-scan',
    targets: ['scan-source'],
  },
  {
    title: 'Keep an eye on the trip',
    message: 'See how many items are done and how much money is left.',
    expression: 'empty',
    route: '/shopping',
    targets: ['shopping-overview'],
  },
  {
    title: 'Handle each item in one place',
    message: 'Enter the price, check an item when you buy it, or mark it unavailable.',
    expression: 'error',
    route: '/shopping',
    targets: ['shopping-items'],
  },
  {
    title: 'Finish with a clear summary',
    message: 'See what you spent and which items were bought, unavailable, or unfinished.',
    expression: 'success',
    route: '/summary',
    targets: ['summary-total'],
  },
  {
    title: 'Everything stays easy to find',
    message: 'Find every active and finished list here. Tap a list to open it or use its menu for more options.',
    expression: 'success',
    route: '/lists',
    targets: ['lists-history'],
  },
];

const overlayColor = 'rgba(12, 27, 22, 0.72)';
const spotlightPadding = 8;

type OnboardingFlowProps = {
  visible: boolean;
  onDismiss: () => void;
  onStartList: () => void;
};

function SpotlightReveal({
  progress,
  spotlight,
}: {
  progress: Animated.Value;
  spotlight: WalkthroughTargetLayout;
}) {
  const cornerRadius =
    spotlight.shape === 'circle'
      ? Math.min(spotlight.width, spotlight.height) / 2
      : Radii.lg;
  const halfWidth = spotlight.width / 2;
  const leftOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -halfWidth],
  });
  const rightOffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, halfWidth],
  });

  return (
    <View
      pointerEvents="none"
      style={[
        styles.revealClip,
        {
          borderRadius: cornerRadius,
          height: spotlight.height,
          left: spotlight.x,
          top: spotlight.y,
          width: spotlight.width,
        },
      ]}>
      <Animated.View
        style={[
          styles.revealHalf,
          { left: 0, transform: [{ translateX: leftOffset }], width: halfWidth + 1 },
        ]}
      />
      <Animated.View
        style={[
          styles.revealHalf,
          { left: halfWidth, transform: [{ translateX: rightOffset }], width: halfWidth + 1 },
        ]}
      />
    </View>
  );
}

function SpotlightMask({
  height,
  progress,
  width,
  spotlights,
}: {
  height: number;
  progress: Animated.Value;
  width: number;
  spotlights: WalkthroughTargetLayout[];
}) {
  const maskId = 'onboarding-spotlight-mask';

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill} width={width} height={height}>
        <Defs>
          <Mask id={maskId}>
            <Rect fill="white" height={height} width={width} x={0} y={0} />
            {spotlights.map((spotlight) => {
              const cornerRadius =
                spotlight.shape === 'circle'
                  ? Math.min(spotlight.width, spotlight.height) / 2
                  : Radii.lg;

              return (
                <Rect
                  fill="black"
                  height={spotlight.height}
                  key={spotlight.id}
                  rx={cornerRadius}
                  ry={cornerRadius}
                  width={spotlight.width}
                  x={spotlight.x}
                  y={spotlight.y}
                />
              );
            })}
          </Mask>
        </Defs>
        <Rect
          fill={overlayColor}
          height={height}
          mask={`url(#${maskId})`}
          width={width}
          x={0}
          y={0}
        />
      </Svg>
      {spotlights.map((spotlight) => (
        <SpotlightReveal key={spotlight.id} progress={progress} spotlight={spotlight} />
      ))}
    </View>
  );
}

export function OnboardingFlow({ visible, onDismiss, onStartList }: OnboardingFlowProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const { measureTarget, targetRevision } = useOnboarding();
  const overlayRef = useRef<View>(null);
  const spotlightProgress = useRef(new Animated.Value(1)).current;
  const animatedSpotlightStep = useRef(-1);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetLayouts, setTargetLayouts] = useState<WalkthroughTargetLayout[]>([]);
  const [cardHeight, setCardHeight] = useState(220);
  const [reduceMotion, setReduceMotion] = useState(false);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const controlsTop = Platform.OS === 'ios' ? insets.top + Spacing[1] : Spacing[2];
  const skipBottom = Platform.OS === 'ios' ? insets.bottom + Spacing[1] : Spacing[1];

  useEffect(() => {
    if (!visible) {
      animatedSpotlightStep.current = -1;
      return;
    }
    animatedSpotlightStep.current = -1;
    spotlightProgress.setValue(0);
    setStepIndex(0);
  }, [spotlightProgress, visible]);

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);

    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setTargetLayouts([]);

    if (!visible || !step.targets?.length) return;

    const timer = setTimeout(() => {
      const overlayOrigin = new Promise<{ x: number; y: number }>((resolve) => {
        if (!overlayRef.current) {
          resolve({ x: 0, y: 0 });
          return;
        }

        overlayRef.current.measureInWindow((x, y) => resolve({ x, y }));
      });

      void Promise.all([
        overlayOrigin,
        Promise.all(step.targets!.map((target) => measureTarget(target))),
      ]).then(([origin, layouts]) => {
        if (cancelled) return;
        setTargetLayouts(
          layouts
            .filter((layout): layout is WalkthroughTargetLayout => Boolean(layout))
            .map((layout) => ({
              ...layout,
              x: layout.x - origin.x,
              y: layout.y - origin.y,
            })),
        );
      });
    }, 80);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [height, measureTarget, step.targets, targetRevision, visible, width]);

  const spotlights = useMemo(
    () =>
      targetLayouts
        .map((layout) => {
          const padding = layout.shape === 'circle' ? 5 : spotlightPadding;
          const verticalOffset =
            layout.id === 'new-list-items' ? 28 : layout.id === 'lists-history' ? 16 : 0;
          const x = Math.max(8, layout.x - padding);
          const y = Math.max(8, layout.y - padding + verticalOffset);
          const maxWidth = width - x - 8;
          const maxHeight = height - y - 8;
          const guidedHeight =
            layout.id === 'new-list-items' ||
            layout.id === 'shopping-items' ||
            layout.id === 'lists-history'
              ? Math.min(layout.height, layout.id === 'shopping-items' ? 160 : 210)
              : layout.height;

          return {
            ...layout,
            x,
            y,
            width: Math.min(layout.width + padding * 2, maxWidth),
            height: Math.min(guidedHeight + padding * 2, maxHeight),
          };
        })
        .sort((left, right) => left.y - right.y),
    [height, targetLayouts, width],
  );

  useEffect(() => {
    if (!visible || !spotlights.length || animatedSpotlightStep.current === stepIndex) return;

    animatedSpotlightStep.current = stepIndex;
    spotlightProgress.stopAnimation();

    if (reduceMotion) {
      spotlightProgress.setValue(1);
      return;
    }

    spotlightProgress.setValue(0);
    Animated.timing(spotlightProgress, {
      duration: 420,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, spotlightProgress, spotlights.length, stepIndex, visible]);

  const cardPosition = useMemo(() => {
    const topLimit = controlsTop + 48;
    const bottomLimit = height - (skipBottom + 52);
    if (stepIndex === 0) {
      const availableHeight = bottomLimit - topLimit;
      return { top: Math.max(topLimit, topLimit + (availableHeight - cardHeight) / 2) };
    }
    if (!spotlights.length) {
      return { top: Math.min(bottomLimit - cardHeight, Math.max(topLimit, height * 0.2)) };
    }

    const gaps: { start: number; end: number }[] = [];
    let cursor = topLimit;
    spotlights.forEach((spotlight) => {
      if (spotlight.y > cursor) gaps.push({ start: cursor, end: spotlight.y });
      cursor = Math.max(cursor, spotlight.y + spotlight.height);
    });
    if (cursor < bottomLimit) gaps.push({ start: cursor, end: bottomLimit });

    const gap = gaps
      .filter(({ start, end }) => end - start >= cardHeight + Spacing[3])
      .sort((left, right) => right.end - right.start - (left.end - left.start))[0];

    if (gap) {
      return { top: gap.start + (gap.end - gap.start - cardHeight) / 2 };
    }

    const largestGap = gaps.sort((left, right) => right.end - right.start - (left.end - left.start))[0];
    return {
      top: largestGap
        ? Math.max(topLimit, Math.min(largestGap.start, bottomLimit - cardHeight))
        : Math.max(topLimit, bottomLimit - cardHeight),
    };
  }, [cardHeight, controlsTop, height, skipBottom, spotlights, stepIndex]);

  const cardWidth = Math.min(440, width - Spacing[8]);

  function moveToStep(nextIndex: number) {
    const nextStep = steps[nextIndex];
    spotlightProgress.stopAnimation();
    spotlightProgress.setValue(0);
    setTargetLayouts([]);
    setStepIndex(nextIndex);
    router.replace(nextStep.route);
  }

  function closeTour() {
    onDismiss();
    router.replace('/');
  }

  function goBack() {
    if (stepIndex === 0) {
      closeTour();
      return;
    }
    moveToStep(stepIndex - 1);
  }

  function goForward() {
    if (isLastStep) {
      onDismiss();
      onStartList();
      return;
    }
    moveToStep(stepIndex + 1);
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeTour}
      transparent
      visible={visible}>
      <View
        accessibilityViewIsModal
        collapsable={false}
        ref={overlayRef}
        style={styles.root}>
        {spotlights.length ? (
          <SpotlightMask
            height={height}
            progress={spotlightProgress}
            spotlights={spotlights}
            width={width}
          />
        ) : (
          <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shade]} />
        )}

        <View style={[styles.topBar, { top: controlsTop }]}>
          <Pressable
            accessibilityLabel={stepIndex === 0 ? 'Close onboarding' : 'Previous onboarding step'}
            accessibilityRole="button"
            hitSlop={6}
            onPress={goBack}
            style={({ pressed }) => [styles.topButton, pressed && styles.pressed]}>
            <Feather color={Colors.forest} name={stepIndex === 0 ? 'x' : 'arrow-left'} size={19} />
          </Pressable>
          <View style={styles.progressPill}>
            <AppText tone="accent" variant="caption">
              {stepIndex + 1} of {steps.length}
            </AppText>
          </View>
          <Pressable
            accessibilityLabel="Next onboarding step"
            accessibilityRole="button"
            hitSlop={4}
            onPress={goForward}
            style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}>
            <AppText tone="accent" variant="label">Next</AppText>
          </Pressable>
        </View>

        <View
          onLayout={(event) => setCardHeight(event.nativeEvent.layout.height)}
          style={[
            styles.card,
            cardPosition,
            { left: (width - cardWidth) / 2, width: cardWidth },
          ]}>
          <View style={styles.cardHeader}>
            <MascotIllustration expression={step.expression} size={78} style={styles.mascot} />
            <View style={styles.cardHeading}>
              <AppText tone="accent" variant="overline">Your Guide</AppText>
              <AppText style={styles.title} variant="heading">{step.title}</AppText>
            </View>
          </View>
          <AppText style={styles.message} tone="muted" variant="body">
            {step.message}
          </AppText>
        </View>

        <Pressable
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
          onPress={closeTour}
          style={({ pressed }) => [
            styles.bottomSkip,
            { bottom: skipBottom },
            pressed && styles.pressed,
          ]}>
          <AppText tone="accent" variant="label">Skip tour</AppText>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  shade: {
    backgroundColor: overlayColor,
    position: 'absolute',
  },
  revealClip: {
    overflow: 'hidden',
    position: 'absolute',
  },
  revealHalf: {
    backgroundColor: overlayColor,
    bottom: 0,
    position: 'absolute',
    top: 0,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: Spacing[4],
    position: 'absolute',
    right: Spacing[4],
    zIndex: 3,
  },
  topButton: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderColor: Colors.white,
    borderRadius: Radii.pill,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...Shadows.soft,
  },
  progressPill: {
    backgroundColor: Colors.canvas,
    borderColor: Colors.white,
    borderRadius: Radii.pill,
    borderWidth: 2,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    ...Shadows.soft,
  },
  nextButton: {
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderColor: Colors.white,
    borderRadius: Radii.pill,
    borderWidth: 2,
    justifyContent: 'center',
    minHeight: 40,
    minWidth: 58,
    paddingHorizontal: Spacing[3],
    ...Shadows.soft,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: Colors.canvas,
    borderColor: 'rgba(255, 255, 255, 0.82)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing[4],
    position: 'absolute',
    zIndex: 2,
    ...Shadows.soft,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mascot: {
    flexShrink: 0,
    marginRight: Spacing[3],
  },
  cardHeading: {
    flex: 1,
  },
  title: {
    marginTop: 2,
  },
  message: {
    marginTop: Spacing[3],
  },
  bottomSkip: {
    backgroundColor: Colors.canvas,
    borderColor: Colors.white,
    borderRadius: Radii.pill,
    borderWidth: 2,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    position: 'absolute',
    right: Spacing[4],
    zIndex: 3,
    ...Shadows.soft,
  },
  pressed: {
    opacity: 0.7,
  },
});
