import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

export type MascotExpression =
  | 'empty'
  | 'loading'
  | 'error'
  | 'success'
  | 'pointing'
  | 'budget'
  | 'writing'
  | 'scanning'
  | 'progress'
  | 'shopping'
  | 'history';

const sources = {
  empty: require('@/assets/images/cat-guide-state-empty.png'),
  loading: require('@/assets/images/cat-guide-state-loading.png'),
  error: require('@/assets/images/cat-guide-gesture-warning.png'),
  success: require('@/assets/images/cat-guide-state-success.png'),
  pointing: require('@/assets/images/cat-guide-gesture-pointing.png'),
  budget: require('@/assets/images/cat-guide-gesture-budget.png'),
  writing: require('@/assets/images/cat-guide-gesture-writing.png'),
  scanning: require('@/assets/images/cat-guide-gesture-scanning.png'),
  progress: require('@/assets/images/cat-guide-gesture-progress.png'),
  shopping: require('@/assets/images/cat-guide-gesture-shopping.png'),
  history: require('@/assets/images/cat-guide-gesture-history.png'),
} as const;

const labels: Record<MascotExpression, string> = {
  empty: 'SariList cat guide welcoming you',
  loading: 'SariList cat guide examining a list',
  error: 'SariList cat guide showing a warning sign',
  success: 'SariList cat guide celebrating success',
  pointing: 'SariList cat guide pointing to the next action',
  budget: 'SariList cat guide planning a shopping budget',
  writing: 'SariList cat guide writing a shopping list',
  scanning: 'SariList cat guide checking a handwritten note',
  progress: 'SariList cat guide showing shopping progress',
  shopping: 'SariList cat guide carrying a grocery basket',
  history: 'SariList cat guide showing saved shopping lists',
};

type MascotIllustrationProps = {
  expression: MascotExpression;
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function MascotIllustration({
  expression,
  size = 116,
  style,
}: MascotIllustrationProps) {
  return (
    <View style={[styles.frame, { height: size, width: size }, style]}>
      <Image
        accessibilityIgnoresInvertColors
        accessibilityLabel={labels[expression]}
        resizeMode="contain"
        source={sources[expression]}
        style={styles.image}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    backgroundColor: Colors.canvas,
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
