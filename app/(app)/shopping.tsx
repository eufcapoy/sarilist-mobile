import Feather from '@expo/vector-icons/Feather';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
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
import { AppDialog } from '@/components/ui/app-dialog';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Surface } from '@/components/ui/surface';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useShoppingList } from '@/state/shopping-list-context';
import type { ShoppingItem } from '@/types/shopping';

function formatMoney(value: number) {
  return `₱${Math.max(value, 0).toLocaleString('en-PH', {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

function getItemTotal(item: ShoppingItem) {
  if (item.unitPrice === undefined) return undefined;
  return (item.quantity ?? 1) * item.unitPrice;
}

export default function ShoppingModeScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const { activeList, finishActiveList, updateItem } = useShoppingList();
  const [finishDialogVisible, setFinishDialogVisible] = useState(false);

  const completedCount = activeList.items.filter(
    (item) => item.purchased || item.unavailable,
  ).length;
  const progress = activeList.items.length ? completedCount / activeList.items.length : 0;
  const hasBudget = activeList.budget > 0;
  const runningTotal = activeList.items.reduce((total, item) => {
    const itemTotal = getItemTotal(item);
    if (!item.purchased || item.unavailable || itemTotal === undefined) {
      return total;
    }

    return total + itemTotal;
  }, 0);
  const remaining = activeList.budget - runningTotal;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace('/');
  }

  function togglePurchased(item: ShoppingItem) {
    updateItem(item.id, { purchased: !item.purchased, unavailable: false });
    void Haptics.selectionAsync();
  }

  function toggleUnavailable(item: ShoppingItem) {
    updateItem(item.id, {
      unavailable: !item.unavailable,
      purchased: false,
      unitPrice: item.unavailable ? item.unitPrice : undefined,
    });
    void Haptics.selectionAsync();
  }

  function setPrice(item: ShoppingItem, input: string) {
    const normalized = input.replace(/[^0-9.]/g, '');
    const parsed = Number(normalized);
    updateItem(item.id, { unitPrice: normalized && Number.isFinite(parsed) ? parsed : undefined });
  }

  function finishTrip() {
    setFinishDialogVisible(true);
  }

  function viewSummary() {
    setFinishDialogVisible(false);
    finishActiveList();
    router.push('/summary');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}>
        <View style={styles.frame}>
          <View style={[styles.headerWrap, compact && styles.horizontalCompact]}>
            <ScreenHeader
              onBack={goBack}
              subtitle={`${completedCount} of ${activeList.items.length} handled`}
              title="Shopping mode"
            />
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.content,
              compact && styles.contentCompact,
              compact && styles.horizontalCompact,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <WalkthroughTarget id="shopping-overview">
              <Surface style={styles.overview}>
                <View style={styles.overviewTopRow}>
                  <View style={styles.overviewCopy}>
                    <AppText tone="inverse" variant="overline">
                      {activeList.name}
                    </AppText>
                    <AppText style={styles.remainingAmount} tone="inverse" variant="title">
                      {hasBudget
                        ? remaining >= 0
                          ? `${formatMoney(remaining)} left`
                          : `${formatMoney(Math.abs(remaining))} over`
                        : `${formatMoney(runningTotal)} spent`}
                    </AppText>
                  </View>
                  <View style={[styles.budgetPill, hasBudget && remaining < 0 && styles.budgetPillOver]}>
                    <AppText tone="accent" variant="caption">
                      {hasBudget ? `Budget ${formatMoney(activeList.budget)}` : 'No budget'}
                    </AppText>
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
                </View>
                <AppText style={styles.progressLabel} tone="inverse" variant="caption">
                  {completedCount === activeList.items.length
                    ? 'Everything is accounted for'
                    : `${activeList.items.length - completedCount} item(s) remaining`}
                </AppText>
              </Surface>
            </WalkthroughTarget>

            <View style={styles.sectionHeading}>
              <AppText variant="heading">Your items</AppText>
              <AppText tone="muted" variant="caption">
                Enter the price you see in-store
              </AppText>
            </View>

            <WalkthroughTarget id="shopping-items" style={styles.itemList}>
              {activeList.items.map((item) => {
                const subtotal = getItemTotal(item);

                return (
                  <Surface
                    key={item.id}
                    style={[
                      styles.itemCard,
                      item.purchased && styles.itemCardPurchased,
                      item.unavailable && styles.itemCardUnavailable,
                      compact && styles.itemCardCompact,
                    ]}>
                    <View style={styles.itemTopRow}>
                      <Pressable
                        accessibilityLabel={`Mark ${item.productName} as ${item.purchased ? 'not purchased' : 'purchased'}`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: item.purchased, disabled: item.unavailable }}
                        disabled={item.unavailable}
                        hitSlop={8}
                        onPress={() => togglePurchased(item)}
                        style={[
                          styles.checkButton,
                          item.purchased && styles.checkButtonSelected,
                          item.unavailable && styles.checkButtonDisabled,
                        ]}>
                        {item.purchased ? (
                          <Feather color={Colors.white} name="check" size={16} />
                        ) : null}
                      </Pressable>

                      <View style={styles.itemNameWrap}>
                        <AppText
                          numberOfLines={2}
                          style={item.unavailable && styles.itemNameUnavailable}
                          tone={item.unavailable ? 'subtle' : 'default'}
                          variant="bodyMedium">
                          {item.productName}
                        </AppText>
                        {item.previousPrice !== undefined && !item.unavailable ? (
                          <AppText tone="muted" variant="caption">
                            Previous {formatMoney(item.previousPrice)}{item.quantity === undefined ? '' : ' each'}
                          </AppText>
                        ) : null}
                        {item.unavailable ? (
                          <AppText tone="muted" variant="caption">
                            Marked unavailable
                          </AppText>
                        ) : null}
                      </View>

                      <Pressable
                        accessibilityLabel={item.unavailable ? 'Restore item' : 'Mark item unavailable'}
                        accessibilityRole="button"
                        onPress={() => toggleUnavailable(item)}
                        style={({ pressed }) => [
                          styles.availabilityButton,
                          item.unavailable && styles.availabilityButtonActive,
                          pressed && styles.pressed,
                        ]}>
                        <Feather
                          color={item.unavailable ? Colors.forest : Colors.textMuted}
                          name={item.unavailable ? 'rotate-ccw' : 'slash'}
                          size={17}
                        />
                      </Pressable>
                    </View>

                    {!item.unavailable ? (
                      <View style={styles.itemControls}>
                        <QuantityUnitControl
                          onQuantityChange={(quantity) => updateItem(item.id, { quantity })}
                          onUnitChange={(unit) => updateItem(item.id, { unit })}
                          quantity={item.quantity}
                          unit={item.unit}
                        />

                        <View style={styles.priceWrap}>
                          <View style={styles.priceInputWrap}>
                            <AppText style={styles.currencySymbol} tone="muted" variant="label">
                              ₱
                            </AppText>
                            <TextInput
                              accessibilityLabel={`${item.productName} ${item.quantity === undefined ? 'price paid' : 'unit price'}`}
                              keyboardType="decimal-pad"
                              onChangeText={(value) => setPrice(item, value)}
                              placeholder="0"
                              placeholderTextColor={Colors.textSubtle}
                              returnKeyType="done"
                              selectionColor={Colors.forest}
                              style={styles.priceInput}
                              value={item.unitPrice?.toString() ?? ''}
                            />
                          </View>
                          <AppText
                            adjustsFontSizeToFit
                            minimumFontScale={0.8}
                            numberOfLines={1}
                            style={styles.priceCaption}
                            tone={subtotal === undefined ? 'subtle' : 'accent'}
                            variant="caption">
                            {subtotal === undefined
                              ? item.quantity === undefined
                                ? 'Price paid'
                                : 'Unit price'
                              : `${formatMoney(subtotal)} total`}
                          </AppText>
                        </View>
                      </View>
                    ) : null}
                  </Surface>
                );
              })}
            </WalkthroughTarget>
          </ScrollView>

          <View style={[styles.footer, compact && styles.horizontalCompact]}>
            <View style={styles.footerTotal}>
              <AppText tone="muted" variant="caption">
                Running total
              </AppText>
              <AppText variant="heading">{formatMoney(runningTotal)}</AppText>
            </View>
            <AppButton
              icon="check"
              label={width < 360 ? 'Finish' : 'Finish trip'}
              onPress={finishTrip}
              style={styles.finishButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
      <AppDialog
        mascotExpression={completedCount === activeList.items.length ? 'success' : 'error'}
        message={
          completedCount === activeList.items.length
            ? 'Everything is accounted for. Review your spending and item breakdown.'
            : `${activeList.items.length - completedCount} item(s) still need attention. You can finish now or return to the list.`
        }
        onClose={() => setFinishDialogVisible(false)}
        onPrimary={viewSummary}
        primaryLabel="View summary"
        secondaryLabel="Keep shopping"
        title={completedCount === activeList.items.length ? 'Shopping complete' : 'Finish this trip?'}
        visible={finishDialogVisible}
      />
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
    paddingTop: Spacing[3],
  },
  contentCompact: {
    paddingBottom: Spacing[4],
    paddingTop: Spacing[2],
  },
  horizontalCompact: {
    paddingHorizontal: Spacing[4],
  },
  overview: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
    overflow: 'hidden',
    padding: Spacing[5],
  },
  overviewTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing[3],
    justifyContent: 'space-between',
  },
  overviewCopy: {
    flex: 1,
  },
  remainingAmount: {
    marginTop: Spacing[1],
  },
  budgetPill: {
    backgroundColor: Colors.cream,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[3],
    paddingVertical: 6,
  },
  budgetPillOver: {
    backgroundColor: '#F2D6CF',
  },
  progressTrack: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: Radii.pill,
    height: 6,
    marginTop: Spacing[5],
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: Colors.cream,
    borderRadius: Radii.pill,
    height: '100%',
  },
  progressLabel: {
    marginTop: Spacing[2],
    opacity: 0.78,
  },
  sectionHeading: {
    marginBottom: Spacing[3],
    marginTop: Spacing[7],
  },
  itemList: {
    gap: Spacing[3],
  },
  itemCard: {
    padding: Spacing[4],
  },
  itemCardCompact: {
    padding: Spacing[3],
  },
  itemCardPurchased: {
    borderColor: '#C7DBCC',
  },
  itemCardUnavailable: {
    backgroundColor: '#F3F2EE',
  },
  itemTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkButton: {
    alignItems: 'center',
    borderColor: Colors.borderStrong,
    borderRadius: Radii.pill,
    borderWidth: 1.5,
    height: 26,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 26,
  },
  checkButtonSelected: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
  },
  checkButtonDisabled: {
    opacity: 0.35,
  },
  itemNameWrap: {
    flex: 1,
  },
  itemNameUnavailable: {
    textDecorationLine: 'line-through',
  },
  availabilityButton: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.sm,
    height: 38,
    justifyContent: 'center',
    marginLeft: Spacing[2],
    width: 38,
  },
  availabilityButtonActive: {
    backgroundColor: Colors.forestSoft,
  },
  itemControls: {
    alignItems: 'flex-end',
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: Spacing[3],
    justifyContent: 'space-between',
    marginTop: Spacing[4],
    paddingTop: Spacing[3],
  },
  priceWrap: {
    alignItems: 'flex-end',
    flexShrink: 0,
    width: 92,
  },
  priceInputWrap: {
    alignItems: 'center',
    borderBottomColor: Colors.borderStrong,
    borderBottomWidth: 1,
    flexDirection: 'row',
    width: '100%',
  },
  currencySymbol: { flexShrink: 0 },
  priceInput: {
    color: Colors.charcoal,
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    minWidth: 0,
    minHeight: 36,
    paddingHorizontal: 4,
    paddingVertical: 2,
    textAlign: 'right',
  },
  priceCaption: { maxWidth: '100%', textAlign: 'right' },
  footer: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    gap: Spacing[3],
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
  },
  footerTotal: {
    flex: 1,
  },
  finishButton: {
    minWidth: 138,
  },
  pressed: {
    opacity: 0.62,
  },
});
