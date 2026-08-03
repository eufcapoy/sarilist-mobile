import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { WalkthroughTarget } from '@/components/onboarding/walkthrough-target';
import { AppButton } from '@/components/ui/button';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Surface } from '@/components/ui/surface';
import { formatQuantityUnit } from '@/constants/shopping-units';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useShoppingList } from '@/state/shopping-list-context';

function formatMoney(value: number) {
  return `\u20B1${Math.abs(value).toLocaleString('en-PH', {
    maximumFractionDigits: 2,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  })}`;
}

export default function SummaryScreen() {
  const router = useRouter();
  const { activeList } = useShoppingList();
  const { height, width } = useWindowDimensions();
  const compact = width < 380 || height < 700;

  const purchasedItems = activeList.items.filter((item) => item.purchased);
  const unavailableItems = activeList.items.filter((item) => item.unavailable);
  const pendingItems = activeList.items.filter((item) => !item.purchased && !item.unavailable);
  const hasBudget = activeList.budget > 0;
  const total = activeList.items.reduce((sum, item) => {
    if (
      !item.purchased ||
      item.unavailable ||
      item.unitPrice === undefined ||
      item.quantity === undefined
    ) {
      return sum;
    }
    return sum + item.quantity * item.unitPrice;
  }, 0);
  const difference = activeList.budget - total;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/shopping');
  }

  function finishAndGoHome() {
    router.replace('/');
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={[styles.headerWrap, compact && styles.horizontalCompact]}>
          <ScreenHeader onBack={goBack} subtitle={activeList.name} title="Trip summary" />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.content,
            compact && styles.contentCompact,
            compact && styles.horizontalCompact,
          ]}
          showsVerticalScrollIndicator={false}>
          <WalkthroughTarget id="summary-total">
            <Surface style={styles.hero}>
              <View style={styles.heroIcon}>
                <Feather color={Colors.forest} name="check" size={22} />
              </View>
              <AppText style={styles.heroLabel} tone="inverse" variant="overline">
                Total spent
              </AppText>
              <AppText style={styles.total} tone="inverse" variant="display">
                {formatMoney(total)}
              </AppText>
              <AppText style={styles.budgetStatus} tone="inverse" variant="caption">
                {hasBudget
                  ? difference >= 0
                    ? `${formatMoney(difference)} left from your budget`
                    : `${formatMoney(Math.abs(difference))} over your budget`
                  : 'This trip had no spending limit'}
              </AppText>
            </Surface>
          </WalkthroughTarget>

          <View style={styles.metrics}>
            <Surface style={styles.metric}>
              <AppText tone="accent" variant="title">
                {purchasedItems.length}
              </AppText>
              <AppText tone="muted" variant="caption">Purchased</AppText>
            </Surface>
            <Surface style={styles.metric}>
              <AppText tone="accent" variant="title">
                {unavailableItems.length}
              </AppText>
              <AppText tone="muted" variant="caption">Unavailable</AppText>
            </Surface>
            <Surface style={styles.metric}>
              <AppText tone="accent" variant="title">
                {pendingItems.length}
              </AppText>
              <AppText tone="muted" variant="caption">Unfinished</AppText>
            </Surface>
          </View>

          <View style={styles.sectionHeading}>
            <AppText variant="heading">Item breakdown</AppText>
            <AppText tone="muted" variant="caption">A quick record of this trip</AppText>
          </View>

          <Surface style={styles.breakdown}>
            {activeList.items.map((item, index) => {
              const subtotal =
                item.purchased &&
                item.quantity !== undefined &&
                item.unitPrice !== undefined &&
                !item.unavailable
                  ? item.quantity * item.unitPrice
                  : undefined;
              const status = item.unavailable
                ? 'Unavailable'
                : item.purchased
                  ? formatQuantityUnit(item.quantity, item.unit)
                  : 'Not completed';

              return (
                <View key={item.id}>
                  <View style={styles.itemRow}>
                    <View
                      style={[
                        styles.statusIcon,
                        item.unavailable && styles.statusIconUnavailable,
                        !item.purchased && !item.unavailable && styles.statusIconPending,
                      ]}>
                      <Feather
                        color={item.unavailable ? Colors.textMuted : Colors.forest}
                        name={item.unavailable ? 'slash' : item.purchased ? 'check' : 'clock'}
                        size={15}
                      />
                    </View>
                    <View style={styles.itemCopy}>
                      <AppText numberOfLines={1} variant="bodyMedium">{item.productName}</AppText>
                      <AppText tone="muted" variant="caption">{status}</AppText>
                    </View>
                    <AppText tone={subtotal === undefined ? 'subtle' : 'default'} variant="bodyMedium">
                      {subtotal === undefined ? '—' : formatMoney(subtotal)}
                    </AppText>
                  </View>
                  {index < activeList.items.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </Surface>
        </ScrollView>

        <View style={[styles.footer, compact && styles.horizontalCompact]}>
          <AppButton
            fullWidth
            icon="home"
            label="Back to home"
            onPress={finishAndGoHome}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.canvas, flex: 1 },
  frame: { alignSelf: 'center', flex: 1, maxWidth: 520, width: '100%' },
  headerWrap: { paddingHorizontal: Spacing[5] },
  content: { paddingBottom: Spacing[6], paddingHorizontal: Spacing[5], paddingTop: Spacing[3] },
  contentCompact: { paddingBottom: Spacing[4], paddingTop: Spacing[2] },
  horizontalCompact: { paddingHorizontal: Spacing[4] },
  hero: {
    alignItems: 'center',
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[6],
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: Radii.pill,
    height: 44,
    justifyContent: 'center',
    marginBottom: Spacing[3],
    width: 44,
  },
  heroLabel: { opacity: 0.76 },
  total: { marginTop: Spacing[1] },
  budgetStatus: { marginTop: Spacing[2], opacity: 0.82 },
  metrics: { flexDirection: 'row', gap: Spacing[2], marginTop: Spacing[3] },
  metric: { alignItems: 'center', flex: 1, paddingHorizontal: Spacing[2], paddingVertical: Spacing[4] },
  sectionHeading: { marginBottom: Spacing[3], marginTop: Spacing[7] },
  breakdown: { overflow: 'hidden' },
  itemRow: { alignItems: 'center', flexDirection: 'row', minHeight: 72, paddingHorizontal: Spacing[4] },
  statusIcon: {
    alignItems: 'center',
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.pill,
    height: 30,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 30,
  },
  statusIconUnavailable: { backgroundColor: '#EEECE7' },
  statusIconPending: { backgroundColor: Colors.creamLight },
  itemCopy: { flex: 1, marginRight: Spacing[3] },
  divider: { backgroundColor: Colors.border, height: StyleSheet.hairlineWidth, marginLeft: 62 },
  footer: {
    backgroundColor: Colors.canvas,
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[3],
  },
});
