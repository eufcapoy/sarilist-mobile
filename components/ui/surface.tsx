import { StyleSheet, View, type ViewProps } from 'react-native';

import { Colors, Radii, Shadows } from '@/constants/theme';

type SurfaceProps = ViewProps & {
  elevated?: boolean;
};

export function Surface({ elevated = false, style, ...props }: SurfaceProps) {
  return <View {...props} style={[styles.base, elevated && Shadows.soft, style]} />;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    borderWidth: 1,
  },
});
