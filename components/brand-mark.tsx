import Feather from '@expo/vector-icons/Feather';
import { StyleSheet, View } from 'react-native';

import { Colors, Radii } from '@/constants/theme';

type BrandMarkProps = {
  size?: number;
  inverse?: boolean;
};

export function BrandMark({ size = 44, inverse = false }: BrandMarkProps) {
  return (
    <View
      accessibilityLabel="SariList"
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
          backgroundColor: inverse ? Colors.cream : Colors.forest,
        },
      ]}>
      <Feather color={inverse ? Colors.forest : Colors.cream} name="check" size={size * 0.5} />
      <View
        style={[
          styles.leaf,
          {
            backgroundColor: inverse ? Colors.forest : Colors.cream,
            width: size * 0.19,
            height: size * 0.29,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  leaf: {
    borderBottomLeftRadius: Radii.pill,
    borderTopRightRadius: Radii.pill,
    position: 'absolute',
    right: '14%',
    top: '10%',
    transform: [{ rotate: '12deg' }],
  },
});
