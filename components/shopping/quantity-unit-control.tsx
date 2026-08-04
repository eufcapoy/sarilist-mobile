import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { UnitSelector } from '@/components/shopping/unit-selector';
import { AppText } from '@/components/ui/app-text';
import { getShoppingUnit } from '@/constants/shopping-units';
import { Colors, Radii, Spacing } from '@/constants/theme';
import type { ShoppingUnit } from '@/types/shopping';

type QuantityUnitControlProps = {
  quantity?: number;
  unit?: ShoppingUnit;
  onQuantityChange: (quantity?: number) => void;
  onUnitChange: (unit?: ShoppingUnit) => void;
};

export function QuantityUnitControl({
  quantity,
  unit,
  onQuantityChange,
  onUnitChange,
}: QuantityUnitControlProps) {
  const [quantityText, setQuantityText] = useState(
    quantity === undefined ? '' : String(quantity),
  );
  const [selectorVisible, setSelectorVisible] = useState(false);
  const unitOption = getShoppingUnit(unit);

  useEffect(() => {
    setQuantityText(quantity === undefined ? '' : String(quantity));
  }, [quantity]);

  function updateQuantity(value: string) {
    if (!/^\d*\.?\d{0,2}$/.test(value)) {
      return;
    }

    setQuantityText(value);

    if (!value) {
      onQuantityChange(undefined);
      return;
    }

    if (!value.endsWith('.')) {
      const parsed = Number(value);
      onQuantityChange(Number.isFinite(parsed) && parsed > 0 ? parsed : undefined);
    }
  }

  function normalizeQuantity(finalValue?: string) {
    const resolvedValue = finalValue ?? quantityText;

    if (!resolvedValue.trim()) {
      setQuantityText('');
      onQuantityChange(undefined);
      return;
    }

    const parsed = Number(resolvedValue);
    if (!parsed || parsed <= 0) {
      setQuantityText('');
      onQuantityChange(undefined);
      return;
    }

    setQuantityText(String(parsed));
    onQuantityChange(parsed);
  }

  return (
    <>
      <View style={styles.control}>
        <TextInput
          accessibilityLabel="Quantity"
          keyboardType="decimal-pad"
          onChangeText={updateQuantity}
          onEndEditing={(event) => normalizeQuantity(event.nativeEvent.text)}
          placeholder="Qty"
          placeholderTextColor={Colors.textSubtle}
          returnKeyType="done"
          selectionColor={Colors.forest}
          style={styles.quantityInput}
          value={quantityText}
        />
        <View style={styles.divider} />
        <Pressable
          accessibilityLabel={`Change unit, currently ${unitOption?.label ?? 'not specified'}`}
          accessibilityRole="button"
          onPress={() => setSelectorVisible(true)}
          style={({ pressed }) => [styles.unitButton, pressed && styles.pressed]}>
          <AppText numberOfLines={1} tone={unitOption ? 'accent' : 'subtle'} variant="label">
            {unitOption?.shortLabel ?? 'Unit'}
          </AppText>
          <Feather color={Colors.leaf} name="chevron-down" size={14} />
        </Pressable>
      </View>
      <UnitSelector
        onChange={onUnitChange}
        onClose={() => setSelectorVisible(false)}
        value={unit}
        visible={selectorVisible}
      />
    </>
  );
}

const styles = StyleSheet.create({
  control: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    height: 44,
    overflow: 'hidden',
  },
  quantityInput: {
    color: Colors.charcoal,
    fontSize: 15,
    fontWeight: '600',
    height: 42,
    paddingHorizontal: Spacing[2],
    paddingVertical: 0,
    textAlign: 'center',
    width: 52,
  },
  divider: {
    backgroundColor: Colors.borderStrong,
    height: 22,
    width: StyleSheet.hairlineWidth,
  },
  unitButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
    height: 42,
    justifyContent: 'center',
    minWidth: 68,
    paddingHorizontal: Spacing[2],
  },
  pressed: {
    opacity: 0.62,
  },
});
