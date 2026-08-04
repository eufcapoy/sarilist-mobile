import { Image, StyleSheet } from 'react-native';

import { Radii } from '@/constants/theme';

type BrandMarkProps = {
  size?: number;
};

const source = require('@/assets/images/app-icon-option-a.png');

export function BrandMark({ size = 44 }: BrandMarkProps) {
  return (
    <Image
      accessibilityIgnoresInvertColors
      accessibilityLabel="SariList"
      resizeMode="cover"
      source={source}
      style={[styles.mark, { height: size, width: size }]}
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    borderRadius: Radii.md,
    overflow: 'hidden',
  },
});
