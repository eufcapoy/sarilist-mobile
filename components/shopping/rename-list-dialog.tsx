import Feather from '@expo/vector-icons/Feather';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { AppButton } from '@/components/ui/button';
import { Colors, Radii, Shadows, Spacing } from '@/constants/theme';

type RenameListDialogProps = {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
};

export function RenameListDialog({ visible, currentName, onClose, onSave }: RenameListDialogProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (visible) setName(currentName);
  }, [currentName, visible]);

  const trimmedName = name.trim();

  return (
    <Modal animationType="fade" onRequestClose={onClose} statusBarTranslucent transparent visible={visible}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.root}>
        <Pressable accessible={false} onPress={onClose} style={styles.backdrop} />
        <View accessibilityViewIsModal style={styles.card}>
          <View style={styles.iconWrap}>
            <Feather color={Colors.forest} name="edit-2" size={21} />
          </View>
          <AppText variant="heading">Rename list</AppText>
          <AppText style={styles.message} tone="muted">Use a short name that is easy to recognize later.</AppText>
          <TextInput
            accessibilityLabel="List name"
            autoFocus
            maxLength={50}
            onChangeText={setName}
            onSubmitEditing={() => {
              if (trimmedName) onSave(trimmedName);
            }}
            returnKeyType="done"
            selectionColor={Colors.forest}
            selectTextOnFocus
            style={styles.input}
            value={name}
          />
          <View style={styles.actions}>
            <AppButton label="Cancel" onPress={onClose} style={styles.action} variant="secondary" />
            <AppButton
              disabled={!trimmedName || trimmedName === currentName.trim()}
              label="Save name"
              onPress={() => onSave(trimmedName)}
              style={styles.action}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: 'center', flex: 1, justifyContent: 'center', padding: Spacing[5] },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 31, 25, 0.48)' },
  card: {
    alignItems: 'center',
    backgroundColor: Colors.canvas,
    borderRadius: Radii.xl,
    maxWidth: 400,
    padding: Spacing[6],
    width: '100%',
    ...Shadows.soft,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: Colors.forestSoft,
    borderRadius: Radii.pill,
    height: 46,
    justifyContent: 'center',
    marginBottom: Spacing[3],
    width: 46,
  },
  message: { marginTop: Spacing[2], textAlign: 'center' },
  input: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface,
    borderColor: Colors.borderStrong,
    borderRadius: Radii.md,
    borderWidth: 1,
    color: Colors.charcoal,
    fontSize: 17,
    fontWeight: '600',
    marginTop: Spacing[5],
    minHeight: 52,
    paddingHorizontal: Spacing[4],
  },
  actions: { alignSelf: 'stretch', flexDirection: 'row', gap: Spacing[3], marginTop: Spacing[5] },
  action: { flex: 1, minWidth: 0 },
});
