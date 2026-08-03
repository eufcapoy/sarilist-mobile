import { useCallback, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useOnboarding, type WalkthroughTargetId } from '@/state/onboarding-context';

type WalkthroughTargetProps = {
  children: ReactNode;
  id: WalkthroughTargetId;
  shape?: 'circle' | 'rounded';
  style?: StyleProp<ViewStyle>;
};

export function WalkthroughTarget({ children, id, shape = 'rounded', style }: WalkthroughTargetProps) {
  const { registerTarget } = useOnboarding();
  const setTargetRef = useCallback(
    (node: View | null) => {
      registerTarget(id, node, shape);
    },
    [id, registerTarget, shape],
  );

  return (
    <View collapsable={false} ref={setTargetRef} style={style}>
      {children}
    </View>
  );
}
