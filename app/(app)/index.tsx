import Feather from '@expo/vector-icons/Feather';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { FloatingActionDock } from '@/components/navigation/floating-action-dock';
import { WalkthroughTarget } from '@/components/onboarding/walkthrough-target';
import { ListHistoryRow } from '@/components/shopping/list-history-row';
import { AppDialog } from '@/components/ui/app-dialog';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { Surface } from '@/components/ui/surface';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';
import { useOnboarding } from '@/state/onboarding-context';
import { useShoppingList } from '@/state/shopping-list-context';

export default function HomeScreen() {
  const router = useRouter();
  const { openList, savedLists } = useShoppingList();
  const { showOnboarding } = useOnboarding();
  const [upcomingScreen, setUpcomingScreen] = useState<string>();

  function openSavedList(id: string) {
    const list = openList(id);
    if (list) router.push(list.finishedAt ? '/summary' : '/shopping');
  }

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

          <View style={styles.headerActions}>
            <Pressable
              accessibilityHint="Replays the SariList walkthrough"
              accessibilityLabel="How SariList works"
              accessibilityRole="button"
              onPress={showOnboarding}
              style={({ pressed }) => [styles.helpButton, pressed && styles.rowPressed]}>
              <Feather color={Colors.forest} name="help-circle" size={20} />
            </Pressable>
            <Pressable
              accessibilityLabel="Open profile"
              accessibilityRole="button"
              onPress={() => setUpcomingScreen('Profile')}
              style={({ pressed }) => [styles.avatar, pressed && styles.rowPressed]}>
              <AppText tone="accent" variant="label">
                EM
              </AppText>
            </Pressable>
          </View>
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
          <WalkthroughTarget id="home-create" style={styles.heroTarget}>
            <AppButton
              icon="plus"
              label="Create new list"
              onPress={() => router.push('/new-list')}
              style={styles.heroButton}
              variant="secondary"
            />
          </WalkthroughTarget>
        </Surface>

        <View style={styles.quickActions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/review-scan')}
            style={({ pressed }) => [styles.quickAction, pressed && styles.rowPressed]}>
            <View style={styles.quickActionIcon}>
              <Feather color={Colors.forest} name="camera" size={21} />
            </View>
            <View style={styles.quickActionCopy}>
              <View style={styles.quickActionTitleRow}>
                <AppText variant="bodyMedium">Review a scan</AppText>
              </View>
              <AppText tone="muted" variant="caption">
                Turn a photo into a tidy list
              </AppText>
            </View>
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
            onPress={() => router.push('/lists')}>
            <AppText tone="accent" variant="label">
              See all
            </AppText>
          </Pressable>
        </View>

        <Surface style={styles.listSurface}>
          {savedLists.slice(0, 2).map((list, index, visibleLists) => (
            <ListHistoryRow
              key={list.id}
              list={list}
              onPress={() => openSavedList(list.id)}
              showDivider={index < visibleLists.length - 1}
            />
          ))}
        </Surface>

        <View style={styles.footerNote}>
          <Feather color={Colors.leaf} name="heart" size={14} />
          <AppText tone="muted" variant="caption">
            Small lists, lighter errands.
          </AppText>
        </View>
      </ScrollView>
      <FloatingActionDock
        onCreatePress={() => router.push('/new-list')}
        onHomePress={() => undefined}
        onScanPress={() => router.push('/review-scan')}
      />
      <AppDialog
        mascotExpression="empty"
        message="This part of SariList is planned for a later build. Your current shopping flow is ready to use."
        onClose={() => setUpcomingScreen(undefined)}
        onPrimary={() => setUpcomingScreen(undefined)}
        primaryLabel="Got it"
        title={`${upcomingScreen ?? 'Feature'} is coming soon`}
        visible={Boolean(upcomingScreen)}
      />
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
    alignSelf: 'center',
    maxWidth: 520,
    paddingBottom: 148,
    paddingHorizontal: Spacing[5],
    width: '100%',
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
  headerActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[2],
  },
  helpButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
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
    marginBottom: Spacing[6],
    marginTop: Spacing[8],
    maxWidth: 380,
  },
  introBody: {
    marginTop: Spacing[3],
    maxWidth: 320,
  },
  hero: {
    backgroundColor: Colors.forest,
    borderColor: Colors.forest,
    overflow: 'hidden',
    padding: Spacing[5],
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
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing[4],
    width: 40,
  },
  heroTitle: {
    maxWidth: 260,
  },
  heroBody: {
    marginBottom: Spacing[5],
    marginTop: Spacing[2],
    maxWidth: 300,
    opacity: 0.78,
  },
  heroButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.cream,
    borderColor: Colors.cream,
  },
  heroTarget: {
    alignSelf: 'flex-start',
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
    padding: Spacing[3],
    ...Shadows.soft,
  },
  quickActionIcon: {
    alignItems: 'center',
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.md,
    height: 40,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 40,
  },
  quickActionCopy: {
    flex: 1,
  },
  quickActionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing[2],
  },
  sectionHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
    marginTop: Spacing[8],
  },
  listSurface: {
    overflow: 'hidden',
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
