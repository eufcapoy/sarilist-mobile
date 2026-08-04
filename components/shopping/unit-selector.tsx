import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { ShoppingUnits, getShoppingUnit } from '@/constants/shopping-units';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import type { ShoppingUnit } from '@/types/shopping';

type UnitSelectorProps = {
  value?: ShoppingUnit;
  visible: boolean;
  onClose: () => void;
  onChange: (unit?: ShoppingUnit) => void;
};

export function UnitSelector({ value, visible, onClose, onChange }: UnitSelectorProps) {
  const selected = getShoppingUnit(value);

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <View style={styles.modalRoot}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />
        <SafeAreaView accessibilityViewIsModal edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View>
              <AppText variant="heading">Choose a unit</AppText>
              <AppText tone="muted" variant="caption">
                Selected: {selected?.label ?? 'No unit'}
              </AppText>
            </View>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Feather color={Colors.charcoal} name="x" size={20} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.options} showsVerticalScrollIndicator={false}>
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: value === undefined }}
              onPress={() => {
                void Haptics.selectionAsync();
                onChange(undefined);
                onClose();
              }}
              style={({ pressed }) => [
                styles.option,
                value === undefined && styles.optionSelected,
                pressed && styles.pressed,
              ]}>
              <AppText tone={value === undefined ? 'accent' : 'default'} variant="label">
                No unit
              </AppText>
              <AppText tone="muted" variant="caption">
                Leave blank
              </AppText>
            </Pressable>
            {ShoppingUnits.map((option) => {
              const isSelected = option.value === value;

              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isSelected }}
                  key={option.value}
                  onPress={() => {
                    void Haptics.selectionAsync();
                    onChange(option.value);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.option,
                    isSelected && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}>
                  <AppText tone={isSelected ? 'accent' : 'default'} variant="label">
                    {option.label}
                  </AppText>
                  <AppText tone="muted" variant="caption">
                    {option.shortLabel}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 20, 17, 0.28)',
  },
  sheet: {
    alignSelf: 'center',
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxHeight: '72%',
    maxWidth: 520,
    paddingHorizontal: Spacing[5],
    width: '100%',
    ...Shadows.soft,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: Colors.borderStrong,
    borderRadius: Radii.pill,
    height: 4,
    marginTop: Spacing[3],
    width: 38,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: Spacing[4],
    paddingTop: Spacing[4],
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[2],
    paddingBottom: Spacing[5],
  },
  option: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    borderWidth: 1,
    minHeight: 58,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    width: '31%',
  },
  optionSelected: {
    backgroundColor: Colors.forestSoft,
    borderColor: Colors.forest,
  },
  pressed: {
    opacity: 0.65,
  },
});
