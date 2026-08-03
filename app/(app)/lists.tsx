import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListHistoryRow } from '@/components/shopping/list-history-row';
import { WalkthroughTarget } from '@/components/onboarding/walkthrough-target';
import { ListActionsSheet } from '@/components/shopping/list-actions-sheet';
import { RenameListDialog } from '@/components/shopping/rename-list-dialog';
import { AppDialog } from '@/components/ui/app-dialog';
import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { MascotIllustration } from '@/components/ui/mascot-illustration';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Surface } from '@/components/ui/surface';
import { Colors, Radii, Spacing } from '@/constants/theme';
import { useShoppingList } from '@/state/shopping-list-context';

type ListFilter = 'all' | 'active' | 'done';

const filters: { label: string; value: ListFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Done', value: 'done' },
];

export default function ListsScreen() {
  const router = useRouter();
  const { deleteList, duplicateList, openList, renameList, savedLists } = useShoppingList();
  const { height, width } = useWindowDimensions();
  const compact = width < 380 || height < 700;
  const [filter, setFilter] = useState<ListFilter>('all');
  const [selectedListId, setSelectedListId] = useState<string>();
  const [actionsVisible, setActionsVisible] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>();

  const selectedList = savedLists.find((list) => list.id === selectedListId);

  const visibleLists = savedLists.filter((list) =>
    filter === 'active' ? !list.finishedAt : filter === 'done' ? Boolean(list.finishedAt) : true,
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  function openSavedList(id: string) {
    const list = openList(id);
    if (list) router.push(list.finishedAt ? '/summary' : '/shopping');
  }

  function showActions(id: string) {
    setSelectedListId(id);
    setActionsVisible(true);
  }

  function duplicateSelectedList() {
    if (!selectedList) return;
    const duplicate = duplicateList(selectedList.id);
    setActionsVisible(false);
    if (duplicate) setFeedbackMessage(`“${duplicate.name}” is ready as a fresh active list.`);
  }

  function saveRenamedList(name: string) {
    if (!selectedList) return;
    renameList(selectedList.id, name);
    setRenameVisible(false);
  }

  function confirmDelete() {
    if (!selectedList) return;
    deleteList(selectedList.id);
    setDeleteVisible(false);
    setSelectedListId(undefined);
  }

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.frame}>
        <View style={[styles.headerWrap, compact && styles.horizontalCompact]}>
          <ScreenHeader
            onBack={goBack}
            subtitle={`${savedLists.length} saved this session`}
            title="Your lists"
          />
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, compact && styles.horizontalCompact]}
          showsVerticalScrollIndicator={false}>
          <View accessibilityRole="radiogroup" style={styles.filters}>
            {filters.map((option) => {
              const selected = option.value === filter;
              return (
                <Pressable
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  key={option.value}
                  onPress={() => setFilter(option.value)}
                  style={({ pressed }) => [
                    styles.filter,
                    selected && styles.filterSelected,
                    pressed && styles.pressed,
                  ]}>
                  <AppText tone={selected ? 'inverse' : 'muted'} variant="label">
                    {option.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {visibleLists.length ? (
            <WalkthroughTarget id="lists-history">
              <Surface style={styles.listSurface}>
                {visibleLists.map((list, index) => (
                  <ListHistoryRow
                    key={list.id}
                    list={list}
                    onMorePress={() => showActions(list.id)}
                    onPress={() => openSavedList(list.id)}
                    showDivider={index < visibleLists.length - 1}
                  />
                ))}
              </Surface>
            </WalkthroughTarget>
          ) : (
            <Surface style={styles.emptyState}>
              <MascotIllustration expression="empty" size={132} />
              <AppText variant="heading">No {filter} lists yet</AppText>
              <AppText style={styles.emptyMessage} tone="muted">
                {filter === 'done'
                  ? 'Completed trips will appear here.'
                  : 'Create a list when you are ready.'}
              </AppText>
              <AppButton
                icon="plus"
                label="Create a list"
                onPress={() => router.push('/new-list')}
                style={styles.emptyButton}
              />
            </Surface>
          )}
        </ScrollView>
        <ListActionsSheet
          listName={selectedList?.name ?? 'List'}
          onClose={() => setActionsVisible(false)}
          onDelete={() => {
            setActionsVisible(false);
            setDeleteVisible(true);
          }}
          onDuplicate={duplicateSelectedList}
          onRename={() => {
            setActionsVisible(false);
            setRenameVisible(true);
          }}
          visible={actionsVisible && Boolean(selectedList)}
        />
        <RenameListDialog
          currentName={selectedList?.name ?? ''}
          onClose={() => setRenameVisible(false)}
          onSave={saveRenamedList}
          visible={renameVisible && Boolean(selectedList)}
        />
        <AppDialog
          mascotExpression="error"
          message={`“${selectedList?.name ?? 'This list'}” will be removed from this session. This cannot be undone.`}
          onClose={() => setDeleteVisible(false)}
          onPrimary={confirmDelete}
          primaryIcon="trash-2"
          primaryLabel="Delete list"
          primaryVariant="danger"
          secondaryLabel="Keep list"
          title="Delete this list?"
          visible={deleteVisible && Boolean(selectedList)}
        />
        <AppDialog
          mascotExpression="success"
          message={feedbackMessage ?? ''}
          onClose={() => setFeedbackMessage(undefined)}
          onPrimary={() => setFeedbackMessage(undefined)}
          primaryIcon="check"
          primaryLabel="Got it"
          title="List duplicated"
          visible={Boolean(feedbackMessage)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: Colors.canvas, flex: 1 },
  frame: { alignSelf: 'center', flex: 1, maxWidth: 520, width: '100%' },
  headerWrap: { paddingHorizontal: Spacing[5] },
  horizontalCompact: { paddingHorizontal: Spacing[4] },
  content: { paddingBottom: Spacing[6], paddingHorizontal: Spacing[5], paddingTop: Spacing[3] },
  filters: {
    backgroundColor: Colors.creamLight,
    borderRadius: Radii.pill,
    flexDirection: 'row',
    gap: Spacing[1],
    padding: Spacing[1],
  },
  filter: {
    alignItems: 'center',
    borderRadius: Radii.pill,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
  },
  filterSelected: { backgroundColor: Colors.forest },
  listSurface: { marginTop: Spacing[4], overflow: 'hidden' },
  emptyState: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    marginTop: Spacing[4],
    padding: Spacing[6],
  },
  emptyMessage: { marginTop: Spacing[2], textAlign: 'center' },
  emptyButton: { marginTop: Spacing[5] },
  pressed: { opacity: 0.68 },
});
