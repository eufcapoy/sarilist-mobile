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
import { WalkthroughTarget } from '@/components/onboarding/walkthrough-target';
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
};

const initialItems: DraftItem[] = [
  { id: 'rice', name: 'Rice', quantity: undefined, unit: 'sack' },
  { id: 'eggs', name: 'Eggs', quantity: undefined, unit: 'tray' },
  { id: 'fresh-milk', name: 'Fresh milk', quantity: undefined, unit: 'bottle' },
];

export default function NewListScreen() {
  const router = useRouter();
  const { source } = useLocalSearchParams<{ source?: string }>();
  const { activeList, saveList } = useShoppingList();
  const { height, width } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const fromScan = source === 'scan';
  const [listName, setListName] = useState(fromScan ? activeList.name : '');
  const [itemName, setItemName] = useState('');
  const [budget, setBudget] = useState(
    fromScan && activeList.budget > 0 ? String(activeList.budget) : fromScan ? '' : '1500',
  );
  const [useBudget, setUseBudget] = useState(fromScan ? activeList.budget > 0 : true);
  const [items, setItems] = useState<DraftItem[]>(() =>
    fromScan
      ? activeList.items.map((item) => ({
          id: item.id,
          name: item.productName,
          quantity: item.quantity,
          unit: item.unit,
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
      },
    ]);
    setItemName('');
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
      budget: useBudget ? Number(budget) || 0 : 0,
      items: items.map((item) => ({
        id: item.id,
        productName: item.name,
        quantity: item.quantity,
        unit: item.unit,
        purchased: false,
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
            <WalkthroughTarget id="new-list-basics">
              <View style={styles.nameSection}>
                <View style={styles.nameLabelRow}>
                  <AppText tone="accent" variant="overline">
                    List name
                  </AppText>
                  <AppText tone="muted" variant="caption">
                    Required
                  </AppText>
                </View>
                <TextInput
                  accessibilityLabel="List name"
                  maxLength={50}
                  onChangeText={setListName}
                  placeholder="Type a name for this list"
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
                  Choose whether you want to track a spending limit
                </AppText>
              </View>
              <View accessibilityLabel="Budget preference" style={styles.budgetChoices}>
                <Pressable
                  accessibilityLabel="Shop with a budget"
                  accessibilityRole="radio"
                  accessibilityState={{ checked: useBudget }}
                  onPress={() => setUseBudget(true)}
                  style={({ pressed }) => [
                    styles.budgetChoice,
                    useBudget && styles.budgetChoiceSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Feather
                    color={useBudget ? Colors.forest : Colors.textMuted}
                    name="target"
                    size={16}
                  />
                  <AppText tone={useBudget ? 'accent' : 'muted'} variant="caption">
                    With budget
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityLabel="Shop without a budget"
                  accessibilityRole="radio"
                  accessibilityState={{ checked: !useBudget }}
                  onPress={() => setUseBudget(false)}
                  style={({ pressed }) => [
                    styles.budgetChoice,
                    !useBudget && styles.budgetChoiceSelected,
                    pressed && styles.pressed,
                  ]}>
                  <Feather
                    color={!useBudget ? Colors.forest : Colors.textMuted}
                    name="maximize"
                    size={16}
                  />
                  <AppText tone={!useBudget ? 'accent' : 'muted'} variant="caption">
                    No budget
                  </AppText>
                </Pressable>
              </View>
              {useBudget ? (
                <Surface style={styles.budgetInputWrap}>
                  <AppText tone="accent" variant="bodyMedium">₱</AppText>
                  <TextInput
                    accessibilityLabel="Shopping budget amount"
                    keyboardType="decimal-pad"
                    maxLength={8}
                    onChangeText={(value) => setBudget(value.replace(/[^0-9.]/g, ''))}
                    placeholder="Enter amount"
                    placeholderTextColor={Colors.textSubtle}
                    returnKeyType="done"
                    selectionColor={Colors.forest}
                    style={styles.budgetInput}
                    value={budget}
                  />
                </Surface>
              ) : (
                <View style={styles.noBudgetNote}>
                  <Feather color={Colors.leaf} name="check-circle" size={16} />
                  <AppText style={styles.noBudgetCopy} tone="muted" variant="caption">
                    You can still enter prices and see your running total.
                  </AppText>
                </View>
              )}
              </View>
            </WalkthroughTarget>

            <WalkthroughTarget id="new-list-items">
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
                      <View style={styles.itemDetails}>
                        <AppText numberOfLines={2} variant="bodyMedium">
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
            </WalkthroughTarget>

            <View style={styles.helperRow}>
              <Feather color={Colors.leaf} name="info" size={15} />
              <AppText style={styles.helperCopy} tone="muted" variant="caption">
                Quantities and prices can be adjusted in Shopping Mode.
              </AppText>
            </View>
          </ScrollView>

          <View style={[styles.footer, compact && styles.horizontalCompact]}>
            <AppButton
              disabled={!listName.trim() || items.length === 0 || (useBudget && !Number(budget))}
              fullWidth
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
  nameLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    gap: Spacing[3],
    marginTop: Spacing[5],
  },
  budgetCopy: {
    gap: 2,
  },
  budgetChoices: {
    flexDirection: 'row',
    gap: Spacing[2],
  },
  budgetChoice: {
    alignItems: 'center',
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: Spacing[2],
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: Spacing[3],
  },
  budgetChoiceSelected: {
    backgroundColor: Colors.forestSoft,
    borderColor: Colors.leaf,
  },
  budgetInputWrap: {
    alignItems: 'center',
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: Spacing[3],
    width: '100%',
  },
  budgetInput: {
    color: Colors.charcoal,
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    minHeight: 44,
    paddingHorizontal: Spacing[1],
    paddingVertical: 0,
  },
  noBudgetNote: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.md,
    flexDirection: 'row',
    gap: Spacing[2],
    minHeight: 48,
    paddingHorizontal: Spacing[3],
  },
  noBudgetCopy: {
    flex: 1,
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
    height: 44,
    justifyContent: 'center',
    width: 44,
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
  itemDetails: {
    flex: 1,
  },
  itemQuantity: {
    alignSelf: 'flex-start',
    marginTop: Spacing[2],
  },
  removeButton: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    marginLeft: Spacing[2],
    width: 44,
  },
  divider: {
    backgroundColor: Colors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing[4],
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
