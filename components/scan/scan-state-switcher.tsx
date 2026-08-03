import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radii, Spacing } from '@/constants/theme';
import type { ScanStatus } from '@/types/scan';

const options: { label: string; value: ScanStatus }[] = [
  { label: 'Empty', value: 'empty' },
  { label: 'Loading', value: 'loading' },
  { label: 'Error', value: 'error' },
  { label: 'Success', value: 'success' },
];

type ScanStateSwitcherProps = {
  value: ScanStatus;
  onChange: (status: ScanStatus) => void;
};

export function ScanStateSwitcher({ value, onChange }: ScanStateSwitcherProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.heading}>
        <AppText tone="accent" variant="overline">Mock preview</AppText>
        <AppText tone="muted" variant="caption">OCR will connect here later</AppText>
      </View>
      <View accessibilityRole="radiogroup" style={styles.options}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={option.value}
              onPress={() => onChange(option.value)}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.pressed,
              ]}>
              <AppText
                numberOfLines={1}
                tone={selected ? 'inverse' : 'muted'}
                variant="caption">
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.creamLight,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    borderWidth: 1,
    gap: Spacing[3],
    padding: Spacing[3],
  },
  heading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  options: {
    flexDirection: 'row',
    gap: Spacing[1],
  },
  option: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radii.pill,
    flex: 1,
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: Spacing[1],
  },
  optionSelected: {
    backgroundColor: Colors.forest,
  },
  pressed: {
    opacity: 0.7,
  },
});
