import Feather from '@expo/vector-icons/Feather';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/app-text';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';

type ListActionsSheetProps = {
  visible: boolean;
  listName: string;
  onClose: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

const actions = [
  { key: 'rename', label: 'Rename list', detail: 'Change how this list appears', icon: 'edit-2' },
  { key: 'duplicate', label: 'Duplicate list', detail: 'Create a fresh copy to reuse', icon: 'copy' },
  { key: 'delete', label: 'Delete list', detail: 'Remove it from this session', icon: 'trash-2' },
] as const;

export function ListActionsSheet({
  visible,
  listName,
  onClose,
  onRename,
  onDuplicate,
  onDelete,
}: ListActionsSheetProps) {
  const callbacks = { rename: onRename, duplicate: onDuplicate, delete: onDelete };

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <View style={styles.root}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />
        <SafeAreaView accessibilityViewIsModal edges={['bottom']} style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <AppText numberOfLines={1} variant="heading">{listName}</AppText>
              <AppText tone="muted" variant="caption">Choose what you want to do</AppText>
            </View>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Feather color={Colors.textMuted} name="x" size={19} />
            </Pressable>
          </View>

          {actions.map((action) => {
            const destructive = action.key === 'delete';
            return (
              <Pressable
                accessibilityRole="button"
                key={action.key}
                onPress={callbacks[action.key]}
                style={({ pressed }) => [styles.action, pressed && styles.pressed]}>
                <View style={[styles.actionIcon, destructive && styles.actionIconDanger]}>
                  <Feather
                    color={destructive ? Colors.danger : Colors.forest}
                    name={action.icon}
                    size={19}
                  />
                </View>
                <View style={styles.actionCopy}>
                  <AppText style={destructive && styles.dangerText} variant="bodyMedium">
                    {action.label}
                  </AppText>
                  <AppText tone="muted" variant="caption">{action.detail}</AppText>
                </View>
              </Pressable>
            );
          })}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 31, 25, 0.48)' },
  sheet: {
    alignSelf: 'center',
    backgroundColor: Colors.canvas,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    maxWidth: 520,
    paddingBottom: Spacing[3],
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
  header: { alignItems: 'center', flexDirection: 'row', paddingBottom: Spacing[4], paddingTop: Spacing[4] },
  headerCopy: { flex: 1, marginRight: Spacing[3] },
  closeButton: {
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
    borderRadius: Radii.pill,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  action: {
    alignItems: 'center',
    borderTopColor: Colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 72,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.md,
    height: 40,
    justifyContent: 'center',
    marginRight: Spacing[3],
    width: 40,
  },
  actionIconDanger: { backgroundColor: '#F6E5E1' },
  actionCopy: { flex: 1 },
  dangerText: { color: Colors.danger },
  pressed: { opacity: 0.65 },
});
