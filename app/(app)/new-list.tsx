import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { QuantityUnitControl } from '@/components/shopping/quantity-unit-control';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Surface } from '@/components/ui/surface';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useShoppingList } from '@/state/shopping-list-context';
import type { ShoppingUnit } from '@/types/shopping';

type DraftItem = {
  id: string;
  name: string;
  quantity?: number;
  unit: ShoppingUnit;
  completed: boolean;
};

const initialItems: DraftItem[] = [
  { id: 'rice', name: 'Rice', quantity: undefined, unit: 'sack', completed: false },
  { id: 'eggs', name: 'Eggs', quantity: undefined, unit: 'tray', completed: false },
  { id: 'fresh-milk', name: 'Fresh milk', quantity: undefined, unit: 'bottle', completed: false },
];

export default function NewListScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { activeList, saveList } = useShoppingList();
  const { height, width } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const fromScan = source === 'scan';
  const [listName, setListName] = useState(fromScan ? activeList.name : 'Weekly groceries');
  const [itemName, setItemName] = useState('');
  const [budget, setBudget] = useState(
    fromScan && activeList.budget > 0 ? String(activeList.budget) : fromScan ? '' : '1500',
  );
  const [items, setItems] = useState<DraftItem[]>(() =>
    fromScan
      ? activeList.items.map((item) => ({
          id: item.id,
          name: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          completed: false,
        }))
      : initialItems,
  );

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  function addItem() {
    const trimmedName = itemName.trim();

    if (!trimmedName) {
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        id: `${Date.now()}-${trimmedName}`,
        name: trimmedName,
        quantity: undefined,
        unit: 'piece',
        completed: false,
      },
    ]);
    setItemName('');
    void Haptics.selectionAsync();
  }

  function toggleItem(id: string) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
    void Haptics.selectionAsync();
  }

  function removeItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function updateItem(id: string, updates: Partial<Pick<DraftItem, 'quantity' | 'unit'>>) {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  function startShopping() {
    saveList({
      id: `${Date.now()}-${listName.trim()}`,
      name: listName.trim(),
      budget: Number(budget) || 0,
      items: items.map((item) => ({
        id: item.id,
        productName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchased: item.completed,
        unavailable: false,
      })),
    });
    router.push('/shopping');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.frame}>
          <View style={[styles.headerWrap, compact && styles.horizontalCompact]}>
            <ScreenHeader onBack={goBack} subtitle="Build it your way" title="New list" />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.content,
              compact && styles.contentCompact,
              compact && styles.horizontalCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.nameSection}>
              <AppText tone="accent" variant="overline">
                List name
              </AppText>
              <TextInput
                accessibilityLabel="List name"
                maxLength={50}
                onChangeText={setListName}
                placeholder="Name this list"
                placeholderTextColor={Colors.textSubtle}
                returnKeyType="done"
                selectionColor={Colors.forest}
                style={[styles.nameInput, compact && styles.nameInputCompact]}
                value={listName}
              />
            </View>

            <View style={styles.budgetSection}>
              <View style={styles.budgetCopy}>
                <AppText variant="bodyMedium">Shopping budget</AppText>
                <AppText tone="muted" variant="caption">
                  Used to track what remains
                </AppText>
              </View>
              <Surface style={styles.budgetInputWrap}>
                <AppText tone="accent" variant="bodyMedium">
                  ₱
                </AppText>
                <TextInput
                  accessibilityLabel="Shopping budget"
                  keyboardType="decimal-pad"
                  maxLength={8}
                  onChangeText={(value) => setBudget(value.replace(/[^0-9.]/g, ''))}
                  placeholder="0"
                  placeholderTextColor={Colors.textSubtle}
                  returnKeyType="done"
                  selectionColor={Colors.forest}
                  style={styles.budgetInput}
                  value={budget}
                />
              </Surface>
            </View>

            <View style={styles.sectionHeading}>
              <View>
                <AppText variant="heading">Items</AppText>
                <AppText tone="muted" variant="caption">
                  {items.length} {items.length === 1 ? 'item' : 'items'} in this list
                </AppText>
              </View>
            </View>

            <Surface style={styles.composer}>
              <Feather color={Colors.leaf} name="search" size={19} />
              <TextInput
                accessibilityLabel="Item name"
                blurOnSubmit={false}
                onChangeText={setItemName}
                onSubmitEditing={addItem}
                placeholder="Add an item"
                placeholderTextColor={Colors.textSubtle}
                returnKeyType="done"
                selectionColor={Colors.forest}
                style={styles.itemInput}
                value={itemName}
              />
              <Pressable
                accessibilityLabel="Add item"
                accessibilityRole="button"
                disabled={!itemName.trim()}
                hitSlop={4}
                onPress={addItem}
                style={({ pressed }) => [
                  styles.addButton,
                  !itemName.trim() && styles.addButtonDisabled,
                  pressed && styles.pressed,
                ]}>
                <Feather color={Colors.white} name="plus" size={20} />
              </Pressable>
            </Surface>

            <Surface style={styles.itemsSurface}>
              {items.length ? (
                items.map((item, index) => (
                  <View key={item.id}>
                    <View style={[styles.itemRow, compact && styles.itemRowCompact]}>
                      <Pressable
                        accessibilityLabel={`Mark ${item.name} as ${item.completed ? 'not done' : 'done'}`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: item.completed }}
                        hitSlop={8}
                        onPress={() => toggleItem(item.id)}
                        style={[styles.checkButton, item.completed && styles.checkButtonSelected]}>
                        {item.completed ? (
                          <Feather color={Colors.white} name="check" size={15} />
                        ) : null}
                      </Pressable>
                      <View style={styles.itemDetails}>
                        <AppText
                          numberOfLines={2}
                          style={item.completed && styles.itemLabelCompleted}
                          tone={item.completed ? 'subtle' : 'default'}
                          variant="bodyMedium">
                          {item.name}
                        </AppText>
                        <View style={styles.itemQuantity}>
                          <QuantityUnitControl
                            onQuantityChange={(quantity) => updateItem(item.id, { quantity })}
                            onUnitChange={(unit) => updateItem(item.id, { unit })}
                            quantity={item.quantity}
                            unit={item.unit}
                          />
                        </View>
                      </View>
                      <Pressable
                        accessibilityLabel={`Remove ${item.name}`}
                        accessibilityRole="button"
                        hitSlop={10}
                        onPress={() => removeItem(item.id)}
                        style={({ pressed }) => [styles.removeButton, pressed && styles.pressed]}>
                        <Feather color={Colors.textSubtle} name="x" size={18} />
                      </Pressable>
                    </View>
                    {index < items.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Feather color={Colors.leaf} name="shopping-bag" size={21} />
                  </View>
                  <AppText variant="bodyMedium">Your list is empty</AppText>
                  <AppText style={styles.emptyCopy} tone="muted" variant="caption">
                    Add your first item above to get started.
                  </AppText>
                </View>
              )}
            </Surface>

            <View style={styles.helperRow}>
              <Feather color={Colors.leaf} name="info" size={15} />
              <AppText style={styles.helperCopy} tone="muted" variant="caption">
                Quantities and prices can be adjusted in Shopping Mode.
              </AppText>
            </View>
          </ScrollView>

          <View style={[styles.footer, compact && styles.horizontalCompact]}>
            <AppButton
              disabled={!listName.trim() || items.length === 0 || !Number(budget)}
              fullWidth
              icon="arrow-right"
              label="Start shopping"
              onPress={startShopping}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.canvas,
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  frame: {
    alignSelf: 'center',
    flex: 1,
    maxWidth: 520,
    width: '100%',
  },
  headerWrap: {
    paddingHorizontal: Spacing[5],
  },
  content: {
    paddingBottom: Spacing[6],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
  },
  contentCompact: {
    paddingBottom: Spacing[4],
    paddingTop: Spacing[3],
  },
  horizontalCompact: {
    paddingHorizontal: Spacing[4],
  },
  nameSection: {
    gap: Spacing[1],
  },
  nameInput: {
    borderBottomColor: Colors.borderStrong,
    borderBottomWidth: 1,
    color: Colors.charcoal,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 38,
    paddingHorizontal: 0,
    paddingVertical: Spacing[2],
  },
  nameInputCompact: {
    fontSize: 26,
    lineHeight: 33,
  },
  budgetSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[3],
    justifyContent: 'space-between',
    marginTop: Spacing[5],
  },
  budgetCopy: {
    flex: 1,
  },
  budgetInputWrap: {
    alignItems: 'center',
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: Spacing[3],
    width: 126,
  },
  budgetInput: {
    color: Colors.charcoal,
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    minHeight: 44,
    paddingHorizontal: Spacing[1],
    paddingVertical: 0,
    textAlign: 'right',
  },
  sectionHeading: {
    marginBottom: Spacing[3],
    marginTop: Spacing[8],
  },
  composer: {
    alignItems: 'center',
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    flexDirection: 'row',
    gap: Spacing[2],
    minHeight: 54,
    paddingLeft: Spacing[4],
    paddingRight: 6,
  },
  itemInput: {
    color: Colors.charcoal,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: Spacing[2],
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: Colors.forest,
    borderRadius: Radii.sm,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addButtonDisabled: {
    backgroundColor: Colors.textSubtle,
    opacity: 0.45,
  },
  itemsSurface: {
    marginTop: Spacing[3],
    overflow: 'hidden',
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 88,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
  },
  itemRowCompact: {
    minHeight: 82,
  },
  checkButton: {
    alignItems: 'center',
    borderColor: Colors.borderStrong,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 24,
  },
  checkButtonSelected: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  itemDetails: {
    flex: 1,
  },
  itemQuantity: {
    alignSelf: 'flex-start',
    marginTop: Spacing[2],
  },
  itemLabelCompleted: {
    textDecorationLine: 'line-through',
  },
  removeButton: {
    alignItems: 'center',
    height: 42,
    justifyContent: 'center',
    marginLeft: Spacing[2],
    width: 36,
  },
  divider: {
    backgroundColor: Colors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 52,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[8],
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.md,
    height: 44,
    justifyContent: 'center',
    marginBottom: Spacing[3],
    width: 44,
  },
  emptyCopy: {
    marginTop: Spacing[1],
    textAlign: 'center',
  },
  helperRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[4],
  },
  helperCopy: {
    flex: 1,
  },
  footer: {
    backgroundColor: Colors.canvas,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
  },
  pressed: {
    opacity: 0.65,
  },
});
