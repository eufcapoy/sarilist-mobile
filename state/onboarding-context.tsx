import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { View } from 'react-native';

import { loadOnboardingComplete, saveOnboardingComplete } from '@/storage/app-storage';

export type WalkthroughTargetId =
  | 'home-create'
  | 'home-new-list-nav'
  | 'new-list-basics'
  | 'new-list-items'
  | 'scan-source'
  | 'shopping-overview'
  | 'shopping-items'
  | 'summary-total'
  | 'lists-history';

export type WalkthroughTargetLayout = {
  id: WalkthroughTargetId;
  shape: 'circle' | 'rounded';
  x: number;
  y: number;
  width: number;
  height: number;
};

type OnboardingContextValue = {
  onboardingVisible: boolean;
  storageReady: boolean;
  targetRevision: number;
  dismissOnboarding: () => void;
  showOnboarding: () => void;
  registerTarget: (
    id: WalkthroughTargetId,
    node: View | null,
    shape: WalkthroughTargetLayout['shape'],
  ) => void;
  measureTarget: (id: WalkthroughTargetId) => Promise<WalkthroughTargetLayout | undefined>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [onboardingVisible, setOnboardingVisible] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [targetRevision, setTargetRevision] = useState(0);
  const targets = useRef(
    new Map<WalkthroughTargetId, { node: View; shape: WalkthroughTargetLayout['shape'] }>(),
  );

  useEffect(() => {
    let active = true;

    void loadOnboardingComplete()
      .then((complete) => {
        if (active) setOnboardingVisible(!complete);
      })
      .catch(() => {
        if (active) setOnboardingVisible(true);
      })
      .finally(() => {
        if (active) setStorageReady(true);
      });

    return () => {
      active = false;
    };
  }, []);

  const dismissOnboarding = useCallback(() => {
    setOnboardingVisible(false);
    void saveOnboardingComplete(true).catch(() => undefined);
  }, []);

  const registerTarget = useCallback((
    id: WalkthroughTargetId,
    node: View | null,
    shape: WalkthroughTargetLayout['shape'],
  ) => {
    if (node) targets.current.set(id, { node, shape });
    else targets.current.delete(id);
    setTargetRevision((revision) => revision + 1);
  }, []);

  const measureTarget = useCallback(
    (id: WalkthroughTargetId) =>
      new Promise<WalkthroughTargetLayout | undefined>((resolve) => {
        const registration = targets.current.get(id);
        if (!registration) {
          resolve(undefined);
          return;
        }

        registration.node.measureInWindow((x, y, width, height) => {
          resolve(
            width > 0 && height > 0
              ? { id, shape: registration.shape, x, y, width, height }
              : undefined,
          );
        });
      }),
    [],
  );

  const value = useMemo(
    () => ({
      onboardingVisible,
      storageReady,
      targetRevision,
      dismissOnboarding,
      showOnboarding: () => setOnboardingVisible(true),
      registerTarget,
      measureTarget,
    }),
    [dismissOnboarding, measureTarget, onboardingVisible, registerTarget, storageReady, targetRevision],
  );

  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);

  if (!context) {
    throw new Error('useOnboarding must be used inside OnboardingProvider');
  }

  return context;
}
