import Feather from '@expo/vector-icons/Feather';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import { recentLists, type ShoppingListPreview } from '@/data/mock-lists';

const categoryIcons: Record<ShoppingListPreview['category'], keyof typeof Feather.glyphMap> = {
  market: 'shopping-bag',
  home: 'home',
  occasion: 'coffee',
};

function showUpcomingScreen(screenName: string) {
  Alert.alert(`${screenName} is coming next`, 'The Home experience is ready. This flow will be connected in the next build step.');
}

function RecentListRow({ list }: { list: ShoppingListPreview }) {
  const isComplete = list.completedCount === list.itemCount;
  const progress = `${list.completedCount}/${list.itemCount}`;

  return (
    <Pressable
      accessibilityHint="Opens this shopping list"
      accessibilityRole="button"
      onPress={() => showUpcomingScreen('Shopping Mode')}
      style={({ pressed }) => [styles.listRow, pressed && styles.rowPressed]}>
      <View style={[styles.listIcon, isComplete && styles.listIconComplete]}>
        <Feather
          color={isComplete ? Colors.forest : Colors.leaf}
          name={isComplete ? 'check' : categoryIcons[list.category]}
          size={20}
        />
      </View>

      <View style={styles.listCopy}>
        <AppText numberOfLines={1} variant="bodyMedium">
          {list.title}
        </AppText>
        <AppText numberOfLines={1} tone="muted" variant="caption">
          {list.detail}
        </AppText>
      </View>

      <View style={styles.listMeta}>
        <AppText tone={isComplete ? 'accent' : 'muted'} variant="label">
          {isComplete ? 'Done' : progress}
        </AppText>
        <Feather color={Colors.textSubtle} name="chevron-right" size={18} />
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.brandLockup}>
            <BrandMark />
            <AppText variant="heading">SariList</AppText>
          </View>

          <Pressable
            accessibilityLabel="Open profile"
            accessibilityRole="button"
            onPress={() => showUpcomingScreen('Profile')}
            style={({ pressed }) => [styles.avatar, pressed && styles.rowPressed]}>
            <AppText tone="accent" variant="label">
              EM
            </AppText>
          </Pressable>
        </View>

        <View style={styles.intro}>
          <AppText tone="accent" variant="overline">
            Good morning
          </AppText>
          <AppText variant="display">What do you need today?</AppText>
          <AppText style={styles.introBody} tone="muted">
            Keep every grocery run simple, organized, and easy to finish.
          </AppText>
        </View>

        <Surface elevated style={styles.hero}>
          <View style={styles.heroDecorationLarge} />
          <View style={styles.heroDecorationSmall} />
          <View style={styles.heroIcon}>
            <Feather color={Colors.forest} name="edit-3" size={20} />
          </View>
          <AppText style={styles.heroTitle} tone="inverse" variant="title">
            Start with a fresh list
          </AppText>
          <AppText style={styles.heroBody} tone="inverse">
            Add what you need now. Grouping and shopping mode will keep the trip moving later.
          </AppText>
          <AppButton
            fullWidth
            icon="plus"
            label="Create new list"
            onPress={() => showUpcomingScreen('New List')}
            style={styles.heroButton}
            variant="secondary"
          />
        </Surface>

        <View style={styles.quickActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => showUpcomingScreen('Review Scan')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.rowPressed]}>
            <View style={styles.quickActionIcon}>
              <Feather color={Colors.forest} name="camera" size={21} />
            </View>
            <View style={styles.quickActionCopy}>
              <View style={styles.quickActionTitleRow}>
                <AppText variant="bodyMedium">Review a scan</AppText>
                <View style={styles.soonBadge}>
                  <AppText tone="accent" variant="overline">
                    Soon
                  </AppText>
                </View>
              </View>
              <AppText tone="muted" variant="caption">
                Turn a photo into a tidy list
              </AppText>
            </View>
            <Feather color={Colors.textSubtle} name="arrow-up-right" size={19} />
          </Pressable>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="heading">Recent lists</AppText>
            <AppText tone="muted" variant="caption">
              Pick up where you left off
            </AppText>
          </View>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={() => showUpcomingScreen('All Lists')}>
            <AppText tone="accent" variant="label">
              See all
            </AppText>
          </Pressable>
        </View>

        <Surface style={styles.listSurface}>
          {recentLists.slice(0, 2).map((list, index) => (
            <View key={list.id}>
              <RecentListRow list={list} />
              {index === 0 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </Surface>

        <View style={styles.footerNote}>
          <Feather color={Colors.leaf} name="heart" size={14} />
          <AppText tone="muted" variant="caption">
            Small lists, lighter errands.
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: Colors.canvas,
    flex: 1,
  },
  screen: {
    backgroundColor: Colors.canvas,
    flex: 1,
  },
  content: {
    paddingBottom: Spacing[12],
    paddingHorizontal: Spacing[6],
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing[3],
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[3],
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  intro: {
    marginBottom: Spacing[8],
    marginTop: Spacing[10],
  },
  introBody: {
    marginTop: Spacing[3],
    maxWidth: 320,
  },
  hero: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
    overflow: 'hidden',
    padding: Spacing[6],
  },
  heroDecorationLarge: {
    backgroundColor: 'rgba(243, 232, 210, 0.08)',
    borderRadius: Radii.pill,
    height: 180,
    position: 'absolute',
    right: -88,
    top: -62,
    width: 180,
  },
  heroDecorationSmall: {
    backgroundColor: 'rgba(243, 232, 210, 0.10)',
    borderRadius: Radii.pill,
    bottom: 38,
    height: 70,
    position: 'absolute',
    right: -32,
    width: 70,
  },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: Colors.cream,
    borderRadius: Radii.md,
    height: 42,
    justifyContent: 'center',
    marginBottom: Spacing[6],
    width: 42,
  },
  heroTitle: {
    maxWidth: 260,
  },
  heroBody: {
    marginBottom: Spacing[6],
    marginTop: Spacing[3],
    maxWidth: 300,
    opacity: 0.78,
  },
  heroButton: {
    backgroundColor: Colors.cream,
    borderColor: Colors.cream,
  },
  quickActions: {
    marginTop: Spacing[4],
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    padding: Spacing[4],
    ...Shadows.soft,
  },
  quickActionIcon: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.md,
    height: 44,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 44,
  },
  quickActionCopy: {
    flex: 1,
  },
  quickActionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[2],
  },
  soonBadge: {
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.pill,
    paddingHorizontal: Spacing[2],
    paddingVertical: 2,
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
    marginTop: Spacing[10],
  },
  listSurface: {
    overflow: 'hidden',
  },
  listRow: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 82,
    paddingHorizontal: Spacing[4],
  },
  listIcon: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.md,
    height: 44,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 44,
  },
  listIconComplete: {
    backgroundColor: Colors.forestSoft,
  },
  listCopy: {
    flex: 1,
  },
  listMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[1],
    marginLeft: Spacing[2],
  },
  divider: {
    backgroundColor: Colors.border,
    height: StyleSheet.hairlineWidth,
    marginLeft: 76,
  },
  rowPressed: {
    opacity: 0.68,
  },
  footerNote: {
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: Spacing[2],
    marginTop: Spacing[8],
  },
});
