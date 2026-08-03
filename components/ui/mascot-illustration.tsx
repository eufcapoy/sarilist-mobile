import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors } from '@/constants/theme';

export type MascotExpression = 'empty' | 'loading' | 'error' | 'success';

const sources = {
  empty: require('@/assets/images/cat-guide-state-empty.png'),
  loading: require('@/assets/images/cat-guide-state-loading.png'),
  error: require('@/assets/images/cat-guide-state-error.png'),
  success: require('@/assets/images/cat-guide-state-success.png'),
} as const;

const labels: Record<MascotExpression, string> = {
  empty: 'SariList cat guide welcoming you',
  loading: 'SariList cat guide examining a list',
  error: 'SariList cat guide offering help',
  success: 'SariList cat guide celebrating success',
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
